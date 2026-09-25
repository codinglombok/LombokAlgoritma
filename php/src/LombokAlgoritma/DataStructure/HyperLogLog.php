<?php

// LombokAlgoritma — HyperLogLog cardinality estimator (SPEC §8.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\DataStructure;

use LombokAlgoritma\AlgoException;
use LombokAlgoritma\Core\U32;
use LombokAlgoritma\Hash\Fnv1a;
use LombokAlgoritma\Hash\Murmur3;

/**
 * HyperLogLog with 2^b one-byte registers (b clamped to [4, 16]); items are hashed with
 * fmix32(FNV-1a-32(UTF-8 bytes)). The integer estimate and the registers are normative.
 */
final class HyperLogLog
{
    private readonly int $b;
    private readonly int $m;
    /** @var list<int> */
    private array $registers;

    /** @param int $b precision, clamped to [4, 16] */
    public function __construct(int $b = 14)
    {
        $this->b = min(16, max(4, $b));
        $this->m = 1 << $this->b;
        $this->registers = array_fill(0, $this->m, 0);
    }

    public function add(string $item): void
    {
        $h = Murmur3::fmix32(Fnv1a::hash32($item));
        $j = $h >> (32 - $this->b);
        $w = ($h << $this->b) & U32::MASK;
        $rho = $w === 0 ? 32 - $this->b + 1 : U32::clz($w) + 1;
        if ($rho > $this->registers[$j]) {
            $this->registers[$j] = $rho;
        }
    }

    /** Estimated number of distinct items (bias-corrected, rounded half up). */
    public function count(): int
    {
        $m = $this->m;
        $alpha = match ($m) {
            16 => 0.673,
            32 => 0.697,
            64 => 0.709,
            default => 0.7213 / (1 + 1.079 / $m),
        };
        $sum = 0.0;
        $zeros = 0;
        foreach ($this->registers as $r) {
            $sum += 2 ** -$r;
            if ($r === 0) {
                $zeros++;
            }
        }
        $estimate = (($alpha * $m) * $m) / $sum;
        if ($estimate <= 2.5 * $m) {
            if ($zeros > 0) {
                $estimate = $m * log($m / $zeros);
            }
        } elseif ($estimate > 4294967296 / 30) {
            $estimate = -4294967296 * log(1 - $estimate / 4294967296);
        }
        $floor = floor($estimate);
        return (int) ($estimate - $floor >= 0.5 ? $floor + 1 : $floor);
    }

    /** The 2^b registers, one byte each in index order (SPEC §8.2). */
    public function registersBytes(): string
    {
        return pack('C*', ...$this->registers);
    }

    public function precision(): int
    {
        return $this->b;
    }

    /**
     * Union estimator: per-register maximum.
     *
     * @throws AlgoException INVALID_INPUT for a different precision
     */
    public function merge(self $other): self
    {
        if ($this->b !== $other->b) {
            throw AlgoException::invalidInput('HyperLogLog.merge: different precision');
        }
        $r = new self($this->b);
        foreach ($this->registers as $i => $v) {
            $r->registers[$i] = max($v, $other->registers[$i]);
        }
        return $r;
    }
}

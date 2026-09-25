<?php

// LombokAlgoritma — Bloom filter (SPEC §8.1)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\DataStructure;

use LombokAlgoritma\AlgoException;
use LombokAlgoritma\Hash\Fnv1a;
use LombokAlgoritma\Hash\Murmur3;

/**
 * Bloom filter with m bits and k hash functions (Kirsch–Mitzenmacher double hashing):
 * h1 = FNV-1a-32(item), h2 = MurmurHash3_x86_32(item, 0x9747b28c), posᵢ = (h1 + i·h2) mod m;
 * bit p is bit (p mod 8), LSB first, of byte ⌊p/8⌋. Items are hashed as their bytes (UTF-8).
 */
final class BloomFilter
{
    /** @var array<int, int> */
    private array $bits;

    private function __construct(private readonly int $m, private readonly int $k)
    {
        $this->bits = array_fill(0, intdiv($m + 7, 8), 0);
    }

    /**
     * Filter with exactly m bits (1 ≤ m < 2^32) and k hash functions (1 ≤ k ≤ 64) — portable.
     *
     * @throws AlgoException OUT_OF_RANGE for m or k outside those ranges
     */
    public static function withParams(int $m, int $k): self
    {
        if ($m < 1 || $m >= 0x100000000 || $k < 1 || $k > 64) {
            throw AlgoException::outOfRange('BloomFilter.withParams: need integer 1 ≤ m < 2^32 and 1 ≤ k ≤ 64');
        }
        return new self($m, $k);
    }

    /**
     * Filter sized for `$expectedItems` at `$falsePositiveRate`: m = ⌈−n·ln p / ln²2⌉,
     * k = max(1, round(m/n·ln 2)). Uses `log`, so m and k are NOT normative across ports.
     *
     * @throws AlgoException OUT_OF_RANGE unless n ≥ 1 and 0 < p < 1
     */
    public static function forCapacity(int $expectedItems, float $falsePositiveRate = 0.01): self
    {
        if ($expectedItems < 1 || !($falsePositiveRate > 0 && $falsePositiveRate < 1)) {
            throw AlgoException::outOfRange('BloomFilter: need expectedItems ≥ 1 and 0 < falsePositiveRate < 1');
        }
        $m = (int) ceil((-$expectedItems * log($falsePositiveRate)) / (M_LN2 * M_LN2));
        $k = max(1, (int) round(($m / $expectedItems) * M_LN2));
        return new self($m, $k);
    }

    /** @return list<int> */
    private function positions(string $item): array
    {
        $h1 = Fnv1a::hash32($item);
        $h2 = Murmur3::hash32($item, 0x9747b28c);
        $out = [];
        for ($i = 0; $i < $this->k; $i++) {
            $out[] = ($h1 + $i * $h2) % $this->m;
        }
        return $out;
    }

    public function add(string $item): void
    {
        foreach ($this->positions($item) as $p) {
            $this->bits[$p >> 3] |= 1 << ($p & 7);
        }
    }

    /** `false` ⇒ definitely absent; `true` ⇒ probably present. */
    public function has(string $item): bool
    {
        foreach ($this->positions($item) as $p) {
            if ((($this->bits[$p >> 3] >> ($p & 7)) & 1) === 0) {
                return false;
            }
        }
        return true;
    }

    /** Number of set bits. */
    public function setBits(): int
    {
        $c = 0;
        foreach ($this->bits as $b) {
            $c += substr_count(decbin($b), '1');
        }
        return $c;
    }

    /** Estimated false-positive rate (setBits / m)^k. */
    public function estimatedFpr(): float
    {
        return ($this->setBits() / $this->m) ** $this->k;
    }

    /** The bit array (⌈m/8⌉ bytes, SPEC §8.1 layout). */
    public function toBytes(): string
    {
        return pack('C*', ...$this->bits);
    }

    public function size(): int
    {
        return $this->m;
    }

    public function hashCount(): int
    {
        return $this->k;
    }
}

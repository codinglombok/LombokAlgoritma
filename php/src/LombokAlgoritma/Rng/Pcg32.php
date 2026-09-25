<?php

// LombokAlgoritma — PCG32, PCG-XSH-RR 64/32 (SPEC §5.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Rng;

use LombokAlgoritma\AlgoException;
use LombokAlgoritma\Core\U32;
use LombokAlgoritma\Core\U64;

/**
 * PCG32 per the pcg-c reference `pcg32_srandom_r(initstate, initseq)` (O'Neill 2014).
 * Deterministic, NOT for secrets.
 */
final class Pcg32
{
    public const DEFAULT_STATE = '9600629759793949339'; // 0x853c49e6748fea9b
    public const DEFAULT_SEQ = '15726070495360670683'; // 0xda3e39cb94b95bdb
    private const MULT = 6364136223846793005;

    private int $state = 0;
    private readonly int $inc;

    public function __construct(
        int|string|\GMP $initState = self::DEFAULT_STATE,
        int|string|\GMP $initSeq = self::DEFAULT_SEQ,
    ) {
        $this->inc = (U64::from($initSeq) << 1) | 1;
        $this->step();
        $this->state = U64::add($this->state, U64::from($initState));
        $this->step();
    }

    private function step(): void
    {
        $this->state = U64::add(U64::mul($this->state, self::MULT), $this->inc);
    }

    /** Next 32-bit unsigned output. */
    public function next(): int
    {
        $old = $this->state;
        $this->step();
        $xs = U64::shr(U64::shr($old, 18) ^ $old, 27) & U32::MASK;
        $rot = U64::shr($old, 59);
        return U32::rotr($xs, $rot);
    }

    /**
     * Unbiased integer in [0, bound) — pcg32_boundedrand_r.
     *
     * @throws AlgoException OUT_OF_RANGE unless 1 ≤ bound ≤ 2^32 − 1
     */
    public function nextBounded(int $bound): int
    {
        if ($bound < 1 || $bound > U32::MASK) {
            throw AlgoException::outOfRange('nextBounded: bound must be an integer in [1, 2^32)');
        }
        $threshold = (0x100000000 - $bound) % $bound;
        while (true) {
            $r = $this->next();
            if ($r >= $threshold) {
                return $r % $bound;
            }
        }
    }

    /** Float in [0, 1) with 32 bits of precision: next() / 2^32. */
    public function nextFloat(): float
    {
        return $this->next() / 4294967296.0;
    }
}

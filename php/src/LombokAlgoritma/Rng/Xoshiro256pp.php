<?php

// LombokAlgoritma — xoshiro256++ (SPEC §5.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Rng;

use LombokAlgoritma\AlgoException;
use LombokAlgoritma\Core\U64;

/**
 * xoshiro256++ (Blackman & Vigna, prng.di.unimi.it/xoshiro256plusplus.c), state seeded with four
 * successive SplitMix64 outputs. Deterministic, NOT for secrets.
 */
final class Xoshiro256pp
{
    public const DEFAULT_SEED = 0x123456789abcdef0;

    private int $s0;
    private int $s1;
    private int $s2;
    private int $s3;

    /** @param int|string|\GMP $seed any integer, reduced modulo 2^64 */
    public function __construct(int|string|\GMP $seed = self::DEFAULT_SEED)
    {
        $sm = new SplitMix64($seed);
        $this->s0 = $sm->next();
        $this->s1 = $sm->next();
        $this->s2 = $sm->next();
        $this->s3 = $sm->next();
    }

    /** Next 64-bit output (u64 bit pattern). */
    public function next(): int
    {
        $s0 = $this->s0;
        $s1 = $this->s1;
        $s2 = $this->s2;
        $s3 = $this->s3;
        $result = U64::add(U64::rotl(U64::add($s0, $s3), 23), $s0);
        $t = $s1 << 17;
        $s2 ^= $s0;
        $s3 ^= $s1;
        $s1 ^= $s2;
        $s0 ^= $s3;
        $s2 ^= $t;
        $s3 = U64::rotl($s3, 45);
        $this->s0 = $s0;
        $this->s1 = $s1;
        $this->s2 = $s2;
        $this->s3 = $s3;
        return $result;
    }

    /** Float in [0, 1): (next() ≫ 11) / 2^53 (exact). */
    public function nextFloat(): float
    {
        return U64::shr($this->next(), 11) / 9007199254740992.0;
    }

    /**
     * Unbiased integer in [0, n) by rejection sampling (threshold = 2^64 mod n).
     *
     * @throws AlgoException OUT_OF_RANGE unless 1 ≤ n ≤ 2^53 − 1
     */
    public function nextInt(int $n): int
    {
        if ($n < 1 || $n > 9007199254740991) {
            throw AlgoException::outOfRange('nextInt: n must be an integer in [1, 2^53)');
        }
        $threshold = U64::mod(-$n, $n); // (2^64 − n) mod n = 2^64 mod n
        while (true) {
            $r = $this->next();
            if ($r < 0 || $r >= $threshold) {
                return U64::mod($r, $n);
            }
        }
    }
}

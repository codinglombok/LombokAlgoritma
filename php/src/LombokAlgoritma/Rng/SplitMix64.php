<?php

// LombokAlgoritma — SplitMix64 (SPEC §5.1)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Rng;

use LombokAlgoritma\Core\U64;

/**
 * SplitMix64 (Steele, Lea, Flood 2014; prng.di.unimi.it/splitmix64.c). Deterministic, NOT for
 * secrets. Outputs are u64 bit patterns in a PHP int ({@see U64::toHex()} / {@see U64::toDecimal()}).
 */
final class SplitMix64
{
    private const GAMMA = -7046029254386353131; // 0x9e3779b97f4a7c15
    private const M1 = -4658895280553007687; // 0xbf58476d1ce4e5b9
    private const M2 = -7723592293110705685; // 0x94d049bb133111eb

    private int $x;

    /** @param int|string|\GMP $seed any integer, reduced modulo 2^64 */
    public function __construct(int|string|\GMP $seed)
    {
        $this->x = U64::from($seed);
    }

    /** Next 64-bit output. */
    public function next(): int
    {
        $this->x = U64::add($this->x, self::GAMMA);
        $z = $this->x;
        $z = U64::mul($z ^ U64::shr($z, 30), self::M1);
        $z = U64::mul($z ^ U64::shr($z, 27), self::M2);
        return $z ^ U64::shr($z, 31);
    }
}

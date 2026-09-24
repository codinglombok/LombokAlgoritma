<?php

// LombokAlgoritma — PHP Number theory
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Math;

/** Integer number theory; arbitrary precision functions use ext-gmp. */
final class NumberTheory
{
    /** Greatest common divisor (non-negative). */
    public static function gcd(int $a, int $b): int
    {
        $a = abs($a);
        $b = abs($b);
        while ($b !== 0) {
            [$a, $b] = [$b, $a % $b];
        }
        return $a;
    }

    /** Least common multiple (non-negative); lcm(0, x) = 0. */
    public static function lcm(int $a, int $b): int
    {
        if ($a === 0 || $b === 0) {
            return 0;
        }
        return abs(intdiv($a, self::gcd($a, $b)) * $b);
    }

    /** base^exp mod m (arbitrary precision). */
    public static function modPow(\GMP $b, \GMP $e, \GMP $m): \GMP
    {
        return gmp_powm($b, $e, $m);
    }

    /** Inverse of a modulo m, or null when it does not exist. */
    public static function modInverse(\GMP $a, \GMP $m): ?\GMP
    {
        $r = gmp_invert($a, $m);
        return $r === false ? null : $r;
    }

    /** Primality (GMP: trial division + 20 Miller–Rabin rounds; exact below 2^64 per GMP ≥ 6.2 BPSW). */
    public static function isPrime(\GMP $n): bool
    {
        return gmp_prob_prime($n, 20) > 0;
    }

    /**
     * Chinese Remainder Theorem for pairwise-coprime int moduli; result in [0, Π m_i).
     *
     * @param list<int> $remainders
     * @param list<int> $moduli
     * @throws \InvalidArgumentException
     */
    public static function crt(array $remainders, array $moduli): \GMP
    {
        if (count($remainders) !== count($moduli)) {
            throw new \InvalidArgumentException('crt: remainders and moduli must have equal length');
        }
        $big = gmp_init(1);
        foreach ($moduli as $m) {
            $big = gmp_mul($big, $m);
        }
        $x = gmp_init(0);
        foreach ($moduli as $i => $m) {
            $mi = gmp_div_q($big, $m);
            $inv = gmp_invert(gmp_mod($mi, $m), $m);
            if ($inv === false) {
                throw new \InvalidArgumentException('crt: moduli must be pairwise coprime');
            }
            $r = gmp_mod($remainders[$i], $m);
            $x = gmp_mod(gmp_add($x, gmp_mul(gmp_mul($r, $mi), $inv)), $big);
        }
        return $x;
    }
}

<?php

// LombokAlgoritma — number theory: gcd, lcm, extended gcd, modular inverse / power, CRT (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Math;

use LombokAlgoritma\AlgoException;
use LombokAlgoritma\Core\BigInt;

/**
 * Exact integer number theory on arbitrary-precision integers (ext-gmp). Every argument accepts an
 * int, a decimal string or a \GMP; results are \GMP (use {@see BigInt::out()} for SPEC §3.1 output).
 */
final class NumberTheory
{
    /** Greatest common divisor, ≥ 0; gcd(0, 0) = 0. */
    public static function gcd(int|string|\GMP $a, int|string|\GMP $b): \GMP
    {
        return gmp_gcd(BigInt::of($a), BigInt::of($b));
    }

    /** Least common multiple |a / gcd(a, b) · b|; 0 when either is 0. */
    public static function lcm(int|string|\GMP $a, int|string|\GMP $b): \GMP
    {
        $a = BigInt::of($a);
        $b = BigInt::of($b);
        if (gmp_sign($a) === 0 || gmp_sign($b) === 0) {
            return gmp_init(0);
        }
        return gmp_abs(gmp_mul(BigInt::quo($a, gmp_gcd($a, $b)), $b));
    }

    /**
     * Extended Euclid (recursive definition of SPEC §10 with truncated quotient / remainder):
     * a·x + b·y = g.
     *
     * @return array{g: \GMP, x: \GMP, y: \GMP}
     */
    public static function extendedGcd(int|string|\GMP $a, int|string|\GMP $b): array
    {
        $a = BigInt::of($a);
        $b = BigInt::of($b);
        if (gmp_sign($b) === 0) {
            return ['g' => $a, 'x' => gmp_init(1), 'y' => gmp_init(0)];
        }
        $r = self::extendedGcd($b, BigInt::rem($a, $b));
        return [
            'g' => $r['g'],
            'x' => $r['y'],
            'y' => gmp_sub($r['x'], gmp_mul(BigInt::quo($a, $b), $r['y'])),
        ];
    }

    /**
     * Modular inverse in [0, m).
     *
     * @throws AlgoException NO_INVERSE when gcd(a mod m, m) ≠ 1
     */
    public static function modInverse(int|string|\GMP $a, int|string|\GMP $m): \GMP
    {
        $a = BigInt::of($a);
        $m = BigInt::of($m);
        $norm = BigInt::rem(gmp_add(BigInt::rem($a, $m), $m), $m);
        $r = self::extendedGcd($norm, $m);
        if (gmp_cmp($r['g'], 1) !== 0) {
            throw AlgoException::noInverse('No modular inverse: gcd(' . gmp_strval($a) . ', '
                . gmp_strval($m) . ') = ' . gmp_strval($r['g']));
        }
        return BigInt::rem(gmp_add(BigInt::rem($r['x'], $m), $m), $m);
    }

    /**
     * base^exp mod m in [0, m); a negative base is reduced into [0, m) first.
     *
     * @throws AlgoException OUT_OF_RANGE when m < 1 or exp < 0
     */
    public static function modPow(int|string|\GMP $base, int|string|\GMP $exp, int|string|\GMP $m): \GMP
    {
        $base = BigInt::of($base);
        $exp = BigInt::of($exp);
        $m = BigInt::of($m);
        if (gmp_cmp($m, 1) < 0 || gmp_sign($exp) < 0) {
            throw AlgoException::outOfRange('modPow: need m ≥ 1 and exp ≥ 0');
        }
        if (gmp_cmp($m, 1) === 0) {
            return gmp_init(0);
        }
        $result = gmp_init(1);
        $base = gmp_mod($base, $m);
        while (gmp_sign($exp) > 0) {
            if (gmp_testbit($exp, 0)) {
                $result = gmp_mod(gmp_mul($result, $base), $m);
            }
            $exp = gmp_div_q($exp, 2);
            $base = gmp_mod(gmp_mul($base, $base), $m);
        }
        return $result;
    }

    /**
     * Chinese Remainder Theorem: the unique x in [0, Π mᵢ) with x ≡ rᵢ (mod mᵢ).
     *
     * @param list<int|string|\GMP> $remainders
     * @param list<int|string|\GMP> $moduli
     * @throws AlgoException INVALID_INPUT on a length mismatch, NOT_COPRIME for non-coprime moduli
     */
    public static function crt(array $remainders, array $moduli): \GMP
    {
        if (count($remainders) !== count($moduli)) {
            throw AlgoException::invalidInput('crt: remainders and moduli must have equal length');
        }
        $mods = array_map(BigInt::of(...), $moduli);
        $big = gmp_init(1);
        foreach ($mods as $mi) {
            $big = gmp_mul($big, $mi);
        }
        $x = gmp_init(0);
        foreach ($mods as $i => $mi) {
            $bigI = BigInt::quo($big, $mi);
            $r = self::extendedGcd(BigInt::rem($bigI, $mi), $mi);
            if (gmp_cmp(gmp_abs($r['g']), 1) !== 0) {
                throw AlgoException::notCoprime('crt: moduli must be pairwise coprime');
            }
            $inv = BigInt::rem(gmp_add(BigInt::rem($r['x'], $mi), $mi), $mi);
            $ri = BigInt::rem(gmp_add(BigInt::rem(BigInt::of($remainders[$i]), $mi), $mi), $mi);
            $x = BigInt::rem(gmp_add($x, gmp_mul(BigInt::rem(gmp_mul($ri, $bigI), $big), $inv)), $big);
        }
        return BigInt::rem(gmp_add(BigInt::rem($x, $big), $big), $big);
    }
}

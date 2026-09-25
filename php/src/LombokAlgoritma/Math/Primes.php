<?php

// LombokAlgoritma — primality, sieves and factorisation (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Math;

use LombokAlgoritma\AlgoException;
use LombokAlgoritma\Core\BigInt;

/** Deterministic Miller–Rabin, Eratosthenes sieves and Pollard-rho factorisation. */
final class Primes
{
    /** The 12 first primes: deterministic Miller–Rabin witnesses for n < 3.3·10^24. */
    private const WITNESSES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

    /** Deterministic Miller–Rabin with witnesses 2 … 37; n < 2 → false. */
    public static function isPrime(int|string|\GMP $n): bool
    {
        $n = BigInt::of($n);
        if (gmp_cmp($n, 2) < 0) {
            return false;
        }
        if (gmp_cmp($n, 7) <= 0) {
            return in_array(gmp_intval($n), [2, 3, 5, 7], true);
        }
        if (gmp_sign(gmp_mod($n, 2)) === 0 || gmp_sign(gmp_mod($n, 3)) === 0) {
            return false;
        }
        $nm1 = gmp_sub($n, 1);
        $d = $nm1;
        $r = 0;
        while (!gmp_testbit($d, 0)) {
            $d = gmp_div_q($d, 2);
            $r++;
        }
        foreach (self::WITNESSES as $a) {
            if (gmp_cmp($a, $n) >= 0) {
                continue;
            }
            $x = gmp_powm($a, $d, $n);
            if (gmp_cmp($x, 1) === 0 || gmp_cmp($x, $nm1) === 0) {
                continue;
            }
            $composite = true;
            for ($i = 0; $i < $r - 1; $i++) {
                $x = gmp_mod(gmp_mul($x, $x), $n);
                if (gmp_cmp($x, $nm1) === 0) {
                    $composite = false;
                    break;
                }
            }
            if ($composite) {
                return false;
            }
        }
        return true;
    }

    /** Smallest prime ≥ n (n ≤ 2 → 2). */
    public static function nextPrime(int|string|\GMP $n): \GMP
    {
        $n = BigInt::of($n);
        if (gmp_cmp($n, 2) <= 0) {
            return gmp_init(2);
        }
        $c = gmp_testbit($n, 0) ? $n : gmp_add($n, 1);
        while (!self::isPrime($c)) {
            $c = gmp_add($c, 2);
        }
        return $c;
    }

    /**
     * Primes ≤ n, ascending.
     *
     * @return list<int>
     */
    public static function sieve(int $n): array
    {
        if ($n < 2) {
            return [];
        }
        $composite = array_fill(0, $n + 1, false);
        for ($i = 2; $i * $i <= $n; $i++) {
            if (!$composite[$i]) {
                for ($j = $i * $i; $j <= $n; $j += $i) {
                    $composite[$j] = true;
                }
            }
        }
        $primes = [];
        for ($i = 2; $i <= $n; $i++) {
            if (!$composite[$i]) {
                $primes[] = $i;
            }
        }
        return $primes;
    }

    /**
     * Primes in [lo, hi], ascending (segmented sieve).
     *
     * @return list<int>
     */
    public static function segmentedSieve(int $lo, int $hi): array
    {
        if ($hi < $lo) {
            return [];
        }
        $base = self::sieve((int) ceil(sqrt($hi)));
        $size = $hi - $lo + 1;
        $composite = array_fill(0, $size, false);
        foreach ($base as $p) {
            $start = max($p * $p, (int) ceil($lo / $p) * $p);
            if ($start === $p) {
                $start += $p;
            }
            for ($j = $start; $j <= $hi; $j += $p) {
                $composite[$j - $lo] = true;
            }
        }
        $primes = [];
        for ($i = 0; $i < $size; $i++) {
            if (!$composite[$i] && $lo + $i > 1) {
                $primes[] = $lo + $i;
            }
        }
        return $primes;
    }

    /**
     * Pollard's rho (Floyd cycle detection, x₀ = 2, c = 1, 2, …): a non-trivial factor of a
     * composite n.
     *
     * @throws AlgoException INVALID_INPUT when n < 4 or n is prime
     */
    public static function pollardRho(int|string|\GMP $n): \GMP
    {
        $n = BigInt::of($n);
        if (gmp_cmp($n, 4) < 0 || self::isPrime($n)) {
            throw AlgoException::invalidInput('pollardRho: n must be composite');
        }
        if (!gmp_testbit($n, 0)) {
            return gmp_init(2);
        }
        for ($c = 1;; $c++) {
            $x = gmp_init(2);
            $y = gmp_init(2);
            $d = gmp_init(1);
            while (gmp_cmp($d, 1) === 0) {
                $x = gmp_mod(gmp_add(gmp_mul($x, $x), $c), $n);
                $y = gmp_mod(gmp_add(gmp_mul($y, $y), $c), $n);
                $y = gmp_mod(gmp_add(gmp_mul($y, $y), $c), $n);
                $d = gmp_gcd(gmp_sub($x, $y), $n);
            }
            if (gmp_cmp($d, $n) !== 0) {
                return $d;
            }
        }
    }

    /**
     * Prime factors ascending with multiplicity; the sign is ignored; |n| ≤ 1 → [].
     *
     * @return list<\GMP>
     */
    public static function factorize(int|string|\GMP $n): array
    {
        $n = gmp_abs(BigInt::of($n));
        $out = [];
        foreach (self::WITNESSES as $p) {
            while (gmp_sign(gmp_mod($n, $p)) === 0 && gmp_cmp($n, 0) > 0) {
                $out[] = gmp_init($p);
                $n = gmp_div_q($n, $p);
            }
        }
        $stack = gmp_cmp($n, 1) > 0 ? [$n] : [];
        while ($stack !== []) {
            $m = array_pop($stack);
            if (self::isPrime($m)) {
                $out[] = $m;
                continue;
            }
            $d = self::pollardRho($m);
            $stack[] = $d;
            $stack[] = gmp_div_q($m, $d);
        }
        usort($out, static fn (\GMP $a, \GMP $b): int => gmp_cmp($a, $b));
        return $out;
    }
}

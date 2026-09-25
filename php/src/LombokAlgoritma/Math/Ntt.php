<?php

// LombokAlgoritma — Number Theoretic Transform (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Math;

use LombokAlgoritma\AlgoException;
use LombokAlgoritma\Core\BigInt;

/**
 * Iterative Cooley–Tukey NTT over Z/pZ (default p = 998244353 = 119·2^23 + 1, g = 3).
 * Exact integer arithmetic; products stay below 2^63 for p < 2^31.
 */
final class Ntt
{
    public const MOD = 998244353;
    public const G = 3;

    /**
     * Forward NTT, natural order: Aₖ = Σⱼ aⱼ·ω^(jk) mod p with ω = g^((p−1)/n).
     *
     * @param list<int|string|\GMP> $a
     * @return list<int>
     * @throws AlgoException INVALID_INPUT unless the length is a power of two dividing p − 1
     */
    public static function transform(array $a, int $mod = self::MOD, int $g = self::G): array
    {
        $n = count($a);
        if ($n === 0 || ($n & ($n - 1)) !== 0) {
            throw AlgoException::invalidInput('ntt: length must be a power of two');
        }
        if (($mod - 1) % $n !== 0) {
            throw AlgoException::invalidInput('ntt: length must divide mod − 1');
        }
        $r = [];
        foreach ($a as $v) {
            $r[] = gmp_intval(gmp_mod(BigInt::of($v), $mod));
        }
        for ($i = 1, $j = 0; $i < $n; $i++) {
            $bit = $n >> 1;
            for (; ($j & $bit) !== 0; $bit >>= 1) {
                $j ^= $bit;
            }
            $j ^= $bit;
            if ($i < $j) {
                [$r[$i], $r[$j]] = [$r[$j], $r[$i]];
            }
        }
        for ($len = 2; $len <= $n; $len <<= 1) {
            $w = gmp_intval(gmp_powm($g, intdiv($mod - 1, $len), $mod));
            $half = $len >> 1;
            for ($i = 0; $i < $n; $i += $len) {
                $wn = 1;
                for ($j = 0; $j < $half; $j++) {
                    $u = $r[$i + $j];
                    $v = ($r[$i + $j + $half] * $wn) % $mod;
                    $r[$i + $j] = ($u + $v) % $mod;
                    $r[$i + $j + $half] = ($u - $v + $mod) % $mod;
                    $wn = ($wn * $w) % $mod;
                }
            }
        }
        return $r;
    }

    /**
     * Inverse NTT.
     *
     * @param list<int|string|\GMP> $a
     * @return list<int>
     */
    public static function inverse(array $a, int $mod = self::MOD, int $g = self::G): array
    {
        $gInv = gmp_intval(gmp_powm($g, $mod - 2, $mod));
        $nInv = gmp_intval(gmp_powm(count($a), $mod - 2, $mod));
        return array_map(
            static fn (int $x): int => ($x * $nInv) % $mod,
            self::transform($a, $mod, $gInv),
        );
    }

    /**
     * Polynomial product mod p, length |a| + |b| − 1.
     *
     * @param list<int|string|\GMP> $a
     * @param list<int|string|\GMP> $b
     * @return list<int>
     */
    public static function polyMul(array $a, array $b, int $mod = self::MOD): array
    {
        $n = 1;
        while ($n < count($a) + count($b)) {
            $n <<= 1;
        }
        $fa = array_pad($a, $n, 0);
        $fb = array_pad($b, $n, 0);
        $ta = self::transform($fa, $mod);
        $tb = self::transform($fb, $mod);
        $tc = [];
        foreach ($ta as $i => $v) {
            $tc[] = ($v * $tb[$i]) % $mod;
        }
        return array_slice(self::inverse($tc, $mod), 0, count($a) + count($b) - 1);
    }
}

<?php

// LombokAlgoritma — Karatsuba multiplication (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Math;

use LombokAlgoritma\Core\BigInt;

/** Karatsuba multiplication on decimal halves, O(n^1.585); only the (exact) product is normative. */
final class Karatsuba
{
    public static function multiply(int|string|\GMP $x, int|string|\GMP $y): \GMP
    {
        $x = BigInt::of($x);
        $y = BigInt::of($y);
        if (gmp_sign($x) < 0) {
            return gmp_neg(self::multiply(gmp_neg($x), $y));
        }
        if (gmp_sign($y) < 0) {
            return gmp_neg(self::multiply($x, gmp_neg($y)));
        }
        if (gmp_cmp($x, 1000) < 0 || gmp_cmp($y, 1000) < 0) {
            return gmp_mul($x, $y);
        }
        $n = max(strlen(gmp_strval($x)), strlen(gmp_strval($y)));
        $b = gmp_pow(10, intdiv($n + 1, 2));
        [$x1, $x0] = gmp_div_qr($x, $b);
        [$y1, $y0] = gmp_div_qr($y, $b);
        $z0 = self::multiply($x0, $y0);
        $z2 = self::multiply($x1, $y1);
        $z1 = gmp_sub(gmp_sub(self::multiply(gmp_add($x0, $x1), gmp_add($y0, $y1)), $z2), $z0);
        return gmp_add(gmp_add(gmp_mul(gmp_mul($z2, $b), $b), gmp_mul($z1, $b)), $z0);
    }
}

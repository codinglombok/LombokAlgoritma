<?php

// LombokAlgoritma — wrapping unsigned 64-bit arithmetic on PHP ints
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Core;

use LombokAlgoritma\AlgoException;

/**
 * u64 values are carried in PHP's signed 64-bit int as the same two's-complement bit pattern.
 * `+`, `-` and `*` on PHP ints overflow to float, so every operation here is computed on 32-bit
 * (or 16-bit) halves; shifts and bitwise operators already wrap.
 */
final class U64
{
    private const M32 = 0xFFFFFFFF;

    /** (a + b) mod 2^64. */
    public static function add(int $a, int $b): int
    {
        $lo = ($a & self::M32) + ($b & self::M32);
        $hi = (($a >> 32) & self::M32) + (($b >> 32) & self::M32) + ($lo >> 32);
        return (($hi & self::M32) << 32) | ($lo & self::M32);
    }

    /** (a − b) mod 2^64. */
    public static function sub(int $a, int $b): int
    {
        return self::add($a, self::add(~$b, 1));
    }

    /** (a · b) mod 2^64. */
    public static function mul(int $a, int $b): int
    {
        $a0 = $a & self::M32;
        $a1 = ($a >> 32) & self::M32;
        $b0 = $b & self::M32;
        $b1 = ($b >> 32) & self::M32;
        $low = self::mulFull32($a0, $b0);
        $cross = (U32::mul($a0, $b1) + U32::mul($a1, $b0)) & self::M32;
        return self::add($low, $cross << 32);
    }

    /** Full 64-bit product of two u32 values (mod 2^64, i.e. exact). */
    private static function mulFull32(int $x, int $y): int
    {
        $t1 = ($x >> 16) * $y; // < 2^48
        $t2 = ($x & 0xFFFF) * $y; // < 2^48
        return self::add($t1 << 16, $t2);
    }

    /** Logical shift right by n ∈ [0, 64). */
    public static function shr(int $x, int $n): int
    {
        if ($n === 0) {
            return $x;
        }
        return ($x >> $n) & (PHP_INT_MAX >> ($n - 1));
    }

    /** Rotate left by r ∈ [0, 64). */
    public static function rotl(int $x, int $r): int
    {
        $r &= 63;
        if ($r === 0) {
            return $x;
        }
        return ($x << $r) | self::shr($x, 64 - $r);
    }

    /** Unsigned comparison: −1, 0 or 1. */
    public static function compare(int $a, int $b): int
    {
        return ($a ^ PHP_INT_MIN) <=> ($b ^ PHP_INT_MIN);
    }

    /** x mod n for u64 `x` and 1 ≤ n ≤ PHP_INT_MAX. */
    public static function mod(int $x, int $n): int
    {
        if ($x >= 0) {
            return $x % $n;
        }
        $high = (PHP_INT_MAX % $n + 1) % $n; // 2^63 mod n
        return (($x & PHP_INT_MAX) % $n + $high) % $n;
    }

    /** 16 lowercase hex digits. */
    public static function toHex(int $x): string
    {
        return sprintf('%016x', $x);
    }

    /** Unsigned value as a GMP integer in [0, 2^64). */
    public static function toGmp(int $x): \GMP
    {
        $g = gmp_init($x);
        return $x < 0 ? gmp_add($g, gmp_pow(2, 64)) : $g;
    }

    /** Unsigned decimal string. */
    public static function toDecimal(int $x): string
    {
        return gmp_strval(self::toGmp($x));
    }

    /**
     * Any integer (int, decimal string or GMP) reduced modulo 2^64, as a u64 bit pattern.
     *
     * @throws AlgoException INVALID_INPUT for a string that is not a decimal integer
     */
    public static function from(int|string|\GMP $v): int
    {
        if (is_int($v)) {
            return $v;
        }
        $g = $v instanceof \GMP ? $v : BigInt::parse($v);
        $g = gmp_mod($g, gmp_pow(2, 64));
        if (gmp_cmp($g, gmp_pow(2, 63)) >= 0) {
            $g = gmp_sub($g, gmp_pow(2, 64));
        }
        return gmp_intval($g);
    }

    /** Little-endian u64 at byte offset `$i` of `$d`. */
    public static function readLe(string $d, int $i): int
    {
        return U32::readLe($d, $i) | (U32::readLe($d, $i + 4) << 32);
    }
}

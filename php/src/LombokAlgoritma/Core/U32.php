<?php

// LombokAlgoritma — wrapping unsigned 32-bit arithmetic on PHP ints
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Core;

/**
 * Unsigned 32-bit helpers. Values are PHP ints in [0, 2^32); products are split into 16-bit halves
 * so no intermediate ever exceeds 2^49 (PHP ints overflow to float on `*`).
 */
final class U32
{
    public const MASK = 0xFFFFFFFF;

    /** (a + b) mod 2^32. */
    public static function add(int $a, int $b): int
    {
        return (($a & self::MASK) + ($b & self::MASK)) & self::MASK;
    }

    /** (a · b) mod 2^32. */
    public static function mul(int $a, int $b): int
    {
        $a &= self::MASK;
        $b &= self::MASK;
        $lo = ($a & 0xFFFF) * $b;
        $hi = (($a >> 16) * $b) & 0xFFFF;
        return ($lo + ($hi << 16)) & self::MASK;
    }

    /** Rotate left by r ∈ [0, 32). */
    public static function rotl(int $x, int $r): int
    {
        $x &= self::MASK;
        $r &= 31;
        if ($r === 0) {
            return $x;
        }
        return (($x << $r) | ($x >> (32 - $r))) & self::MASK;
    }

    /** Rotate right by r ∈ [0, 32). */
    public static function rotr(int $x, int $r): int
    {
        return self::rotl($x, (32 - ($r & 31)) & 31);
    }

    /** Count leading zeros (32 for 0). */
    public static function clz(int $x): int
    {
        $x &= self::MASK;
        if ($x === 0) {
            return 32;
        }
        $n = 0;
        while (($x & 0x80000000) === 0) {
            $x <<= 1;
            $n++;
        }
        return $n;
    }

    /** Little-endian u32 at byte offset `$i` of `$d`. */
    public static function readLe(string $d, int $i): int
    {
        return ord($d[$i]) | (ord($d[$i + 1]) << 8) | (ord($d[$i + 2]) << 16) | (ord($d[$i + 3]) << 24);
    }
}

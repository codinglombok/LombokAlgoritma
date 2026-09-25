<?php

// LombokAlgoritma — xxHash64 / XXH64 (SPEC §12)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Hash;

use LombokAlgoritma\Core\U64;

/**
 * XXH64 per the reference specification (doc/xxhash_spec.md "XXH64 Algorithm Description").
 * All arithmetic is wrapping u64 via {@see U64}.
 */
final class XxHash64
{
    private const P1 = -7046029288634856825; // 0x9e3779b185ebca87
    private const P2 = -4417276706812531889; // 0xc2b2ae3d27d4eb4f
    private const P3 = 1609587929392839161; // 0x165667b19e3779f9
    private const P4 = -8796714831421723037; // 0x85ebca77c2b2ae63
    private const P5 = 2870177450012600261; // 0x27d4eb2f165667c5

    /**
     * XXH64 of `$data` with a 64-bit seed (int, decimal string or GMP, reduced mod 2^64), as 16
     * lowercase hex digits.
     */
    public static function hash(string $data, int|string|\GMP $seed = 0): string
    {
        return U64::toHex(self::hashInt($data, $seed));
    }

    /** XXH64 as a u64 bit pattern (PHP int). */
    public static function hashInt(string $data, int|string|\GMP $seed = 0): int
    {
        $s = U64::from($seed);
        $n = strlen($data);
        $i = 0;
        if ($n >= 32) {
            $v1 = U64::add(U64::add($s, self::P1), self::P2);
            $v2 = U64::add($s, self::P2);
            $v3 = $s;
            $v4 = U64::sub($s, self::P1);
            while ($i + 32 <= $n) {
                $v1 = self::round($v1, U64::readLe($data, $i));
                $v2 = self::round($v2, U64::readLe($data, $i + 8));
                $v3 = self::round($v3, U64::readLe($data, $i + 16));
                $v4 = self::round($v4, U64::readLe($data, $i + 24));
                $i += 32;
            }
            $h = U64::add(
                U64::add(U64::rotl($v1, 1), U64::rotl($v2, 7)),
                U64::add(U64::rotl($v3, 12), U64::rotl($v4, 18)),
            );
            $h = self::mergeRound($h, $v1);
            $h = self::mergeRound($h, $v2);
            $h = self::mergeRound($h, $v3);
            $h = self::mergeRound($h, $v4);
        } else {
            $h = U64::add($s, self::P5);
        }
        $h = U64::add($h, $n);
        while ($i + 8 <= $n) {
            $h ^= self::round(0, U64::readLe($data, $i));
            $h = U64::add(U64::mul(U64::rotl($h, 27), self::P1), self::P4);
            $i += 8;
        }
        if ($i + 4 <= $n) {
            $w = ord($data[$i]) | (ord($data[$i + 1]) << 8) | (ord($data[$i + 2]) << 16)
                | (ord($data[$i + 3]) << 24);
            $h ^= U64::mul($w, self::P1);
            $h = U64::add(U64::mul(U64::rotl($h, 23), self::P2), self::P3);
            $i += 4;
        }
        while ($i < $n) {
            $h ^= U64::mul(ord($data[$i]), self::P5);
            $h = U64::mul(U64::rotl($h, 11), self::P1);
            $i++;
        }
        $h ^= U64::shr($h, 33);
        $h = U64::mul($h, self::P2);
        $h ^= U64::shr($h, 29);
        $h = U64::mul($h, self::P3);
        return $h ^ U64::shr($h, 32);
    }

    private static function round(int $acc, int $lane): int
    {
        return U64::mul(U64::rotl(U64::add($acc, U64::mul($lane, self::P2)), 31), self::P1);
    }

    private static function mergeRound(int $acc, int $val): int
    {
        return U64::add(U64::mul($acc ^ self::round(0, $val), self::P1), self::P4);
    }
}

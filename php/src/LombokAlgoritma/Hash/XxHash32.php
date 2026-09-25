<?php

// LombokAlgoritma — xxHash32 / XXH32 (SPEC §12)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Hash;

use LombokAlgoritma\Core\U32;

/** XXH32 per the reference specification (github.com/Cyan4973/xxHash, doc/xxhash_spec.md). */
final class XxHash32
{
    private const P1 = 0x9e3779b1;
    private const P2 = 0x85ebca77;
    private const P3 = 0xc2b2ae3d;
    private const P4 = 0x27d4eb2f;
    private const P5 = 0x165667b1;

    /** XXH32 of `$data` with a u32 seed, as an unsigned int. */
    public static function hash(string $data, int $seed = 0): int
    {
        $s = $seed & U32::MASK;
        $n = strlen($data);
        $i = 0;
        if ($n >= 16) {
            $v1 = U32::add(U32::add($s, self::P1), self::P2);
            $v2 = U32::add($s, self::P2);
            $v3 = $s;
            $v4 = U32::add($s, -self::P1);
            while ($i + 16 <= $n) {
                $v1 = self::round($v1, U32::readLe($data, $i));
                $v2 = self::round($v2, U32::readLe($data, $i + 4));
                $v3 = self::round($v3, U32::readLe($data, $i + 8));
                $v4 = self::round($v4, U32::readLe($data, $i + 12));
                $i += 16;
            }
            $h = U32::add(
                U32::add(U32::rotl($v1, 1), U32::rotl($v2, 7)),
                U32::add(U32::rotl($v3, 12), U32::rotl($v4, 18)),
            );
        } else {
            $h = U32::add($s, self::P5);
        }
        $h = U32::add($h, $n);
        while ($i + 4 <= $n) {
            $h = U32::add($h, U32::mul(U32::readLe($data, $i), self::P3));
            $h = U32::mul(U32::rotl($h, 17), self::P4);
            $i += 4;
        }
        while ($i < $n) {
            $h = U32::add($h, U32::mul(ord($data[$i]), self::P5));
            $h = U32::mul(U32::rotl($h, 11), self::P1);
            $i++;
        }
        $h ^= $h >> 15;
        $h = U32::mul($h, self::P2);
        $h ^= $h >> 13;
        $h = U32::mul($h, self::P3);
        return $h ^ ($h >> 16);
    }

    private static function round(int $acc, int $lane): int
    {
        return U32::mul(U32::rotl(U32::add($acc, U32::mul($lane, self::P2)), 13), self::P1);
    }
}

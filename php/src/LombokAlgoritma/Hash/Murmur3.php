<?php

// LombokAlgoritma — MurmurHash3_x86_32 (SPEC §12)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Hash;

use LombokAlgoritma\Core\U32;

/** MurmurHash3_x86_32 (Austin Appleby, public-domain reference). Non-cryptographic. */
final class Murmur3
{
    private const C1 = 0xcc9e2d51;
    private const C2 = 0x1b873593;

    /** MurmurHash3_x86_32 of `$data` with a u32 seed, as an unsigned int. */
    public static function hash32(string $data, int $seed = 0): int
    {
        $h = $seed & U32::MASK;
        $n = strlen($data);
        $n4 = $n & ~3;
        for ($i = 0; $i < $n4; $i += 4) {
            $k = U32::mul(U32::rotl(U32::mul(U32::readLe($data, $i), self::C1), 15), self::C2);
            $h ^= $k;
            $h = U32::add(U32::mul(U32::rotl($h, 13), 5), 0xe6546b64);
        }
        $rem = $n - $n4;
        if ($rem > 0) {
            $k = 0;
            for ($i = 0; $i < $rem; $i++) {
                $k |= ord($data[$n4 + $i]) << (8 * $i);
            }
            $h ^= U32::mul(U32::rotl(U32::mul($k, self::C1), 15), self::C2);
        }
        return self::fmix32($h ^ ($n & U32::MASK));
    }

    /** MurmurHash3 32-bit finaliser (fmix32). */
    public static function fmix32(int $h): int
    {
        $h &= U32::MASK;
        $h ^= $h >> 16;
        $h = U32::mul($h, 0x85ebca6b);
        $h ^= $h >> 13;
        $h = U32::mul($h, 0xc2b2ae35);
        return $h ^ ($h >> 16);
    }
}

<?php

// LombokAlgoritma — FNV-1a 32/64-bit (SPEC §12)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Hash;

use LombokAlgoritma\Core\U32;
use LombokAlgoritma\Core\U64;

/** Fowler–Noll–Vo FNV-1a over bytes (a PHP string; UTF-8 for text). Non-cryptographic. */
final class Fnv1a
{
    private const OFFSET64 = -3750763034362895579; // 0xcbf29ce484222325
    private const PRIME64 = 0x100000001b3;

    /** FNV-1a 32-bit as an unsigned int. */
    public static function hash32(string $data): int
    {
        $h = 0x811c9dc5;
        $n = strlen($data);
        for ($i = 0; $i < $n; $i++) {
            $h = U32::mul($h ^ ord($data[$i]), 0x01000193);
        }
        return $h;
    }

    /** FNV-1a 64-bit as a u64 bit pattern (PHP int). */
    public static function hash64Int(string $data): int
    {
        $h = self::OFFSET64;
        $n = strlen($data);
        for ($i = 0; $i < $n; $i++) {
            $h = U64::mul($h ^ ord($data[$i]), self::PRIME64);
        }
        return $h;
    }

    /** FNV-1a 64-bit as 16 lowercase hex digits. */
    public static function hash64(string $data): string
    {
        return U64::toHex(self::hash64Int($data));
    }
}

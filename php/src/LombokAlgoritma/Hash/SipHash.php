<?php

// LombokAlgoritma — SipHash-2-4 (SPEC §12)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Hash;

use LombokAlgoritma\AlgoException;
use LombokAlgoritma\Core\U64;

/**
 * SipHash-2-4 (Aumasson & Bernstein, 2012): a keyed PRF for hash-table DoS resistance.
 * It is NOT a protocol MAC — cryptography lives in LombokEncryptDecrypt.
 */
final class SipHash
{
    /**
     * SipHash-2-4 of `$data` under a 16-byte key (k0, k1 little-endian); the 64-bit output
     * (little-endian bytes read as u64) as 16 lowercase hex digits.
     *
     * @throws AlgoException INVALID_INPUT when the key is not 16 bytes
     */
    public static function hash24(string $key, string $data): string
    {
        return U64::toHex(self::hash24Int($key, $data));
    }

    /**
     * SipHash-2-4 as a u64 bit pattern (PHP int).
     *
     * @throws AlgoException INVALID_INPUT when the key is not 16 bytes
     */
    public static function hash24Int(string $key, string $data): int
    {
        if (strlen($key) !== 16) {
            throw AlgoException::invalidInput('sipHash24: key must be 16 bytes');
        }
        $k0 = U64::readLe($key, 0);
        $k1 = U64::readLe($key, 8);
        $v = [
            $k0 ^ 0x736f6d6570736575,
            $k1 ^ 0x646f72616e646f6d,
            $k0 ^ 0x6c7967656e657261,
            $k1 ^ 0x7465646279746573,
        ];
        $n = strlen($data);
        $end = $n - ($n % 8);
        for ($i = 0; $i < $end; $i += 8) {
            $w = U64::readLe($data, $i);
            $v[3] ^= $w;
            self::sipRound($v);
            self::sipRound($v);
            $v[0] ^= $w;
        }
        $last = ($n & 0xff) << 56;
        for ($i = 0; $i < $n % 8; $i++) {
            $last |= ord($data[$end + $i]) << (8 * $i);
        }
        $v[3] ^= $last;
        self::sipRound($v);
        self::sipRound($v);
        $v[0] ^= $last;
        $v[2] ^= 0xff;
        for ($r = 0; $r < 4; $r++) {
            self::sipRound($v);
        }
        return $v[0] ^ $v[1] ^ $v[2] ^ $v[3];
    }

    /** @param array{int, int, int, int} $v */
    private static function sipRound(array &$v): void
    {
        $v[0] = U64::add($v[0], $v[1]);
        $v[1] = U64::rotl($v[1], 13) ^ $v[0];
        $v[0] = U64::rotl($v[0], 32);
        $v[2] = U64::add($v[2], $v[3]);
        $v[3] = U64::rotl($v[3], 16) ^ $v[2];
        $v[0] = U64::add($v[0], $v[3]);
        $v[3] = U64::rotl($v[3], 21) ^ $v[0];
        $v[2] = U64::add($v[2], $v[1]);
        $v[1] = U64::rotl($v[1], 17) ^ $v[2];
        $v[2] = U64::rotl($v[2], 32);
    }
}

<?php

// LombokAlgoritma — PHP HKDF-SHA-256 (RFC 5869)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Math;

/**
 * @deprecated 0.1.1 Moved to codinglombok/lombokencryptdecrypt; removed in 0.2.0.
 */
final class Hkdf
{
    /**
     * @deprecated 0.1.1 Moved to codinglombok/lombokencryptdecrypt; removed in 0.2.0.
     * @throws \InvalidArgumentException when $len is outside [0, 255·32]
     */
    public static function derive(string $ikm, int $len, ?string $salt = null, string $info = ''): string
    {
        if ($len < 0 || $len > 255 * 32) {
            throw new \InvalidArgumentException('HKDF: length must be in [0, 8160]');
        }
        return hash_hkdf('sha256', $ikm, $len, $info, $salt ?? str_repeat("\x00", 32));
    }
}

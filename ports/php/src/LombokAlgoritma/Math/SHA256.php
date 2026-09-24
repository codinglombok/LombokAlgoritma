<?php

// LombokAlgoritma — PHP SHA-256 (ext-hash)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Math;

/**
 * @deprecated 0.1.1 Moved to codinglombok/lombokencryptdecrypt; removed in 0.2.0.
 */
final class SHA256
{
    /** @deprecated 0.1.1 Moved to codinglombok/lombokencryptdecrypt; removed in 0.2.0. */
    public static function hash(string $d): string
    {
        return hash('sha256', $d, true);
    }

    /** @deprecated 0.1.1 Moved to codinglombok/lombokencryptdecrypt; removed in 0.2.0. */
    public static function hex(string $d): string
    {
        return hash('sha256', $d);
    }

    /** @deprecated 0.1.1 Moved to codinglombok/lombokencryptdecrypt; removed in 0.2.0. */
    public static function hmac(string $key, string $d): string
    {
        return hash_hmac('sha256', $d, $key, true);
    }
}

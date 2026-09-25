<?php

// LombokAlgoritma — byte-oriented LZ77 with a ≤ 255-byte window (SPEC §13.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Compression;

use LombokAlgoritma\AlgoException;

/**
 * Tokens `00 literal` or `01 offset length` (1 ≤ offset ≤ window ≤ 255, 3 ≤ length ≤ 255, matches
 * may overlap). Greedy longest match; ties take the largest offset (earliest start).
 */
final class Lz77
{
    /** @throws AlgoException OUT_OF_RANGE unless 1 ≤ window ≤ 255 */
    public static function compress(string $input, int $window = 255): string
    {
        if ($window < 1 || $window > 255) {
            throw AlgoException::outOfRange('lz77Compress: windowSize must be an integer in [1, 255]');
        }
        $n = strlen($input);
        $out = '';
        $i = 0;
        while ($i < $n) {
            $bestLen = 0;
            $bestOffset = 0;
            for ($j = max(0, $i - $window); $j < $i; $j++) {
                $len = 0;
                while ($i + $len < $n && $len < 255 && $input[$j + $len] === $input[$i + $len]) {
                    $len++;
                }
                if ($len > $bestLen) {
                    $bestLen = $len;
                    $bestOffset = $i - $j;
                }
            }
            if ($bestLen >= 3) {
                $out .= "\x01" . chr($bestOffset) . chr($bestLen);
                $i += $bestLen;
            } else {
                $out .= "\x00" . $input[$i];
                $i++;
            }
        }
        return $out;
    }

    /** @throws AlgoException INVALID_INPUT for a bad flag, a truncated token or a bad offset */
    public static function decompress(string $input): string
    {
        $n = strlen($input);
        $out = '';
        $i = 0;
        while ($i < $n) {
            $flag = ord($input[$i++]);
            if ($flag === 0) {
                if ($i >= $n) {
                    throw AlgoException::invalidInput('lz77Decompress: truncated literal');
                }
                $out .= $input[$i++];
            } elseif ($flag === 1) {
                if ($i + 1 >= $n) {
                    throw AlgoException::invalidInput('lz77Decompress: truncated match');
                }
                $offset = ord($input[$i++]);
                $len = ord($input[$i++]);
                if ($offset === 0 || $offset > strlen($out)) {
                    throw AlgoException::invalidInput('lz77Decompress: bad offset');
                }
                $start = strlen($out) - $offset;
                for ($j = 0; $j < $len; $j++) {
                    $out .= $out[$start + $j];
                }
            } else {
                throw AlgoException::invalidInput("lz77Decompress: bad token flag {$flag}");
            }
        }
        return $out;
    }
}

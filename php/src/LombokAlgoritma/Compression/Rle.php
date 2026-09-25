<?php

// LombokAlgoritma — byte run-length encoding (SPEC §13.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Compression;

use LombokAlgoritma\AlgoException;

/** Byte RLE as (count, value) pairs with 1 ≤ count ≤ 255 (longer runs are split). */
final class Rle
{
    public static function encode(string $data): string
    {
        $out = '';
        $n = strlen($data);
        $i = 0;
        while ($i < $n) {
            $val = $data[$i];
            $run = 1;
            while ($i + $run < $n && $data[$i + $run] === $val && $run < 255) {
                $run++;
            }
            $out .= chr($run) . $val;
            $i += $run;
        }
        return $out;
    }

    /** @throws AlgoException INVALID_INPUT for an odd length or a zero count */
    public static function decode(string $data): string
    {
        $n = strlen($data);
        if ($n % 2 !== 0) {
            throw AlgoException::invalidInput('rleDecode: input length must be even');
        }
        $out = '';
        for ($i = 0; $i < $n; $i += 2) {
            $run = ord($data[$i]);
            if ($run === 0) {
                throw AlgoException::invalidInput('rleDecode: zero run length');
            }
            $out .= str_repeat($data[$i + 1], $run);
        }
        return $out;
    }
}

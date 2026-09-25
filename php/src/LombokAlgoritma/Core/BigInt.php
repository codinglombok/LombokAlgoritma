<?php

// LombokAlgoritma — integer input normalisation (int | decimal string | GMP → GMP)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Core;

use LombokAlgoritma\AlgoException;

/** Arbitrary-precision helpers on top of ext-gmp. */
final class BigInt
{
    private const SAFE = 9007199254740991;

    /**
     * @throws AlgoException INVALID_INPUT for a string that is not a decimal integer
     */
    public static function of(int|string|\GMP $v): \GMP
    {
        if ($v instanceof \GMP) {
            return $v;
        }
        if (is_int($v)) {
            return gmp_init($v);
        }
        return self::parse($v);
    }

    /**
     * @throws AlgoException INVALID_INPUT for a string that is not a decimal integer
     */
    public static function parse(string $s): \GMP
    {
        if (preg_match('/^-?\d+$/', $s) !== 1) {
            throw AlgoException::invalidInput("not a decimal integer: {$s}");
        }
        return gmp_init($s, 10);
    }

    /** Integer output (SPEC §3.1): an int when |v| ≤ 2^53 − 1, else the decimal string. */
    public static function out(\GMP $v): int|string
    {
        if (gmp_cmp(gmp_abs($v), self::SAFE) <= 0) {
            return gmp_intval($v);
        }
        return gmp_strval($v);
    }

    /** Truncated quotient (towards zero), like C / JS BigInt `/`. */
    public static function quo(\GMP $a, \GMP $b): \GMP
    {
        return gmp_div_q($a, $b, GMP_ROUND_ZERO);
    }

    /** Truncated remainder (sign of the dividend), like C / JS BigInt `%`. */
    public static function rem(\GMP $a, \GMP $b): \GMP
    {
        return gmp_div_r($a, $b, GMP_ROUND_ZERO);
    }

    /** Non-negative residue in [0, |m|). */
    public static function modPos(\GMP $a, \GMP $m): \GMP
    {
        return gmp_mod($a, $m);
    }
}

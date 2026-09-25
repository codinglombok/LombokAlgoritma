<?php

// LombokAlgoritma — search algorithms on sorted arrays (SPEC §7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Search;

/**
 * Searches over a list sorted ascending. Each returns an index or −1 (bounds return n when no
 * element qualifies). The exact algorithms are normative because duplicates make results differ.
 */
final class Search
{
    /** @param list<int|float> $arr */
    public static function binary(array $arr, int|float $target): int
    {
        $lo = 0;
        $hi = count($arr) - 1;
        while ($lo <= $hi) {
            $mid = ($lo + $hi) >> 1;
            $c = $arr[$mid] <=> $target;
            if ($c === 0) {
                return $mid;
            }
            if ($c < 0) {
                $lo = $mid + 1;
            } else {
                $hi = $mid - 1;
            }
        }
        return -1;
    }

    /**
     * First index with arr[i] ≥ target (n when none).
     *
     * @param list<int|float> $arr
     */
    public static function lowerBound(array $arr, int|float $target): int
    {
        $lo = 0;
        $hi = count($arr);
        while ($lo < $hi) {
            $mid = ($lo + $hi) >> 1;
            if ($arr[$mid] < $target) {
                $lo = $mid + 1;
            } else {
                $hi = $mid;
            }
        }
        return $lo;
    }

    /**
     * First index with arr[i] > target (n when none).
     *
     * @param list<int|float> $arr
     */
    public static function upperBound(array $arr, int|float $target): int
    {
        $lo = 0;
        $hi = count($arr);
        while ($lo < $hi) {
            $mid = ($lo + $hi) >> 1;
            if ($arr[$mid] <= $target) {
                $lo = $mid + 1;
            } else {
                $hi = $mid;
            }
        }
        return $lo;
    }

    /** @param list<int|float> $arr */
    public static function interpolation(array $arr, int|float $target): int
    {
        $lo = 0;
        $hi = count($arr) - 1;
        while ($lo <= $hi && $target >= $arr[$lo] && $target <= $arr[$hi]) {
            if ($lo === $hi) {
                return $arr[$lo] == $target ? $lo : -1;
            }
            $range = $arr[$hi] - $arr[$lo];
            if ($range == 0) {
                return $arr[$lo] == $target ? $lo : -1;
            }
            $pos = $lo + (int) floor((($hi - $lo) * ($target - $arr[$lo])) / $range);
            if ($arr[$pos] == $target) {
                return $pos;
            }
            if ($arr[$pos] < $target) {
                $lo = $pos + 1;
            } else {
                $hi = $pos - 1;
            }
        }
        return -1;
    }

    /** @param list<int|float> $arr */
    public static function exponential(array $arr, int|float $target): int
    {
        $n = count($arr);
        if ($n === 0) {
            return -1;
        }
        if ($arr[0] == $target) {
            return 0;
        }
        $bound = 1;
        while ($bound < $n && $arr[$bound] < $target) {
            $bound *= 2;
        }
        $lo = intdiv($bound, 2);
        $hi = min($bound, $n - 1);
        $idx = self::binary(array_slice($arr, $lo, $hi - $lo + 1), $target);
        return $idx === -1 ? -1 : $lo + $idx;
    }

    /** @param list<int|float> $arr */
    public static function jump(array $arr, int|float $target): int
    {
        $n = count($arr);
        $step = max(1, (int) floor(sqrt($n)));
        $prev = 0;
        $cur = $step;
        while ($cur < $n && $arr[$cur] < $target) {
            $prev = $cur;
            $cur += $step;
        }
        $end = min($cur, $n - 1);
        for ($i = $prev; $i <= $end; $i++) {
            if ($arr[$i] == $target) {
                return $i;
            }
        }
        return -1;
    }

    /** @param list<int|float> $arr */
    public static function fibonacci(array $arr, int|float $target): int
    {
        $n = count($arr);
        $fibMm2 = 0;
        $fibMm1 = 1;
        $fibM = 1;
        while ($fibM < $n) {
            $fibMm2 = $fibMm1;
            $fibMm1 = $fibM;
            $fibM = $fibMm1 + $fibMm2;
        }
        $offset = -1;
        while ($fibM > 1) {
            $i = min($offset + $fibMm2, $n - 1);
            $c = $arr[$i] <=> $target;
            if ($c < 0) {
                $fibM = $fibMm1;
                $fibMm1 = $fibMm2;
                $fibMm2 = $fibM - $fibMm1;
                $offset = $i;
            } elseif ($c > 0) {
                $fibM = $fibMm2;
                $fibMm1 -= $fibMm2;
                $fibMm2 = $fibM - $fibMm1;
            } else {
                return $i;
            }
        }
        if ($fibMm1 !== 0 && $offset + 1 < $n && $arr[$offset + 1] == $target) {
            return $offset + 1;
        }
        return -1;
    }

    /** @param list<int|float> $arr */
    public static function linear(array $arr, int|float $target): int
    {
        foreach ($arr as $i => $v) {
            if ($v == $target) {
                return $i;
            }
        }
        return -1;
    }

    /**
     * Ternary search for the extremum of a unimodal function on [lo, hi].
     *
     * @param callable(float): (int|float) $f
     */
    public static function ternary(
        int|float $lo,
        int|float $hi,
        callable $f,
        bool $maximize = true,
        float $epsilon = 1e-9,
    ): float {
        while ($hi - $lo > $epsilon) {
            $m1 = $lo + ($hi - $lo) / 3;
            $m2 = $hi - ($hi - $lo) / 3;
            $f1 = $f((float) $m1);
            $f2 = $f((float) $m2);
            if ($maximize ? $f1 < $f2 : $f1 > $f2) {
                $lo = $m1;
            } else {
                $hi = $m2;
            }
        }
        return ($lo + $hi) / 2;
    }
}

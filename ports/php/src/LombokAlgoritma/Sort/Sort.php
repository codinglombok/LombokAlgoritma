<?php

// LombokAlgoritma — PHP Sort
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Sort;

/**
 * Sorting algorithms. Every function returns a new, re-indexed (list) array.
 * `timsort` and `mergesort` are stable; `quicksort` and `heapsort` are not.
 */
final class Sort
{
    /**
     * Stable sort — PHP ≥ 8.0 `sort`/`usort` are stable (hybrid insertion/merge).
     *
     * @template T
     * @param array<array-key, T> $a
     * @param (callable(T, T): int)|null $cmp
     * @return list<T>
     */
    public static function timsort(array $a, ?callable $cmp = null): array
    {
        $r = array_values($a);
        if ($cmp === null) {
            sort($r);
        } else {
            usort($r, $cmp);
        }
        return $r;
    }

    /**
     * Median-of-three quicksort (insertion sort below 16 items).
     *
     * @template T of int|float|string
     * @param array<array-key, T> $a
     * @return list<T>
     */
    public static function quicksort(array $a): array
    {
        $a = array_values($a);
        $n = count($a);
        if ($n > 1) {
            self::qs($a, 0, $n - 1);
        }
        return $a;
    }

    /**
     * @template T of int|float|string
     * @param list<T> $a
     */
    private static function qs(array &$a, int $lo, int $hi): void
    {
        while ($lo < $hi) {
            if ($hi - $lo < 16) {
                self::insertion($a, $lo, $hi);
                return;
            }
            $p = self::partition($a, $lo, $hi);
            if ($p - $lo < $hi - $p) {
                self::qs($a, $lo, $p - 1);
                $lo = $p + 1;
            } else {
                self::qs($a, $p + 1, $hi);
                $hi = $p - 1;
            }
        }
    }

    /**
     * @template T of int|float|string
     * @param list<T> $a
     */
    private static function partition(array &$a, int $lo, int $hi): int
    {
        $mid = intdiv($lo + $hi, 2);
        if ($a[$mid] < $a[$lo]) {
            [$a[$lo], $a[$mid]] = [$a[$mid], $a[$lo]];
        }
        if ($a[$hi] < $a[$lo]) {
            [$a[$lo], $a[$hi]] = [$a[$hi], $a[$lo]];
        }
        if ($a[$hi] < $a[$mid]) {
            [$a[$mid], $a[$hi]] = [$a[$hi], $a[$mid]];
        }
        [$a[$mid], $a[$hi]] = [$a[$hi], $a[$mid]];
        $pivot = $a[$hi];
        $i = $lo;
        for ($j = $lo; $j < $hi; $j++) {
            if ($a[$j] <= $pivot) {
                [$a[$i], $a[$j]] = [$a[$j], $a[$i]];
                $i++;
            }
        }
        [$a[$i], $a[$hi]] = [$a[$hi], $a[$i]];
        return $i;
    }

    /**
     * @template T of int|float|string
     * @param list<T> $a
     */
    private static function insertion(array &$a, int $lo, int $hi): void
    {
        for ($i = $lo + 1; $i <= $hi; $i++) {
            $key = $a[$i];
            $j = $i - 1;
            while ($j >= $lo && $a[$j] > $key) {
                $a[$j + 1] = $a[$j];
                $j--;
            }
            $a[$j + 1] = $key;
        }
    }

    /**
     * Bottom-up stable mergesort.
     *
     * v0.1.0 doubled the run width twice per pass (and did not parse); fixed in v0.1.1.
     *
     * @template T of int|float|string
     * @param array<array-key, T> $a
     * @return list<T>
     */
    public static function mergesort(array $a): array
    {
        $a = array_values($a);
        $n = count($a);
        if ($n <= 1) {
            return $a;
        }
        $t = $a;
        for ($w = 1; $w < $n; $w *= 2) {
            for ($lo = 0; $lo < $n; $lo += 2 * $w) {
                $mid = min($lo + $w, $n);
                $hi = min($lo + 2 * $w, $n);
                $i = $lo;
                $j = $mid;
                $k = $lo;
                while ($i < $mid && $j < $hi) {
                    if ($a[$j] < $a[$i]) {
                        $t[$k++] = $a[$j++];
                    } else {
                        $t[$k++] = $a[$i++];
                    }
                }
                while ($i < $mid) {
                    $t[$k++] = $a[$i++];
                }
                while ($j < $hi) {
                    $t[$k++] = $a[$j++];
                }
            }
            $a = $t;
        }
        return $a;
    }

    /**
     * In-place heapsort on a copy.
     *
     * @template T of int|float|string
     * @param array<array-key, T> $a
     * @return list<T>
     */
    public static function heapsort(array $a): array
    {
        $a = array_values($a);
        $n = count($a);
        for ($i = intdiv($n, 2) - 1; $i >= 0; $i--) {
            self::sift($a, $i, $n);
        }
        for ($e = $n - 1; $e > 0; $e--) {
            [$a[0], $a[$e]] = [$a[$e], $a[0]];
            self::sift($a, 0, $e);
        }
        return $a;
    }

    /**
     * @template T of int|float|string
     * @param list<T> $a
     */
    private static function sift(array &$a, int $r, int $e): void
    {
        while (true) {
            $lg = $r;
            $l = 2 * $r + 1;
            $ri = $l + 1;
            if ($l < $e && $a[$lg] < $a[$l]) {
                $lg = $l;
            }
            if ($ri < $e && $a[$lg] < $a[$ri]) {
                $lg = $ri;
            }
            if ($lg === $r) {
                return;
            }
            [$a[$r], $a[$lg]] = [$a[$lg], $a[$r]];
            $r = $lg;
        }
    }

    /**
     * Counting sort for integers in [0, $max].
     *
     * @param array<array-key, int> $a
     * @return list<int>
     * @throws \InvalidArgumentException on values outside [0, $max]
     */
    public static function countingSort(array $a, ?int $max = null): array
    {
        if ($a === []) {
            return [];
        }
        $k = $max ?? max($a);
        $cnt = array_fill(0, $k + 1, 0);
        foreach ($a as $v) {
            if ($v < 0 || $v > $k) {
                throw new \InvalidArgumentException("countingSort: value {$v} outside [0, {$k}]");
            }
            $cnt[$v]++;
        }
        $out = [];
        foreach ($cnt as $value => $c) {
            for ($j = 0; $j < $c; $j++) {
                $out[] = $value;
            }
        }
        return $out;
    }
}

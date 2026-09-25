<?php

// LombokAlgoritma — sorting algorithms (SPEC §6)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Sort;

use LombokAlgoritma\AlgoException;

/**
 * Sorting algorithms. Every function returns a new list (the input is not modified).
 * `timsort`, `mergesort`, `radixSortLsd` and `countingSort` are stable; `quicksort` and `heapsort`
 * are not. Comparators follow `usort` semantics (negative / 0 / positive); the default is `<=>`.
 */
final class Sort
{
    private const MIN_MERGE = 32;

    /**
     * Stable, adaptive Timsort (insertion-sorted runs of minRun, then bottom-up merges).
     *
     * @template T
     * @param array<array-key, T> $a
     * @param (callable(T, T): int)|null $cmp
     * @return list<T>
     */
    public static function timsort(array $a, ?callable $cmp = null): array
    {
        $cmp ??= self::defaultCmp(...);
        $a = array_values($a);
        $n = count($a);
        if ($n <= 1) {
            return $a;
        }
        $minRun = self::minRunLength($n);
        for ($i = 0; $i < $n; $i += $minRun) {
            self::insertion($a, $i, min($i + $minRun - 1, $n - 1), $cmp);
        }
        for ($size = $minRun; $size < $n; $size *= 2) {
            for ($lo = 0; $lo < $n; $lo += 2 * $size) {
                $mid = min($lo + $size - 1, $n - 1);
                $hi = min($lo + 2 * $size - 1, $n - 1);
                if ($mid < $hi) {
                    self::merge($a, $lo, $mid, $hi, $cmp);
                }
            }
        }
        return array_values($a);
    }

    private static function defaultCmp(mixed $x, mixed $y): int
    {
        return $x <=> $y;
    }

    private static function minRunLength(int $n): int
    {
        $r = 0;
        while ($n >= self::MIN_MERGE) {
            $r |= $n & 1;
            $n >>= 1;
        }
        return $n + $r;
    }

    /**
     * @template T
     * @param array<int, T> $a
     * @param callable(T, T): int $cmp
     */
    private static function insertion(array &$a, int $lo, int $hi, callable $cmp): void
    {
        for ($i = $lo + 1; $i <= $hi; $i++) {
            $key = $a[$i];
            $j = $i - 1;
            while ($j >= $lo && $cmp($a[$j], $key) > 0) {
                $a[$j + 1] = $a[$j];
                $j--;
            }
            $a[$j + 1] = $key;
        }
    }

    /**
     * Merge the sorted runs a[lo..mid] and a[mid+1..hi] (stable: left wins ties).
     *
     * @template T
     * @param array<int, T> $a
     * @param callable(T, T): int $cmp
     */
    private static function merge(array &$a, int $lo, int $mid, int $hi, callable $cmp): void
    {
        $left = array_slice($a, $lo, $mid - $lo + 1);
        $right = array_slice($a, $mid + 1, $hi - $mid);
        $nl = count($left);
        $nr = count($right);
        $i = 0;
        $j = 0;
        $k = $lo;
        while ($i < $nl && $j < $nr) {
            if ($cmp($left[$i], $right[$j]) <= 0) {
                $a[$k++] = $left[$i++];
            } else {
                $a[$k++] = $right[$j++];
            }
        }
        while ($i < $nl) {
            $a[$k++] = $left[$i++];
        }
        while ($j < $nr) {
            $a[$k++] = $right[$j++];
        }
    }

    /**
     * Stable bottom-up iterative mergesort.
     *
     * @template T
     * @param array<array-key, T> $a
     * @param (callable(T, T): int)|null $cmp
     * @return list<T>
     */
    public static function mergesort(array $a, ?callable $cmp = null): array
    {
        $cmp ??= self::defaultCmp(...);
        $a = array_values($a);
        $n = count($a);
        if ($n <= 1) {
            return $a;
        }
        $tmp = $a;
        for ($width = 1; $width < $n; $width *= 2) {
            for ($lo = 0; $lo < $n; $lo += 2 * $width) {
                $mid = min($lo + $width, $n);
                $hi = min($lo + 2 * $width, $n);
                $i = $lo;
                $j = $mid;
                $k = $lo;
                while ($i < $mid && $j < $hi) {
                    if ($cmp($a[$i], $a[$j]) <= 0) {
                        $tmp[$k++] = $a[$i++];
                    } else {
                        $tmp[$k++] = $a[$j++];
                    }
                }
                while ($i < $mid) {
                    $tmp[$k++] = $a[$i++];
                }
                while ($j < $hi) {
                    $tmp[$k++] = $a[$j++];
                }
            }
            $a = $tmp;
        }
        return array_values($a);
    }

    /**
     * Quicksort: median-of-three pivot, Lomuto partition, insertion sort below 16 elements,
     * recursion on the smaller side only. Not stable. (Unlike the TS port it does not shuffle
     * first, so it is fully deterministic; SPEC §0.6 makes only the sorted values normative.)
     *
     * @template T
     * @param array<array-key, T> $a
     * @param (callable(T, T): int)|null $cmp
     * @return list<T>
     */
    public static function quicksort(array $a, ?callable $cmp = null): array
    {
        $cmp ??= self::defaultCmp(...);
        $a = array_values($a);
        if (count($a) > 1) {
            self::quicksortInner($a, 0, count($a) - 1, $cmp);
        }
        return array_values($a);
    }

    /**
     * @template T
     * @param array<int, T> $a
     * @param callable(T, T): int $cmp
     */
    private static function quicksortInner(array &$a, int $lo, int $hi, callable $cmp): void
    {
        while ($lo < $hi) {
            if ($hi - $lo < 16) {
                self::insertion($a, $lo, $hi, $cmp);
                return;
            }
            $p = self::partition($a, $lo, $hi, $cmp);
            if ($p - $lo < $hi - $p) {
                self::quicksortInner($a, $lo, $p - 1, $cmp);
                $lo = $p + 1;
            } else {
                self::quicksortInner($a, $p + 1, $hi, $cmp);
                $hi = $p - 1;
            }
        }
    }

    /**
     * @template T
     * @param array<int, T> $a
     * @param callable(T, T): int $cmp
     */
    private static function partition(array &$a, int $lo, int $hi, callable $cmp): int
    {
        $mid = ($lo + $hi) >> 1;
        if ($cmp($a[$lo], $a[$mid]) > 0) {
            [$a[$lo], $a[$mid]] = [$a[$mid], $a[$lo]];
        }
        if ($cmp($a[$lo], $a[$hi]) > 0) {
            [$a[$lo], $a[$hi]] = [$a[$hi], $a[$lo]];
        }
        if ($cmp($a[$mid], $a[$hi]) > 0) {
            [$a[$mid], $a[$hi]] = [$a[$hi], $a[$mid]];
        }
        [$a[$mid], $a[$hi]] = [$a[$hi], $a[$mid]];
        $pivot = $a[$hi];
        $i = $lo - 1;
        for ($j = $lo; $j < $hi; $j++) {
            if ($cmp($a[$j], $pivot) <= 0) {
                $i++;
                [$a[$i], $a[$j]] = [$a[$j], $a[$i]];
            }
        }
        [$a[$i + 1], $a[$hi]] = [$a[$hi], $a[$i + 1]];
        return $i + 1;
    }

    /**
     * Heapsort (max-heap, sift-down). Not stable.
     *
     * @template T
     * @param array<array-key, T> $a
     * @param (callable(T, T): int)|null $cmp
     * @return list<T>
     */
    public static function heapsort(array $a, ?callable $cmp = null): array
    {
        $cmp ??= self::defaultCmp(...);
        $a = array_values($a);
        $n = count($a);
        for ($i = intdiv($n, 2) - 1; $i >= 0; $i--) {
            self::siftDown($a, $i, $n, $cmp);
        }
        for ($end = $n - 1; $end > 0; $end--) {
            [$a[0], $a[$end]] = [$a[$end], $a[0]];
            self::siftDown($a, 0, $end, $cmp);
        }
        return array_values($a);
    }

    /**
     * @template T
     * @param array<int, T> $a
     * @param callable(T, T): int $cmp
     */
    private static function siftDown(array &$a, int $root, int $end, callable $cmp): void
    {
        while (true) {
            $largest = $root;
            $left = 2 * $root + 1;
            $right = $left + 1;
            if ($left < $end && $cmp($a[$left], $a[$largest]) > 0) {
                $largest = $left;
            }
            if ($right < $end && $cmp($a[$right], $a[$largest]) > 0) {
                $largest = $right;
            }
            if ($largest === $root) {
                return;
            }
            [$a[$root], $a[$largest]] = [$a[$largest], $a[$root]];
            $root = $largest;
        }
    }

    /**
     * Stable LSD radix sort (base 10) for integers; negatives are shifted by −min.
     *
     * @param array<array-key, int> $a
     * @return list<int>
     */
    public static function radixSortLsd(array $a): array
    {
        $a = array_values($a);
        $n = count($a);
        if ($n <= 1) {
            return $a;
        }
        $min = min($a);
        $shift = $min < 0 ? -$min : 0;
        foreach ($a as $i => $v) {
            $a[$i] = $v + $shift;
        }
        $max = max($a);
        for ($exp = 1; intdiv($max, $exp) > 0; $exp *= 10) {
            $count = array_fill(0, 10, 0);
            foreach ($a as $v) {
                $count[intdiv($v, $exp) % 10]++;
            }
            for ($d = 1; $d < 10; $d++) {
                $count[$d] += $count[$d - 1];
            }
            $out = $a;
            for ($i = $n - 1; $i >= 0; $i--) {
                $d = intdiv($a[$i], $exp) % 10;
                $out[--$count[$d]] = $a[$i];
            }
            $a = $out;
            if ($exp > intdiv(PHP_INT_MAX, 10)) {
                break;
            }
        }
        foreach ($a as $i => $v) {
            $a[$i] = $v - $shift;
        }
        return array_values($a);
    }

    /**
     * Stable counting sort for integers in [0, max] (max defaults to the largest element).
     *
     * @param array<array-key, int|float> $a
     * @return list<int|float>
     * @throws AlgoException OUT_OF_RANGE for a negative, non-integer or too large element
     */
    public static function countingSort(array $a, ?int $max = null): array
    {
        $a = array_values($a);
        if (count($a) <= 1) {
            return $a;
        }
        $k = $max ?? (int) max($a);
        foreach ($a as $v) {
            if ((is_float($v) && floor($v) !== $v) || $v < 0 || $v > $k) {
                throw AlgoException::outOfRange("countingSort: value {$v} outside integer range [0, {$k}]");
            }
        }
        $count = array_fill(0, $k + 1, 0);
        foreach ($a as $v) {
            $count[(int) $v]++;
        }
        $out = [];
        foreach ($count as $value => $c) {
            for ($j = 0; $j < $c; $j++) {
                $out[] = $value;
            }
        }
        return $out;
    }
}

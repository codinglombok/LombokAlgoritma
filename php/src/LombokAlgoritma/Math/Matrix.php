<?php

// LombokAlgoritma — matrix multiplication: naive and Strassen (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Math;

use LombokAlgoritma\AlgoException;

/**
 * Dense matrices as `list<list<int|float>>`. Sums run left to right from 0 (SPEC §0.2).
 */
final class Matrix
{
    private const STRASSEN_CUTOFF = 64;

    /**
     * Naive product of an n×k and a k×m matrix: Cᵢⱼ = Σₗ Aᵢₗ·Bₗⱼ (l ascending, from 0).
     *
     * @param list<list<int|float>> $a
     * @param list<list<int|float>> $b
     * @return list<list<int|float>>
     * @throws AlgoException INVALID_INPUT when the inner dimensions differ
     */
    public static function multiply(array $a, array $b): array
    {
        $n = count($a);
        $k = count($b);
        $m = $k > 0 ? count($b[0]) : 0;
        foreach ($a as $row) {
            if (count($row) !== $k) {
                throw AlgoException::invalidInput('matMul: inner dimensions differ');
            }
        }
        $c = [];
        for ($i = 0; $i < $n; $i++) {
            $row = [];
            for ($j = 0; $j < $m; $j++) {
                $s = 0;
                for ($l = 0; $l < $k; $l++) {
                    $s += $a[$i][$l] * $b[$l][$j];
                }
                $row[] = $s;
            }
            $c[] = $row;
        }
        return $c;
    }

    /**
     * Strassen product of two n×n matrices; sizes that are not a power of two are zero-padded to
     * the next power of two and the result is cropped.
     *
     * @param list<list<int|float>> $a
     * @param list<list<int|float>> $b
     * @return list<list<int|float>>
     * @throws AlgoException INVALID_INPUT unless both matrices are n×n
     */
    public static function strassen(array $a, array $b): array
    {
        $n = count($a);
        foreach ([$a, $b] as $mat) {
            if (count($mat) !== $n) {
                throw AlgoException::invalidInput('strassenMul: A and B must both be n×n');
            }
            foreach ($mat as $row) {
                if (count($row) !== $n) {
                    throw AlgoException::invalidInput('strassenMul: A and B must both be n×n');
                }
            }
        }
        if ($n === 0) {
            return [];
        }
        $p = 1;
        while ($p < $n) {
            $p <<= 1;
        }
        if ($p === $n) {
            return self::strassenRec($a, $b);
        }
        $c = self::strassenRec(self::pad($a, $p), self::pad($b, $p));
        $out = [];
        for ($i = 0; $i < $n; $i++) {
            $out[] = array_slice($c[$i], 0, $n);
        }
        return $out;
    }

    /**
     * @param list<list<int|float>> $m
     * @return list<list<int|float>>
     */
    private static function pad(array $m, int $p): array
    {
        $out = [];
        for ($i = 0; $i < $p; $i++) {
            $out[] = array_pad($m[$i] ?? [], $p, 0);
        }
        return $out;
    }

    /**
     * @param list<list<int|float>> $a
     * @param list<list<int|float>> $b
     * @return list<list<int|float>>
     */
    private static function strassenRec(array $a, array $b): array
    {
        $n = count($a);
        if ($n <= self::STRASSEN_CUTOFF) {
            return self::multiply($a, $b);
        }
        $h = $n >> 1;
        [$a11, $a12, $a21, $a22] = self::split($a, $h);
        [$b11, $b12, $b21, $b22] = self::split($b, $h);
        $m1 = self::strassenRec(self::add($a11, $a22), self::add($b11, $b22));
        $m2 = self::strassenRec(self::add($a21, $a22), $b11);
        $m3 = self::strassenRec($a11, self::sub($b12, $b22));
        $m4 = self::strassenRec($a22, self::sub($b21, $b11));
        $m5 = self::strassenRec(self::add($a11, $a12), $b22);
        $m6 = self::strassenRec(self::sub($a21, $a11), self::add($b11, $b12));
        $m7 = self::strassenRec(self::sub($a12, $a22), self::add($b21, $b22));
        $c11 = self::add(self::sub(self::add($m1, $m4), $m5), $m7);
        $c12 = self::add($m3, $m5);
        $c21 = self::add($m2, $m4);
        $c22 = self::add(self::sub(self::add($m1, $m3), $m2), $m6);
        $c = [];
        for ($i = 0; $i < $h; $i++) {
            $c[] = array_merge($c11[$i], $c12[$i]);
        }
        for ($i = 0; $i < $h; $i++) {
            $c[] = array_merge($c21[$i], $c22[$i]);
        }
        return $c;
    }

    /**
     * @param list<list<int|float>> $m
     * @return array{list<list<int|float>>, list<list<int|float>>, list<list<int|float>>, list<list<int|float>>}
     */
    private static function split(array $m, int $h): array
    {
        $q = [[], [], [], []];
        foreach ($m as $i => $row) {
            $top = $i < $h ? 0 : 2;
            $q[$top][] = array_slice($row, 0, $h);
            $q[$top + 1][] = array_slice($row, $h);
        }
        return $q;
    }

    /**
     * @param list<list<int|float>> $a
     * @param list<list<int|float>> $b
     * @return list<list<int|float>>
     */
    public static function add(array $a, array $b): array
    {
        $out = [];
        foreach ($a as $i => $row) {
            $r = [];
            foreach ($row as $j => $v) {
                $r[] = $v + $b[$i][$j];
            }
            $out[] = $r;
        }
        return $out;
    }

    /**
     * @param list<list<int|float>> $a
     * @param list<list<int|float>> $b
     * @return list<list<int|float>>
     */
    public static function sub(array $a, array $b): array
    {
        $out = [];
        foreach ($a as $i => $row) {
            $r = [];
            foreach ($row as $j => $v) {
                $r[] = $v - $b[$i][$j];
            }
            $out[] = $r;
        }
        return $out;
    }
}

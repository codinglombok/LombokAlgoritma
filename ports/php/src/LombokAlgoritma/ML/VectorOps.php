<?php

// LombokAlgoritma — PHP Vector operations
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\ML;

/** Dense vector math with left-to-right (sequential) summation, matching the other ports. */
final class VectorOps
{
    /**
     * @param list<int|float> $a
     * @param list<int|float> $b
     * @throws \InvalidArgumentException on length mismatch
     */
    public static function dot(array $a, array $b): float
    {
        self::sameLength($a, $b);
        $s = 0.0;
        foreach ($a as $i => $x) {
            $s += $x * $b[$i];
        }
        return $s;
    }

    /** @param list<int|float> $v */
    public static function norm(array $v): float
    {
        $s = 0.0;
        foreach ($v as $x) {
            $s += $x * $x;
        }
        return sqrt($s);
    }

    /**
     * Cosine similarity; 0 when either vector is zero.
     *
     * @param list<int|float> $a
     * @param list<int|float> $b
     */
    public static function cosine(array $a, array $b): float
    {
        $na = self::norm($a);
        $nb = self::norm($b);
        return ($na == 0.0 || $nb == 0.0) ? 0.0 : self::dot($a, $b) / ($na * $nb);
    }

    /**
     * Euclidean distance.
     *
     * @param list<int|float> $a
     * @param list<int|float> $b
     */
    public static function l2(array $a, array $b): float
    {
        self::sameLength($a, $b);
        $s = 0.0;
        foreach ($a as $i => $x) {
            $d = $x - $b[$i];
            $s += $d * $d;
        }
        return sqrt($s);
    }

    /**
     * @param list<int|float> $v
     * @return list<float>
     */
    public static function normalize(array $v): array
    {
        $n = self::norm($v);
        if ($n == 0.0) {
            return array_fill(0, count($v), 0.0);
        }
        return array_map(static fn (int|float $x): float => $x / $n, $v);
    }

    /**
     * @param list<int|float> $a
     * @param list<int|float> $b
     */
    private static function sameLength(array $a, array $b): void
    {
        if (count($a) !== count($b)) {
            throw new \InvalidArgumentException('vectors must have equal length');
        }
    }
}

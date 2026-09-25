<?php

// LombokAlgoritma — vector similarity and distance (SPEC §13.1)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Ml;

use LombokAlgoritma\AlgoException;

/** Dense-vector similarity / distance; every Σ runs left to right from 0. */
final class Similarity
{
    /**
     * @param list<int|float> $a
     * @param list<int|float> $b
     * @throws AlgoException INVALID_INPUT on a length mismatch
     */
    public static function dot(array $a, array $b): int|float
    {
        self::sameLength($a, $b);
        $s = 0;
        foreach ($a as $i => $x) {
            $s += $x * $b[$i];
        }
        return $s;
    }

    /** @param list<int|float> $v */
    public static function l2Norm(array $v): float
    {
        $s = 0;
        foreach ($v as $x) {
            $s += $x * $x;
        }
        return sqrt($s);
    }

    /**
     * dot(a, b) / (‖a‖·‖b‖); 0 when either norm is 0.
     *
     * @param list<int|float> $a
     * @param list<int|float> $b
     * @throws AlgoException INVALID_INPUT on a length mismatch
     */
    public static function cosine(array $a, array $b): int|float
    {
        self::sameLength($a, $b);
        $na = self::l2Norm($a);
        $nb = self::l2Norm($b);
        if ($na == 0 || $nb == 0) {
            return 0;
        }
        return self::dot($a, $b) / ($na * $nb);
    }

    /**
     * Euclidean distance √(Σ (aᵢ − bᵢ)·(aᵢ − bᵢ)).
     *
     * @param list<int|float> $a
     * @param list<int|float> $b
     * @throws AlgoException INVALID_INPUT on a length mismatch
     */
    public static function l2Distance(array $a, array $b): float
    {
        self::sameLength($a, $b);
        $s = 0;
        foreach ($a as $i => $x) {
            $d = $x - $b[$i];
            $s += $d * $d;
        }
        return sqrt($s);
    }

    /**
     * Manhattan distance Σ |aᵢ − bᵢ|.
     *
     * @param list<int|float> $a
     * @param list<int|float> $b
     * @throws AlgoException INVALID_INPUT on a length mismatch
     */
    public static function l1Distance(array $a, array $b): int|float
    {
        self::sameLength($a, $b);
        $s = 0;
        foreach ($a as $i => $x) {
            $s += abs($x - $b[$i]);
        }
        return $s;
    }

    /**
     * vᵢ / ‖v‖ (all zeros for the zero vector).
     *
     * @param list<int|float> $v
     * @return list<float>
     */
    public static function normalize(array $v): array
    {
        $n = self::l2Norm($v);
        if ($n == 0) {
            return array_fill(0, count($v), 0.0);
        }
        return array_map(static fn (int|float $x): float => $x / $n, $v);
    }

    /**
     * |A ∩ B| / |A ∪ B| over string sets (duplicates ignored); two empty sets → 1.
     *
     * @param list<string> $a
     * @param list<string> $b
     */
    public static function jaccard(array $a, array $b): int|float
    {
        $sa = array_fill_keys(array_map(static fn (string $s): string => 's' . $s, $a), true);
        $sb = array_fill_keys(array_map(static fn (string $s): string => 's' . $s, $b), true);
        $inter = count(array_intersect_key($sa, $sb));
        $union = count($sa) + count($sb) - $inter;
        return $union === 0 ? 1 : $inter / $union;
    }

    /**
     * Pearson correlation: num / √(sa·sb) with deviations from the means; 0 when sa or sb is 0.
     *
     * @param list<int|float> $a
     * @param list<int|float> $b
     * @throws AlgoException INVALID_INPUT on a length mismatch
     */
    public static function pearson(array $a, array $b): int|float
    {
        self::sameLength($a, $b);
        $n = count($a);
        if ($n === 0) {
            return NAN; // 0/0 means, as in the TS reference
        }
        $sumA = 0;
        $sumB = 0;
        foreach ($a as $i => $x) {
            $sumA += $x;
            $sumB += $b[$i];
        }
        $meanA = $sumA / $n;
        $meanB = $sumB / $n;
        $num = 0;
        $denA = 0;
        $denB = 0;
        foreach ($a as $i => $x) {
            $da = $x - $meanA;
            $db = $b[$i] - $meanB;
            $num += $da * $db;
            $denA += $da * $da;
            $denB += $db * $db;
        }
        if ($denA == 0 || $denB == 0) {
            return 0;
        }
        return $num / sqrt($denA * $denB);
    }

    /**
     * Cosine of `$query` against every candidate, sorted by score descending, ties by index.
     *
     * @param list<int|float> $query
     * @param list<list<int|float>> $candidates
     * @return list<array{index: int, score: int|float}>
     * @throws AlgoException INVALID_INPUT on a length mismatch
     */
    public static function batchCosine(array $query, array $candidates): array
    {
        $out = [];
        foreach ($candidates as $i => $c) {
            $out[] = ['index' => $i, 'score' => self::cosine($query, $c)];
        }
        usort(
            $out,
            static fn (array $x, array $y): int => ($y['score'] <=> $x['score']) ?: ($x['index'] <=> $y['index']),
        );
        return $out;
    }

    /**
     * @param list<int|float> $a
     * @param list<int|float> $b
     */
    private static function sameLength(array $a, array $b): void
    {
        if (count($a) !== count($b)) {
            throw AlgoException::invalidInput('Vectors must have equal length');
        }
    }
}

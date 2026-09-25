<?php

// LombokAlgoritma — k-means clustering: k-means++ seeding + Lloyd iterations (SPEC §13.1)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Ml;

use LombokAlgoritma\AlgoException;
use LombokAlgoritma\Rng\Xoshiro256pp;

/** Deterministic k-means for a given seed (xoshiro256++ stream). O(n·k·d·iterations). */
final class KMeans
{
    /**
     * k-means++ seeding followed by Lloyd iterations. Assignment picks the lowest-index centroid
     * with the strictly smallest squared distance; the update averages members (summed in point
     * order, then divided by the count); an empty cluster keeps its centroid. Stops after
     * `$maxIter` iterations or when every centroid moved less than `$tol`.
     *
     * @param list<list<int|float>> $points
     * @return array{centroids: list<list<int|float>>, labels: list<int>, iterations: int, inertia: int|float}
     * @throws AlgoException EMPTY_INPUT for no points, OUT_OF_RANGE unless 1 ≤ k ≤ n,
     *                       INVALID_INPUT for points of unequal dimension
     */
    public static function fit(
        array $points,
        int $k,
        int $maxIter = 300,
        float $tol = 1e-4,
        int|string|\GMP $seed = Xoshiro256pp::DEFAULT_SEED,
    ): array {
        $n = count($points);
        if ($n === 0) {
            throw AlgoException::emptyInput('kmeans');
        }
        if ($k < 1 || $k > $n) {
            throw AlgoException::outOfRange('kmeans: need 1 ≤ k ≤ n');
        }
        $d = count($points[0]);
        foreach ($points as $p) {
            if (count($p) !== $d) {
                throw AlgoException::invalidInput('kmeans: points of unequal dimension');
            }
        }
        $rng = new Xoshiro256pp($seed);
        $centroids = self::seed($points, $k, $rng);
        $labels = array_fill(0, $n, 0);
        $iter = 0;
        while ($iter < $maxIter) {
            $iter++;
            foreach ($points as $i => $p) {
                $best = 0;
                $bestDist = INF;
                for ($c = 0; $c < $k; $c++) {
                    $dist = self::sqDist($p, $centroids[$c]);
                    if ($dist < $bestDist) {
                        $bestDist = $dist;
                        $best = $c;
                    }
                }
                $labels[$i] = $best;
            }
            $sums = array_fill(0, $k, array_fill(0, $d, 0));
            $counts = array_fill(0, $k, 0);
            foreach ($points as $i => $p) {
                $c = $labels[$i];
                for ($j = 0; $j < $d; $j++) {
                    $sums[$c][$j] += $p[$j];
                }
                $counts[$c]++;
            }
            $maxShift = 0;
            $next = [];
            foreach ($sums as $c => $row) {
                $cnt = $counts[$c];
                if ($cnt === 0) {
                    $next[] = $centroids[$c];
                    continue;
                }
                $nc = array_map(static fn (int|float $v): int|float => $v / $cnt, $row);
                $shift = sqrt(self::sqDist($centroids[$c], $nc));
                if ($shift > $maxShift) {
                    $maxShift = $shift;
                }
                $next[] = $nc;
            }
            $centroids = $next;
            if ($maxShift < $tol) {
                break;
            }
        }
        $inertia = 0;
        foreach ($points as $i => $p) {
            $inertia += self::sqDist($p, $centroids[$labels[$i]]);
        }
        return ['centroids' => $centroids, 'labels' => $labels, 'iterations' => $iter, 'inertia' => $inertia];
    }

    /**
     * k-means++: c₀ = points[nextInt(n)]; then r = nextFloat()·ΣD and the first i with
     * (r −= D[i]) ≤ 0 (or n − 1) becomes the next centroid.
     *
     * @param list<list<int|float>> $points
     * @return list<list<int|float>>
     */
    private static function seed(array $points, int $k, Xoshiro256pp $rng): array
    {
        $n = count($points);
        $centroids = [$points[$rng->nextInt($n)]];
        $dists = [];
        foreach ($points as $p) {
            $dists[] = self::sqDist($p, $centroids[0]);
        }
        while (count($centroids) < $k) {
            $total = 0;
            foreach ($dists as $x) {
                $total += $x;
            }
            $r = $rng->nextFloat() * $total;
            $pick = $n - 1;
            for ($i = 0; $i < $n; $i++) {
                $r -= $dists[$i];
                if ($r <= 0) {
                    $pick = $i;
                    break;
                }
            }
            $c = $points[$pick];
            $centroids[] = $c;
            foreach ($points as $i => $p) {
                $dd = self::sqDist($p, $c);
                if ($dd < $dists[$i]) {
                    $dists[$i] = $dd;
                }
            }
        }
        return $centroids;
    }

    /**
     * Σ (aᵢ − bᵢ)·(aᵢ − bᵢ), left to right.
     *
     * @param list<int|float> $a
     * @param list<int|float> $b
     */
    public static function sqDist(array $a, array $b): int|float
    {
        $s = 0;
        foreach ($a as $i => $x) {
            $d = $x - $b[$i];
            $s += $d * $d;
        }
        return $s;
    }
}

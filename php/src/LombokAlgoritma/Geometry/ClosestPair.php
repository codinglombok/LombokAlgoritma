<?php

// LombokAlgoritma — closest pair of points, divide and conquer (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Geometry;

use LombokAlgoritma\AlgoException;

/** Closest pair in O(n log n); only the distance √(Δx·Δx + Δy·Δy) is normative (no hypot). */
final class ClosestPair
{
    /**
     * @param list<Point> $points
     * @return array{Point, Point, float}
     * @throws AlgoException EMPTY_INPUT with fewer than 2 points
     */
    public static function of(array $points): array
    {
        if (count($points) < 2) {
            throw AlgoException::emptyInput('closestPair (need ≥ 2 points)');
        }
        return self::solve(ConvexHull::sorted($points));
    }

    public static function distance(Point $a, Point $b): float
    {
        $dx = $a->x - $b->x;
        $dy = $a->y - $b->y;
        return sqrt($dx * $dx + $dy * $dy);
    }

    /**
     * @param list<Point> $pts sorted by (x, y), at least 2
     * @return array{Point, Point, float}
     */
    private static function solve(array $pts): array
    {
        $n = count($pts);
        if ($n <= 3) {
            $best = [$pts[0], $pts[1], INF];
            for ($i = 0; $i < $n; $i++) {
                for ($j = $i + 1; $j < $n; $j++) {
                    $d = self::distance($pts[$i], $pts[$j]);
                    if ($d < $best[2]) {
                        $best = [$pts[$i], $pts[$j], $d];
                    }
                }
            }
            return $best;
        }
        $mid = $n >> 1;
        $mx = $pts[$mid]->x;
        $left = self::solve(array_slice($pts, 0, $mid));
        $right = self::solve(array_slice($pts, $mid));
        $best = $left[2] <= $right[2] ? $left : $right;
        $strip = array_values(array_filter($pts, static fn (Point $p): bool => abs($p->x - $mx) < $best[2]));
        usort($strip, static fn (Point $a, Point $b): int => $a->y <=> $b->y);
        $m = count($strip);
        for ($i = 0; $i < $m; $i++) {
            for ($j = $i + 1; $j < $m && $strip[$j]->y - $strip[$i]->y < $best[2]; $j++) {
                $d = self::distance($strip[$i], $strip[$j]);
                if ($d < $best[2]) {
                    $best = [$strip[$i], $strip[$j], $d];
                }
            }
        }
        return $best;
    }
}

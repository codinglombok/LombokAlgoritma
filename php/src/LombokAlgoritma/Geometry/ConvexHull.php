<?php

// LombokAlgoritma — convex hull, Andrew's monotone chain (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Geometry;

/** Andrew's monotone chain. O(n log n). */
final class ConvexHull
{
    /**
     * Hull counter-clockwise from the lowest (x, then y) point; collinear boundary points and
     * duplicates are dropped (turns must be strictly CCW). Fewer than 3 points → the points sorted;
     * all points identical → that single point.
     *
     * @param list<Point> $points
     * @return list<Point>
     */
    public static function of(array $points): array
    {
        $pts = self::sorted($points);
        if (count($pts) < 3) {
            return $pts;
        }
        $hull = array_merge(self::chain($pts), self::chain(array_reverse($pts)));
        if (count($hull) === 2 && $hull[0]->x == $hull[1]->x && $hull[0]->y == $hull[1]->y) {
            return [$hull[0]];
        }
        return $hull;
    }

    /**
     * Stable sort by (x, y).
     *
     * @param list<Point> $points
     * @return list<Point>
     */
    public static function sorted(array $points): array
    {
        usort($points, static fn (Point $a, Point $b): int => ($a->x <=> $b->x) ?: ($a->y <=> $b->y));
        return $points;
    }

    /**
     * @param list<Point> $seq
     * @return list<Point>
     */
    private static function chain(array $seq): array
    {
        $out = [];
        foreach ($seq as $p) {
            while (count($out) >= 2 && Cross::of($out[count($out) - 2], $out[count($out) - 1], $p) <= 0) {
                array_pop($out);
            }
            $out[] = $p;
        }
        array_pop($out);
        return $out;
    }
}

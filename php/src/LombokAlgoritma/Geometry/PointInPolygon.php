<?php

// LombokAlgoritma — point in polygon, even–odd ray casting (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Geometry;

/** Even–odd rule with a ray towards +x. O(n). */
final class PointInPolygon
{
    /**
     * Edge (i, j = i − 1) toggles when (yᵢ > y) ≠ (yⱼ > y) and x < ((xⱼ − xᵢ)·(y − yᵢ))/(yⱼ − yᵢ) + xᵢ.
     * Boundary points may go either way, deterministically.
     *
     * @param list<Point> $polygon vertices in order (closing edge implied)
     */
    public static function contains(Point $point, array $polygon): bool
    {
        $x = $point->x;
        $y = $point->y;
        $inside = false;
        $n = count($polygon);
        for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
            $pi = $polygon[$i];
            $pj = $polygon[$j];
            if (
                ($pi->y > $y) !== ($pj->y > $y)
                && $x < (($pj->x - $pi->x) * ($y - $pi->y)) / ($pj->y - $pi->y) + $pi->x
            ) {
                $inside = !$inside;
            }
        }
        return $inside;
    }
}

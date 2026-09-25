<?php

// LombokAlgoritma — Bézier curve evaluation, de Casteljau (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Geometry;

use LombokAlgoritma\AlgoException;

/** de Casteljau evaluation, O(n²). */
final class Bezier
{
    /**
     * Point at parameter t: each level replaces pᵢ with pᵢ·s + pᵢ₊₁·t, s = 1 − t.
     *
     * @param list<Point> $controlPoints
     * @throws AlgoException EMPTY_INPUT with no control points
     */
    public static function at(array $controlPoints, int|float $t): Point
    {
        if ($controlPoints === []) {
            throw AlgoException::emptyInput('bezier (need ≥ 1 control point)');
        }
        $pts = $controlPoints;
        $s = 1 - $t;
        while (count($pts) > 1) {
            $next = [];
            for ($i = 0; $i + 1 < count($pts); $i++) {
                $p = $pts[$i];
                $q = $pts[$i + 1];
                $next[] = new Point($p->x * $s + $q->x * $t, $p->y * $s + $q->y * $t);
            }
            $pts = $next;
        }
        return $pts[0];
    }
}

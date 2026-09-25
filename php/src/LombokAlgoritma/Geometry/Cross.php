<?php

// LombokAlgoritma — 2-D cross product (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Geometry;

/** z-component of (A − O) × (B − O). */
final class Cross
{
    /**
     * `(A.x − O.x)·(B.y − O.y) − (A.y − O.y)·(B.x − O.x)`: > 0 counter-clockwise, < 0 clockwise,
     * 0 collinear.
     */
    public static function of(Point $o, Point $a, Point $b): float
    {
        return ($a->x - $o->x) * ($b->y - $o->y) - ($a->y - $o->y) * ($b->x - $o->x);
    }
}

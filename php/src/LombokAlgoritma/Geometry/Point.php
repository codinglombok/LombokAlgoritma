<?php

// LombokAlgoritma — 2-D point
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Geometry;

/** A point (or vector) in the plane. */
final class Point
{
    public readonly float $x;
    public readonly float $y;

    /** Coordinates are stored as IEEE-754 doubles (JS `number` semantics, incl. −0). */
    public function __construct(int|float $x, int|float $y)
    {
        $this->x = (float) $x;
        $this->y = (float) $y;
    }

    /** @param array{int|float, int|float} $xy */
    public static function of(array $xy): self
    {
        return new self($xy[0], $xy[1]);
    }

    /** @return array{float, float} */
    public function toArray(): array
    {
        return [$this->x, $this->y];
    }
}

# LombokAlgoritma — closest pair of points, divide and conquer (SPEC §13.2)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

import math
from collections.abc import Sequence

from ..errors import EmptyInputError
from .types import Point2D

_Best = tuple[Point2D, Point2D, float]


def _dist(a: Point2D, b: Point2D) -> float:
    dx = a[0] - b[0]
    dy = a[1] - b[1]
    return math.hypot(dx, dy)


def _brute(pts: Sequence[Point2D]) -> _Best:
    best: _Best = (pts[0], pts[1], math.inf)
    for i in range(len(pts)):
        for j in range(i + 1, len(pts)):
            d = _dist(pts[i], pts[j])
            if d < best[2]:
                best = (pts[i], pts[j], d)
    return best


def _solve(pts: Sequence[Point2D]) -> _Best:
    if len(pts) <= 3:
        return _brute(pts)
    mid = len(pts) >> 1
    mx = pts[mid][0]
    left = _solve(pts[:mid])
    right = _solve(pts[mid:])
    best = left if left[2] <= right[2] else right
    strip = sorted((p for p in pts if abs(p[0] - mx) < best[2]), key=lambda p: p[1])
    for i in range(len(strip)):
        j = i + 1
        while j < len(strip) and strip[j][1] - strip[i][1] < best[2]:
            d = _dist(strip[i], strip[j])
            if d < best[2]:
                best = (strip[i], strip[j], d)
            j += 1
    return best


def closest_pair(points: Sequence[Point2D]) -> tuple[Point2D, Point2D, float]:
    """Closest pair (p, q, d) with d = √(Δx·Δx + Δy·Δy) (no hypot). O(n log n).

    Only the distance is normative; which pair is returned on ties is not.

    Raises:
        EmptyInputError: fewer than 2 points.
    """
    if len(points) < 2:
        raise EmptyInputError("closest_pair (need >= 2 points)")
    return _solve(sorted(points, key=lambda p: (p[0], p[1])))

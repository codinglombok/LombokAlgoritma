# LombokAlgoritma — convex hull, Andrew's monotone chain (SPEC §13.2)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from collections.abc import Sequence

from .cross import cross
from .types import Point2D


def _chain(seq: Sequence[Point2D]) -> list[Point2D]:
    out: list[Point2D] = []
    for p in seq:
        while len(out) >= 2 and cross(out[-2], out[-1], p) <= 0:
            out.pop()
        out.append(p)
    out.pop()
    return out


def convex_hull(points: Sequence[Point2D]) -> list[Point2D]:
    """Hull counter-clockwise from the lowest (x, y) point; turns must be strictly CCW.

    Fewer than 3 points are returned sorted by (x, y); all-identical points give one point.
    """
    pts = sorted(points, key=lambda p: (p[0], p[1]))
    if len(pts) < 3:
        return pts
    hull = _chain(pts) + _chain(pts[::-1])
    if len(hull) == 2 and hull[0][0] == hull[1][0] and hull[0][1] == hull[1][1]:
        return [hull[0]]
    return hull

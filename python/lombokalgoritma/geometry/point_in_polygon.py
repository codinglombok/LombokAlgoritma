# LombokAlgoritma — point in polygon, even-odd ray casting (SPEC §13.2)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from collections.abc import Sequence

from .types import Point2D


def point_in_polygon(point: Point2D, polygon: Sequence[Point2D]) -> bool:
    """Even–odd rule with a ray towards +x; edge (i, j = i − 1) toggles when
    (y_i > y) != (y_j > y) and x < ((x_j − x_i)·(y − y_i))/(y_j − y_i) + x_i.
    """
    x, y = point
    inside = False
    j = len(polygon) - 1
    for i in range(len(polygon)):
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        if ((yi > y) != (yj > y)) and x < ((xj - xi) * (y - yi)) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside

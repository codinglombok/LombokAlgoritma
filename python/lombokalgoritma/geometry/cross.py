# LombokAlgoritma — 2-D cross product (SPEC §13.2)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from .types import Point2D


def cross(o: Point2D, a: Point2D, b: Point2D) -> float:
    """(A.x − O.x)·(B.y − O.y) − (A.y − O.y)·(B.x − O.x): > 0 counter-clockwise turn."""
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

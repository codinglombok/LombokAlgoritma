# LombokAlgoritma — Bézier curve evaluation, de Casteljau (SPEC §13.2)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from collections.abc import Sequence

from ..errors import EmptyInputError
from .types import Point2D


def bezier(control_points: Sequence[Point2D], t: float) -> Point2D:
    """Point of the Bézier curve at t: each level p' = p·s + q·t with s = 1 − t.

    Raises:
        EmptyInputError: no control points.
    """
    if len(control_points) == 0:
        raise EmptyInputError("bezier (need >= 1 control point)")
    pts: list[Point2D] = [(p[0], p[1]) for p in control_points]
    s = 1 - t
    while len(pts) > 1:
        pts = [
            (p[0] * s + q[0] * t, p[1] * s + q[1] * t) for p, q in zip(pts, pts[1:], strict=False)
        ]
    return pts[0]

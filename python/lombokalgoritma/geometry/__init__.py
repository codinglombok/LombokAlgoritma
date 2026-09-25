# LombokAlgoritma — geometry (SPEC §13.2), one module per algorithm
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
"""2-D computational geometry on points (x, y)."""

from .bezier import bezier
from .closest_pair import closest_pair
from .convex_hull import convex_hull
from .cross import cross
from .point_in_polygon import point_in_polygon
from .types import Point2D

__all__ = ["Point2D", "bezier", "closest_pair", "convex_hull", "cross", "point_in_polygon"]

// LombokAlgoritma — convex hull, Andrew's monotone chain (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// ConvexHull returns the hull in counter-clockwise order from the lowest (x, y) point (Andrew's
// monotone chain; a turn must be strictly counter-clockwise, so collinear points and duplicates
// are dropped). Fewer than 3 points are returned sorted; identical points collapse to one.
func ConvexHull(points []Point2D) []Point2D {
	pts := sortPointsXY(points)
	if len(pts) < 3 {
		return pts
	}
	chain := func(seq []Point2D) []Point2D {
		var out []Point2D
		for _, p := range seq {
			for len(out) >= 2 && Cross(out[len(out)-2], out[len(out)-1], p) <= 0 {
				out = out[:len(out)-1]
			}
			out = append(out, p)
		}
		return out[:len(out)-1]
	}
	rev := make([]Point2D, len(pts))
	for i, p := range pts {
		rev[len(pts)-1-i] = p
	}
	hull := append(chain(pts), chain(rev)...)
	if len(hull) == 2 && hull[0] == hull[1] {
		return hull[:1]
	}
	return hull
}

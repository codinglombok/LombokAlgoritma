// LombokAlgoritma — 2-D geometry: point type and cross product (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "sort"

// Point2D is a point (or vector) in the plane.
type Point2D struct {
	X, Y float64
}

// Cross returns the z-component of (A − O) × (B − O), evaluated exactly as
// (A.x−O.x)·(B.y−O.y) − (A.y−O.y)·(B.x−O.x): > 0 counter-clockwise, < 0 clockwise, 0 collinear.
func Cross(o, a, b Point2D) float64 {
	return float64((a.X-o.X)*(b.Y-o.Y)) - float64((a.Y-o.Y)*(b.X-o.X))
}

func sortPointsXY(points []Point2D) []Point2D {
	pts := append([]Point2D(nil), points...)
	sort.SliceStable(pts, func(i, j int) bool {
		if pts[i].X != pts[j].X {
			return pts[i].X < pts[j].X
		}
		return pts[i].Y < pts[j].Y
	})
	return pts
}

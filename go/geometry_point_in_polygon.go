// LombokAlgoritma — point in polygon, even–odd ray casting (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// PointInPolygon reports whether point lies inside polygon (vertices in order, closing edge
// implied) by the even–odd rule with a ray towards +x. Edge (i, j = i−1) toggles when
// (yᵢ > y) ≠ (yⱼ > y) and x < ((xⱼ−xᵢ)·(y−yᵢ))/(yⱼ−yᵢ) + xᵢ.
func PointInPolygon(point Point2D, polygon []Point2D) bool {
	x, y := point.X, point.Y
	inside := false
	for i, j := 0, len(polygon)-1; i < len(polygon); j, i = i, i+1 {
		pi, pj := polygon[i], polygon[j]
		if (pi.Y > y) != (pj.Y > y) && x < float64((pj.X-pi.X)*(y-pi.Y))/(pj.Y-pi.Y)+pi.X {
			inside = !inside
		}
	}
	return inside
}

// LombokAlgoritma — Bézier curve evaluation, de Casteljau (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// Bezier evaluates the Bézier curve with the given control points at t by de Casteljau:
// with s = 1 − t every level replaces pᵢ by pᵢ·s + pᵢ₊₁·t. No control points yield EMPTY_INPUT.
func Bezier(controlPoints []Point2D, t float64) (Point2D, error) {
	if len(controlPoints) == 0 {
		return Point2D{}, newErr(CodeEmptyInput, "Bezier: need ≥ 1 control point")
	}
	pts := append([]Point2D(nil), controlPoints...)
	s := 1 - t
	for len(pts) > 1 {
		for i := 0; i+1 < len(pts); i++ {
			p, q := pts[i], pts[i+1]
			pts[i] = Point2D{float64(p.X*s) + float64(q.X*t), float64(p.Y*s) + float64(q.Y*t)}
		}
		pts = pts[:len(pts)-1]
	}
	return pts[0], nil
}

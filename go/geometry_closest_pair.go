// LombokAlgoritma — closest pair of points, divide and conquer (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"math"
	"sort"
)

func pointDist(a, b Point2D) float64 {
	dx := a.X - b.X
	dy := a.Y - b.Y
	return math.Sqrt(float64(dx*dx) + float64(dy*dy))
}

// ClosestPair returns a closest pair among ≥ 2 points and their distance √(Δx·Δx + Δy·Δy)
// (divide and conquer, O(n log n)). Only the distance is normative. Fewer than 2 points yield
// EMPTY_INPUT.
func ClosestPair(points []Point2D) (p, q Point2D, dist float64, err error) {
	if len(points) < 2 {
		return p, q, 0, newErr(CodeEmptyInput, "ClosestPair: need ≥ 2 points")
	}
	type best struct {
		p, q Point2D
		d    float64
	}
	brute := func(pts []Point2D) best {
		b := best{pts[0], pts[1], math.Inf(1)}
		for i := range pts {
			for j := i + 1; j < len(pts); j++ {
				if d := pointDist(pts[i], pts[j]); d < b.d {
					b = best{pts[i], pts[j], d}
				}
			}
		}
		return b
	}
	var solve func(pts []Point2D) best
	solve = func(pts []Point2D) best {
		if len(pts) <= 3 {
			return brute(pts)
		}
		mid := len(pts) >> 1
		mx := pts[mid].X
		left := solve(pts[:mid])
		right := solve(pts[mid:])
		b := right
		if left.d <= right.d {
			b = left
		}
		var strip []Point2D
		for _, s := range pts {
			if math.Abs(s.X-mx) < b.d {
				strip = append(strip, s)
			}
		}
		sort.SliceStable(strip, func(i, j int) bool { return strip[i].Y < strip[j].Y })
		for i := range strip {
			for j := i + 1; j < len(strip) && strip[j].Y-strip[i].Y < b.d; j++ {
				if d := pointDist(strip[i], strip[j]); d < b.d {
					b = best{strip[i], strip[j], d}
				}
			}
		}
		return b
	}
	b := solve(sortPointsXY(points))
	return b.p, b.q, b.d, nil
}

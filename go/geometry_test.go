// LombokAlgoritma — geometry tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"math"
	"testing"
)

func TestGeometry(t *testing.T) {
	assertEqual(t, Cross(Point2D{0, 0}, Point2D{1, 0}, Point2D{0, 1}), 1.0)
	sq := []Point2D{{0, 0}, {2, 0}, {2, 2}, {0, 2}, {1, 1}, {1, 0}, {0, 0}}
	assertEqual(t, ConvexHull(sq), []Point2D{{0, 0}, {2, 0}, {2, 2}, {0, 2}})
	assertEqual(t, ConvexHull([]Point2D{{3, 1}, {1, 1}}), []Point2D{{1, 1}, {3, 1}})
	assertEqual(t, ConvexHull([]Point2D{{5, 5}, {5, 5}, {5, 5}}), []Point2D{{5, 5}})

	pts := []Point2D{{0, 0}, {5, 5}, {1, 1}, {9, 9}, {1.5, 1.5}, {20, 0}, {3, 3}, {7, 2}}
	_, _, d, err := ClosestPair(pts)
	if err != nil || math.Abs(d-math.Sqrt(0.5)) > 1e-15 {
		t.Errorf("closest pair %v %v", d, err)
	}
	_, _, _, err = ClosestPair(pts[:1])
	assertCode(t, err, CodeEmptyInput)

	poly := []Point2D{{0, 0}, {10, 0}, {10, 10}, {0, 10}}
	if !PointInPolygon(Point2D{5, 5}, poly) || PointInPolygon(Point2D{15, 5}, poly) || PointInPolygon(Point2D{1, 1}, nil) {
		t.Error("point in polygon")
	}
	p := must(Bezier([]Point2D{{0, 0}, {1, 2}, {3, 3}, {4, 0}}, 0.25))
	assertEqual(t, p, Point2D{0.90625, 1.265625})
	_, err = Bezier(nil, 0.5)
	assertCode(t, err, CodeEmptyInput)
}

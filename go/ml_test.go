// LombokAlgoritma — ML tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"math"
	"testing"
)

func TestSimilarity(t *testing.T) {
	a, b := []float64{1, 2, 3}, []float64{4, 5, 6}
	assertEqual(t, must(DotProduct(a, b)), 32.0)
	assertEqual(t, must(L1Distance(a, b)), 9.0)
	assertEqual(t, must(L2Distance([]float64{0, 0}, []float64{3, 4})), 5.0)
	assertEqual(t, must(CosineSimilarity([]float64{0, 0}, []float64{1, 0})), 0.0)
	if c := must(CosineSimilarity(a, a)); math.Abs(c-1) > 1e-15 {
		t.Errorf("cos(a,a) = %v", c)
	}
	assertEqual(t, Normalize([]float64{0, 0}), []float64{0, 0})
	assertEqual(t, Normalize([]float64{3, 4}), []float64{0.6, 0.8})
	assertEqual(t, JaccardSimilarity([]string{"a", "b", "b"}, []string{"b", "c"}), 1.0/3)
	assertEqual(t, JaccardSimilarity(nil, nil), 1.0)
	assertEqual(t, must(Pearson(a, b)), 1.0)
	assertEqual(t, must(Pearson([]float64{1, 1}, []float64{1, 2})), 0.0)
	short := []float64{1}
	for name, f := range map[string]func() error{
		"dot":     func() error { _, err := DotProduct(a, short); return err },
		"cosine":  func() error { _, err := CosineSimilarity(a, short); return err },
		"l2":      func() error { _, err := L2Distance(a, short); return err },
		"l1":      func() error { _, err := L1Distance(a, short); return err },
		"pearson": func() error { _, err := Pearson(a, short); return err },
		"batch":   func() error { _, err := BatchCosine(a, [][]float64{a, short}); return err },
	} {
		t.Run(name, func(t *testing.T) { assertCode(t, f(), CodeInvalidInput) })
	}
	got := must(BatchCosine([]float64{1, 0}, [][]float64{{0, 0}, {1, 0}, {0, 1}, {2, 0}}))
	assertEqual(t, got, []ScoredIndex{{1, 1}, {3, 1}, {0, 0}, {2, 0}})
}

func TestKMeans(t *testing.T) {
	pts := [][]float64{{0, 0}, {0, 1}, {1, 0}, {10, 10}, {10, 11}, {11, 10}}
	r := must(KMeans(pts, 2, 100, 1e-9, DefaultXoshiroSeed))
	if r.Labels[0] != r.Labels[1] || r.Labels[0] == r.Labels[3] || r.Iterations < 1 {
		t.Errorf("labels %v", r.Labels)
	}
	if math.Abs(r.Inertia-8.0/3) > 1e-9 {
		t.Errorf("inertia %v", r.Inertia)
	}
	// identical points: the second centroid falls back to the last point, one cluster stays empty
	same := must(KMeans([][]float64{{1, 1}, {1, 1}, {1, 1}}, 2, 5, 1e-4, 3))
	assertEqual(t, same.Centroids, [][]float64{{1, 1}, {1, 1}})
	zero := must(KMeans(pts, 1, 0, 1e-4, 1))
	assertEqual(t, zero.Iterations, 0)
	_, err := KMeans(nil, 1, 5, 1e-4, 1)
	assertCode(t, err, CodeEmptyInput)
	_, err = KMeans(pts, 7, 5, 1e-4, 1)
	assertCode(t, err, CodeOutOfRange)
	_, err = KMeans([][]float64{{1, 2}, {1}}, 1, 5, 1e-4, 1)
	assertCode(t, err, CodeInvalidInput)
}

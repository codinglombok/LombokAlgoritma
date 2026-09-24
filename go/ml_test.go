// LombokAlgoritma — Go ML Tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"math"
	"reflect"
	"testing"
)

func TestCosineAndDistance(t *testing.T) {
	if math.Abs(CosineSimilarity([]float64{1, 0}, []float64{1, 0})-1) > 1e-12 {
		t.Error("cos identical")
	}
	if CosineSimilarity([]float64{0, 0}, []float64{1, 0}) != 0 {
		t.Error("cos zero vector must be 0")
	}
	if L2Distance([]float64{0, 0}, []float64{3, 4}) != 5 {
		t.Error("l2")
	}
	n := Normalize([]float64{3, 4})
	if math.Abs(n[0]-0.6) > 1e-12 || math.Abs(n[1]-0.8) > 1e-12 {
		t.Error("normalize")
	}
}

func TestBatchCosineStableNoNaN(t *testing.T) {
	q := []float64{1, 0}
	c := [][]float64{{0, 0}, {1, 0}, {0, 1}, {2, 0}, {0, 0}}
	// scores: 0, 1, 0, 1, 0  → ties resolved by index
	want := []int{1, 3, 0, 2, 4}
	if got := BatchCosine(q, c); !reflect.DeepEqual(got, want) {
		t.Errorf("BatchCosine = %v, want %v", got, want)
	}
}

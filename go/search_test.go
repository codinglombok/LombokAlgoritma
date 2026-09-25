// LombokAlgoritma — search tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"math"
	"testing"
)

func TestSearchFamily(t *testing.T) {
	arr := make([]int, 1000)
	for i := range arr {
		arr[i] = 2 * i
	}
	fs := map[string]func([]int, int) int{
		"binary": BinarySearch[int], "jump": JumpSearch[int], "interpolation": InterpolationSearch[int],
		"linear": LinearSearch[int], "exponential": ExponentialSearch[int], "fibonacci": FibonacciSearch[int],
	}
	for name, f := range fs {
		for i := range arr {
			if got := f(arr, 2*i); got != i {
				t.Fatalf("%s(%d) = %d, want %d", name, 2*i, got, i)
			}
		}
		for _, miss := range []int{-1, 1, 999, 1999, 5000} {
			if got := f(arr, miss); got != -1 {
				t.Errorf("%s(%d) = %d, want -1", name, miss, got)
			}
		}
		if f(nil, 1) != -1 {
			t.Errorf("%s on empty slice", name)
		}
	}
	if LowerBound([]int{1, 3, 3, 5}, 3) != 1 || UpperBound([]int{1, 3, 3, 5}, 3) != 3 {
		t.Error("bounds")
	}
}

func TestInterpolationLargeValues(t *testing.T) {
	arr := []int64{math.MinInt64, -5, 0, 7, math.MaxInt64}
	for i, v := range arr {
		if got := InterpolationSearch(arr, v); got != i {
			t.Errorf("InterpolationSearch(%d) = %d, want %d", v, got, i)
		}
	}
	if InterpolationSearch([]int{4, 4, 4}, 4) != 0 || InterpolationSearch([]int{4, 4}, 5) != -1 {
		t.Error("flat range")
	}
}

func TestTernarySearch(t *testing.T) {
	x := TernarySearch(0, 10, func(x float64) float64 { return -(x - 3) * (x - 3) }, true, 1e-9)
	if math.Abs(x-3) > 1e-6 {
		t.Errorf("max at %v", x)
	}
	x = TernarySearch(-5, 5, func(x float64) float64 { return (x + 1) * (x + 1) }, false, 1e-9)
	if math.Abs(x+1) > 1e-6 {
		t.Errorf("min at %v", x)
	}
}

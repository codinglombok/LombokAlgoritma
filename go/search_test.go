// LombokAlgoritma — Go Search Tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "testing"

func TestSearchFamily(t *testing.T) {
	arr := make([]int, 1000)
	for i := range arr {
		arr[i] = 2 * i
	}
	for _, target := range []int{0, 2, 998, 1998, 1000} {
		want := target / 2
		if BinarySearch(arr, target) != want || JumpSearch(arr, target) != want ||
			InterpolationSearch(arr, target) != want || LinearSearch(arr, target) != want {
			t.Errorf("search(%d) mismatch", target)
		}
	}
	for _, miss := range []int{-1, 1, 1999, 5000} {
		if BinarySearch(arr, miss) != -1 || JumpSearch(arr, miss) != -1 || InterpolationSearch(arr, miss) != -1 {
			t.Errorf("search(%d) should miss", miss)
		}
	}
	if JumpSearch([]int{}, 1) != -1 || BinarySearch([]int{}, 1) != -1 {
		t.Error("empty slice")
	}
	if LowerBound([]int{1, 3, 3, 5}, 3) != 1 || UpperBound([]int{1, 3, 3, 5}, 3) != 3 {
		t.Error("bounds")
	}
}

func TestJumpSearchBoundary(t *testing.T) {
	if JumpSearch([]int{0, 1, 2, 3}, 2) != 2 {
		t.Error("target on jump boundary must be found")
	}
	arr := make([]int, 1000)
	for i := range arr {
		arr[i] = 2 * i
	}
	for i := range arr {
		if got := JumpSearch(arr, 2*i); got != i {
			t.Fatalf("JumpSearch(%d) = %d, want %d", 2*i, got, i)
		}
	}
}

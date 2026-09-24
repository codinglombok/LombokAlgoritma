// LombokAlgoritma — Go Sort Tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"reflect"
	"sort"
	"testing"
)

func TestTimsortEmpty(t *testing.T)  { assertEqual(t, Timsort([]int{}), []int{}) }
func TestTimsortSingle(t *testing.T) { assertEqual(t, Timsort([]int{42}), []int{42}) }
func TestTimsortSorted(t *testing.T) {
	assertEqual(t, Timsort([]int{1, 2, 3, 4, 5}), []int{1, 2, 3, 4, 5})
}
func TestTimsortReverse(t *testing.T) {
	assertEqual(t, Timsort([]int{5, 4, 3, 2, 1}), []int{1, 2, 3, 4, 5})
}
func TestTimsortDupes(t *testing.T) {
	assertEqual(t, Timsort([]int{3, 1, 2, 1, 3}), []int{1, 1, 2, 3, 3})
}
func TestTimsortNeg(t *testing.T) {
	assertEqual(t, Timsort([]int{-3, -1, 0, 2, -2}), []int{-3, -2, -1, 0, 2})
}

func TestQuicksortBasic(t *testing.T) {
	assertEqual(t, Quicksort([]int{5, 3, 1, 4, 2}), []int{1, 2, 3, 4, 5})
}
func TestMergesortBasic(t *testing.T) {
	assertEqual(t, Mergesort([]int{5, 3, 1, 4, 2}), []int{1, 2, 3, 4, 5})
}
func TestRadixSortLSD(t *testing.T) {
	assertEqual(t,
		RadixSortLSD([]uint32{170, 45, 75, 90, 802, 24, 2, 66}),
		[]uint32{2, 24, 45, 66, 75, 90, 170, 802},
	)
}

func assertEqual[T any](t *testing.T, got, want T) {
	t.Helper()
	if !reflect.DeepEqual(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestSortsMatchStdlib(t *testing.T) {
	seed := uint64(1)
	next := func() int {
		seed = seed*6364136223846793005 + 1442695040888963407
		return int(seed>>33) % 50
	}
	for _, n := range []int{0, 1, 15, 16, 17, 32, 33, 100, 1000} {
		in := make([]int, n)
		for i := range in {
			in[i] = next()
		}
		want := append([]int{}, in...)
		sort.Ints(want)
		for name, f := range map[string]func([]int) []int{"timsort": Timsort[int], "quicksort": Quicksort[int], "mergesort": Mergesort[int]} {
			if got := f(in); !reflect.DeepEqual(got, want) && !(n == 0 && len(got) == 0) {
				t.Errorf("%s n=%d mismatch", name, n)
			}
		}
	}
}

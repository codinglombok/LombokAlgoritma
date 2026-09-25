// LombokAlgoritma — sort tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"cmp"
	"math"
	"slices"
	"testing"
)

func TestSortsMatchStdlib(t *testing.T) {
	r := NewPcg32(7, 7)
	for _, n := range []int{0, 1, 2, 15, 16, 17, 31, 32, 33, 64, 100, 1000} {
		in := make([]int64, n)
		for i := range in {
			v, _ := r.NextBounded(200)
			in[i] = int64(v) - 100
		}
		orig := slices.Clone(in)
		want := slices.Clone(in)
		slices.Sort(want)
		for name, f := range map[string]func([]int64) []int64{
			"timsort": Timsort[int64], "quicksort": Quicksort[int64], "mergesort": Mergesort[int64],
			"heapsort": Heapsort[int64], "radix": RadixSortLSD,
		} {
			assertEqual(t, f(in), want)
			if !slices.Equal(in, orig) {
				t.Fatalf("%s modified its input", name)
			}
		}
	}
}

func TestRadixFullRange(t *testing.T) {
	in := []int64{math.MaxInt64, math.MinInt64, 0, -1, 1, math.MinInt64 + 1}
	want := slices.Clone(in)
	slices.Sort(want)
	assertEqual(t, RadixSortLSD(in), want)
	assertEqual(t, RadixSortLSD([]int64{5}), []int64{5})
}

func TestStableSorts(t *testing.T) {
	type kv struct{ k, i int }
	in := make([]kv, 100)
	for i := range in {
		in[i] = kv{(i * 37) % 5, i}
	}
	byKey := func(a, b kv) int { return cmp.Compare(a.k, b.k) }
	want := slices.Clone(in)
	slices.SortStableFunc(want, byKey)
	assertEqual(t, TimsortFunc(in, byKey), want)
	assertEqual(t, MergesortFunc(in, byKey), want)
	q := QuicksortFunc(in, byKey)
	h := HeapsortFunc(in, byKey)
	if !slices.IsSortedFunc(q, byKey) || !slices.IsSortedFunc(h, byKey) {
		t.Error("unstable sorts must still sort")
	}
}

func TestCountingSort(t *testing.T) {
	assertEqual(t, must(CountingSort([]int{3, 0, 2, 3, 1})), []int{0, 1, 2, 3, 3})
	assertEqual(t, must(CountingSort([]int{-4})), []int{-4})
	_, err := CountingSort([]int{3, -1, 2})
	assertCode(t, err, CodeOutOfRange)
	_, err = CountingSortMax([]int{3, 9}, 5)
	assertCode(t, err, CodeOutOfRange)
	assertEqual(t, must(CountingSortMax([]int{5, 1}, 5)), []int{1, 5})
	assertEqual(t, must(CountingSortMax(nil, 5)), []int{})
}

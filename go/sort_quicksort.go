// LombokAlgoritma — quicksort (median-of-three, insertion sort for small ranges)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "cmp"

// Quicksort returns a sorted copy of arr. Not stable; O(n log n) average. Only the order of the
// values is normative (SPEC §6), so this port does not shuffle.
func Quicksort[T cmp.Ordered](arr []T) []T { return QuicksortFunc(arr, cmp.Compare[T]) }

// QuicksortFunc returns a copy of arr sorted by compare. Not stable.
func QuicksortFunc[T any](arr []T, compare func(a, b T) int) []T {
	a := append(make([]T, 0, len(arr)), arr...)
	if len(a) > 1 {
		quicksortRange(a, 0, len(a)-1, compare)
	}
	return a
}

func quicksortRange[T any](a []T, lo, hi int, compare func(a, b T) int) {
	for lo < hi {
		if hi-lo < 16 {
			insertionSortFunc(a, lo, hi, compare)
			return
		}
		p := quickPartition(a, lo, hi, compare)
		// recurse on the smaller side, loop on the larger one: O(log n) stack
		if p-lo < hi-p {
			quicksortRange(a, lo, p-1, compare)
			lo = p + 1
		} else {
			quicksortRange(a, p+1, hi, compare)
			hi = p - 1
		}
	}
}

func quickPartition[T any](a []T, lo, hi int, compare func(a, b T) int) int {
	mid := int(uint(lo+hi) >> 1)
	if compare(a[lo], a[mid]) > 0 {
		a[lo], a[mid] = a[mid], a[lo]
	}
	if compare(a[lo], a[hi]) > 0 {
		a[lo], a[hi] = a[hi], a[lo]
	}
	if compare(a[mid], a[hi]) > 0 {
		a[mid], a[hi] = a[hi], a[mid]
	}
	a[mid], a[hi] = a[hi], a[mid]
	pivot := a[hi]
	i := lo - 1
	for j := lo; j < hi; j++ {
		if compare(a[j], pivot) <= 0 {
			i++
			a[i], a[j] = a[j], a[i]
		}
	}
	a[i+1], a[hi] = a[hi], a[i+1]
	return i + 1
}

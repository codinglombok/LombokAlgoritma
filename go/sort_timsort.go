// LombokAlgoritma — Timsort (stable; insertion-sorted runs + bottom-up merges)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "cmp"

const minMerge = 32

// Timsort returns a sorted copy of arr. Stable, O(n log n).
func Timsort[T cmp.Ordered](arr []T) []T { return TimsortFunc(arr, cmp.Compare[T]) }

// TimsortFunc returns a copy of arr sorted by compare (negative ⇒ a before b). Stable: elements
// that compare equal keep their original order (SPEC §6).
func TimsortFunc[T any](arr []T, compare func(a, b T) int) []T {
	a := append(make([]T, 0, len(arr)), arr...)
	n := len(a)
	if n <= 1 {
		return a
	}
	minRun := minRunLength(n)
	for i := 0; i < n; i += minRun {
		insertionSortFunc(a, i, min(i+minRun-1, n-1), compare)
	}
	for size := minRun; size < n; size *= 2 {
		for lo := 0; lo < n; lo += 2 * size {
			mid := min(lo+size-1, n-1)
			hi := min(lo+2*size-1, n-1)
			if mid < hi {
				mergeRuns(a, lo, mid, hi, compare)
			}
		}
	}
	return a
}

func minRunLength(n int) int {
	r := 0
	for n >= minMerge {
		r |= n & 1
		n >>= 1
	}
	return n + r
}

// insertionSortFunc sorts a[lo..hi] (inclusive).
func insertionSortFunc[T any](a []T, lo, hi int, compare func(a, b T) int) {
	for i := lo + 1; i <= hi; i++ {
		key := a[i]
		j := i - 1
		for j >= lo && compare(a[j], key) > 0 {
			a[j+1] = a[j]
			j--
		}
		a[j+1] = key
	}
}

// mergeRuns merges a[lo..mid] and a[mid+1..hi] (inclusive bounds).
func mergeRuns[T any](a []T, lo, mid, hi int, compare func(a, b T) int) {
	left := append([]T(nil), a[lo:mid+1]...)
	right := append([]T(nil), a[mid+1:hi+1]...)
	i, j, k := 0, 0, lo
	for i < len(left) && j < len(right) {
		if compare(left[i], right[j]) <= 0 {
			a[k] = left[i]
			i++
		} else {
			a[k] = right[j]
			j++
		}
		k++
	}
	k += copy(a[k:], left[i:])
	copy(a[k:], right[j:])
}

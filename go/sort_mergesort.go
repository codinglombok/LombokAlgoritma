// LombokAlgoritma — bottom-up iterative mergesort
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "cmp"

// Mergesort returns a sorted copy of arr. Stable, O(n log n), no recursion.
func Mergesort[T cmp.Ordered](arr []T) []T { return MergesortFunc(arr, cmp.Compare[T]) }

// MergesortFunc returns a copy of arr sorted by compare. Stable.
func MergesortFunc[T any](arr []T, compare func(a, b T) int) []T {
	a := append(make([]T, 0, len(arr)), arr...)
	n := len(a)
	if n <= 1 {
		return a
	}
	tmp := make([]T, n)
	for width := 1; width < n; width *= 2 {
		for lo := 0; lo < n; lo += 2 * width {
			mid := min(lo+width, n)
			hi := min(lo+2*width, n)
			i, j, k := lo, mid, lo
			for i < mid && j < hi {
				if compare(a[i], a[j]) <= 0 {
					tmp[k] = a[i]
					i++
				} else {
					tmp[k] = a[j]
					j++
				}
				k++
			}
			k += copy(tmp[k:], a[i:mid])
			copy(tmp[k:], a[j:hi])
			copy(a[lo:hi], tmp[lo:hi])
		}
	}
	return a
}

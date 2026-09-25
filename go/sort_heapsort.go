// LombokAlgoritma — heapsort
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "cmp"

// Heapsort returns a sorted copy of arr. Not stable, O(n log n) in all cases.
func Heapsort[T cmp.Ordered](arr []T) []T { return HeapsortFunc(arr, cmp.Compare[T]) }

// HeapsortFunc returns a copy of arr sorted by compare. Not stable.
func HeapsortFunc[T any](arr []T, compare func(a, b T) int) []T {
	a := append(make([]T, 0, len(arr)), arr...)
	n := len(a)
	for i := n/2 - 1; i >= 0; i-- {
		siftDown(a, i, n, compare)
	}
	for end := n - 1; end > 0; end-- {
		a[0], a[end] = a[end], a[0]
		siftDown(a, 0, end, compare)
	}
	return a
}

func siftDown[T any](a []T, root, end int, compare func(a, b T) int) {
	for {
		largest := root
		left := 2*root + 1
		right := left + 1
		if left < end && compare(a[left], a[largest]) > 0 {
			largest = left
		}
		if right < end && compare(a[right], a[largest]) > 0 {
			largest = right
		}
		if largest == root {
			return
		}
		a[root], a[largest] = a[largest], a[root]
		root = largest
	}
}

// LombokAlgoritma — Go Sort Module
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "cmp"

// Timsort performs stable adaptive sort. O(n log n).
func Timsort[T cmp.Ordered](arr []T) []T {
	result := make([]T, len(arr))
	copy(result, arr)
	timSortSlice(result)
	return result
}

func timSortSlice[T cmp.Ordered](a []T) {
	n := len(a)
	if n <= 1 {
		return
	}
	minRun := minRunLength(n)
	for i := 0; i < n; i += minRun {
		end := i + minRun
		if end > n {
			end = n
		}
		insertionSort(a, i, end)
	}
	for size := minRun; size < n; size *= 2 {
		for lo := 0; lo < n; lo += 2 * size {
			mid := lo + size
			if mid > n {
				mid = n
			}
			hi := lo + 2*size
			if hi > n {
				hi = n
			}
			if mid < hi {
				merge(a, lo, mid, hi)
			}
		}
	}
}

func minRunLength(n int) int {
	r := 0
	for n >= 32 {
		r |= n & 1
		n >>= 1
	}
	return n + r
}

func insertionSort[T cmp.Ordered](a []T, lo, hi int) {
	for i := lo + 1; i < hi; i++ {
		key := a[i]
		j := i - 1
		for j >= lo && a[j] > key {
			a[j+1] = a[j]
			j--
		}
		a[j+1] = key
	}
}

func merge[T cmp.Ordered](a []T, lo, mid, hi int) {
	left := make([]T, mid-lo)
	right := make([]T, hi-mid)
	copy(left, a[lo:mid])
	copy(right, a[mid:hi])
	i, j, k := 0, 0, lo
	for i < len(left) && j < len(right) {
		if left[i] <= right[j] {
			a[k] = left[i]
			i++
		} else {
			a[k] = right[j]
			j++
		}
		k++
	}
	for i < len(left) {
		a[k] = left[i]
		i++
		k++
	}
	for j < len(right) {
		a[k] = right[j]
		j++
		k++
	}
}

// Quicksort — median-of-three single-pivot quicksort with insertion sort for
// n ≤ 16. O(n log n) average. Not stable. Returns a sorted copy.
func Quicksort[T cmp.Ordered](arr []T) []T {
	result := make([]T, len(arr))
	copy(result, arr)
	quicksortInner(result)
	return result
}

func quicksortInner[T cmp.Ordered](a []T) {
	if len(a) <= 16 {
		insertionSort(a, 0, len(a))
		return
	}
	p := partition(a)
	quicksortInner(a[:p])
	quicksortInner(a[p+1:])
}

func partition[T cmp.Ordered](a []T) int {
	hi := len(a) - 1
	mid := hi / 2
	if a[0] > a[mid] {
		a[0], a[mid] = a[mid], a[0]
	}
	if a[0] > a[hi] {
		a[0], a[hi] = a[hi], a[0]
	}
	if a[mid] > a[hi] {
		a[mid], a[hi] = a[hi], a[mid]
	}
	a[mid], a[hi] = a[hi], a[mid]
	i := 0
	for j := 0; j < hi; j++ {
		if a[j] <= a[hi] {
			a[i], a[j] = a[j], a[i]
			i++
		}
	}
	a[i], a[hi] = a[hi], a[i]
	return i
}

// Mergesort — bottom-up iterative. O(n log n). Stable.
func Mergesort[T cmp.Ordered](arr []T) []T {
	n := len(arr)
	a := make([]T, n)
	copy(a, arr)
	tmp := make([]T, n)
	for w := 1; w < n; w *= 2 {
		for lo := 0; lo < n; lo += 2 * w {
			mid := lo + w
			if mid > n {
				mid = n
			}
			hi := lo + 2*w
			if hi > n {
				hi = n
			}
			i, j, k := lo, mid, lo
			for i < mid && j < hi {
				if a[i] <= a[j] {
					tmp[k] = a[i]
					i++
				} else {
					tmp[k] = a[j]
					j++
				}
				k++
			}
			for i < mid {
				tmp[k] = a[i]
				i++
				k++
			}
			for j < hi {
				tmp[k] = a[j]
				j++
				k++
			}
		}
		copy(a, tmp)
	}
	return a
}

// RadixSortLSD — LSD radix sort for uint32. O(nk).
func RadixSortLSD(arr []uint32) []uint32 {
	if len(arr) <= 1 {
		return append([]uint32{}, arr...)
	}
	a := make([]uint32, len(arr))
	copy(a, arr)
	tmp := make([]uint32, len(a))
	for shift := uint(0); shift < 32; shift += 8 {
		var count [256]int
		for _, v := range a {
			count[(v>>shift)&0xFF]++
		}
		for i := 1; i < 256; i++ {
			count[i] += count[i-1]
		}
		for k := len(a) - 1; k >= 0; k-- {
			idx := (a[k] >> shift) & 0xFF
			count[idx]--
			tmp[count[idx]] = a[k]
		}
		copy(a, tmp)
	}
	return a
}

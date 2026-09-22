// Package lombokalgoritma — Go Search Module
// Apache-2.0 — @codinglombok
package lombokalgoritma

import "cmp"

// BinarySearch returns index of target in sorted arr, or -1.
func BinarySearch[T cmp.Ordered](arr []T, target T) int {
	lo, hi := 0, len(arr)-1
	for lo <= hi {
		mid := (lo + hi) >> 1
		if arr[mid] == target {
			return mid
		} else if arr[mid] < target {
			lo = mid + 1
		} else {
			hi = mid - 1
		}
	}
	return -1
}

// LowerBound returns the first index i where arr[i] >= target.
func LowerBound[T cmp.Ordered](arr []T, target T) int {
	lo, hi := 0, len(arr)
	for lo < hi {
		mid := (lo + hi) >> 1
		if arr[mid] < target {
			lo = mid + 1
		} else {
			hi = mid
		}
	}
	return lo
}

// UpperBound returns the first index i where arr[i] > target.
func UpperBound[T cmp.Ordered](arr []T, target T) int {
	lo, hi := 0, len(arr)
	for lo < hi {
		mid := (lo + hi) >> 1
		if arr[mid] <= target {
			lo = mid + 1
		} else {
			hi = mid
		}
	}
	return lo
}

// InterpolationSearch for uniformly distributed integer slices. O(log log n) avg.
func InterpolationSearch(arr []int, target int) int {
	lo, hi := 0, len(arr)-1
	for lo <= hi && target >= arr[lo] && target <= arr[hi] {
		if lo == hi {
			if arr[lo] == target {
				return lo
			}
			return -1
		}
		rng := arr[hi] - arr[lo]
		if rng == 0 {
			if arr[lo] == target {
				return lo
			}
			return -1
		}
		pos := lo + int(float64(hi-lo)*float64(target-arr[lo])/float64(rng))
		if arr[pos] == target {
			return pos
		}
		if arr[pos] < target {
			lo = pos + 1
		} else {
			hi = pos - 1
		}
	}
	return -1
}

// JumpSearch. O(sqrt(n)).
func JumpSearch[T cmp.Ordered](arr []T, target T) int {
	n := len(arr)
	step := int(float64(n) * 0.5) // sqrt approximation
	if step == 0 {
		step = 1
	}
	prev, cur := 0, step
	for cur < n && arr[cur] < target {
		prev = cur
		cur += step
	}
	for i := prev; i < min(cur, n); i++ {
		if arr[i] == target {
			return i
		}
	}
	return -1
}

// LinearSearch. O(n) baseline.
func LinearSearch[T comparable](arr []T, target T) int {
	for i, v := range arr {
		if v == target {
			return i
		}
	}
	return -1
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

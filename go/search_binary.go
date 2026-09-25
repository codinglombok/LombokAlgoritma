// LombokAlgoritma — binary search, lower/upper bound, exponential search (SPEC §7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "cmp"

// BinarySearch returns an index of target in the ascending slice arr, or −1.
// lo = 0, hi = n−1; mid = ⌊(lo+hi)/2⌋ (normative for duplicates).
func BinarySearch[T cmp.Ordered](arr []T, target T) int {
	lo, hi := 0, len(arr)-1
	for lo <= hi {
		mid := int(uint(lo+hi) >> 1)
		switch {
		case arr[mid] == target:
			return mid
		case arr[mid] < target:
			lo = mid + 1
		default:
			hi = mid - 1
		}
	}
	return -1
}

// LowerBound returns the first index i with arr[i] ≥ target (len(arr) when none).
func LowerBound[T cmp.Ordered](arr []T, target T) int {
	lo, hi := 0, len(arr)
	for lo < hi {
		mid := int(uint(lo+hi) >> 1)
		if arr[mid] < target {
			lo = mid + 1
		} else {
			hi = mid
		}
	}
	return lo
}

// UpperBound returns the first index i with arr[i] > target (len(arr) when none).
func UpperBound[T cmp.Ordered](arr []T, target T) int {
	lo, hi := 0, len(arr)
	for lo < hi {
		mid := int(uint(lo+hi) >> 1)
		if arr[mid] <= target {
			lo = mid + 1
		} else {
			hi = mid
		}
	}
	return lo
}

// ExponentialSearch doubles a bound b while arr[b] < target, then binary-searches
// arr[⌊b/2⌋ … min(b, n−1)]. Returns an index or −1.
func ExponentialSearch[T cmp.Ordered](arr []T, target T) int {
	n := len(arr)
	if n == 0 {
		return -1
	}
	if arr[0] == target {
		return 0
	}
	bound := 1
	for bound < n && arr[bound] < target {
		bound *= 2
	}
	lo := bound / 2
	hi := min(bound, n-1)
	if idx := BinarySearch(arr[lo:hi+1], target); idx != -1 {
		return lo + idx
	}
	return -1
}

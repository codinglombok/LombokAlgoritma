// LombokAlgoritma — Fibonacci search (Ferguson's variant, SPEC §7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "cmp"

// FibonacciSearch returns an index of target in the ascending slice arr, or −1. O(log n).
func FibonacciSearch[T cmp.Ordered](arr []T, target T) int {
	n := len(arr)
	fibMm2, fibMm1, fibM := 0, 1, 1
	for fibM < n {
		fibMm2 = fibMm1
		fibMm1 = fibM
		fibM = fibMm1 + fibMm2
	}
	offset := -1
	for fibM > 1 {
		i := min(offset+fibMm2, n-1)
		switch {
		case arr[i] < target:
			fibM = fibMm1
			fibMm1 = fibMm2
			fibMm2 = fibM - fibMm1
			offset = i
		case arr[i] > target:
			fibM = fibMm2
			fibMm1 -= fibMm2
			fibMm2 = fibM - fibMm1
		default:
			return i
		}
	}
	if fibMm1 == 1 && offset+1 < n && arr[offset+1] == target {
		return offset + 1
	}
	return -1
}

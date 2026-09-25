// LombokAlgoritma — jump search (SPEC §7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"cmp"
	"math"
)

// JumpSearch jumps in blocks of max(1, ⌊√n⌋) and scans the block [prev, min(cur, n−1)]
// linearly. Returns the first matching index in that block, or −1. O(√n).
func JumpSearch[T cmp.Ordered](arr []T, target T) int {
	n := len(arr)
	step := max(1, int(math.Floor(math.Sqrt(float64(n)))))
	prev, cur := 0, step
	for cur < n && arr[cur] < target {
		prev = cur
		cur += step
	}
	for i := prev; i <= min(cur, n-1); i++ {
		if arr[i] == target {
			return i
		}
	}
	return -1
}

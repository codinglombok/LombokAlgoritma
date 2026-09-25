// LombokAlgoritma — interpolation search (SPEC §7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "math/bits"

// Signed is the set of signed integer types.
type Signed interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64
}

// InterpolationSearch searches an ascending integer slice; O(log log n) on uniform data.
// The probe pos = lo + ⌊(hi−lo)·(t−arr[lo]) / (arr[hi]−arr[lo])⌋ uses exact 128-bit integer
// arithmetic (v0.1.x used float64 and could mis-probe for large values).
func InterpolationSearch[T Signed](arr []T, target T) int {
	lo, hi := 0, len(arr)-1
	for lo <= hi && target >= arr[lo] && target <= arr[hi] {
		if lo == hi || arr[hi] == arr[lo] {
			if arr[lo] == target {
				return lo
			}
			return -1
		}
		rng := uint64(int64(arr[hi])) - uint64(int64(arr[lo]))
		off := uint64(int64(target)) - uint64(int64(arr[lo]))
		ph, pl := bits.Mul64(uint64(hi-lo), off)
		q, _ := bits.Div64(ph, pl, rng) // off ≤ rng ⇒ q ≤ hi−lo, no overflow
		pos := lo + int(q)
		switch {
		case arr[pos] == target:
			return pos
		case arr[pos] < target:
			lo = pos + 1
		default:
			hi = pos - 1
		}
	}
	return -1
}

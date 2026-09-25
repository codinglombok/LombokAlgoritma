// LombokAlgoritma — LSD radix sort for signed integers
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// RadixSortLSD returns a sorted copy of arr. Stable, O(n·8) byte passes. Negative values are
// supported by shifting every value by −min (SPEC §6), computed in unsigned 64-bit arithmetic
// so the full int64 range works.
func RadixSortLSD(arr []int64) []int64 {
	a := append(make([]int64, 0, len(arr)), arr...)
	if len(a) <= 1 {
		return a
	}
	lo, hi := a[0], a[0]
	for _, v := range a {
		lo = min(lo, v)
		hi = max(hi, v)
	}
	span := uint64(hi) - uint64(lo)
	keys := make([]uint64, len(a))
	for i, v := range a {
		keys[i] = uint64(v) - uint64(lo)
	}
	tmp := make([]uint64, len(a))
	for shift := uint(0); shift < 64 && span>>shift > 0; shift += 8 {
		var count [257]int
		for _, k := range keys {
			count[(k>>shift)&0xff+1]++
		}
		for i := 1; i < 257; i++ {
			count[i] += count[i-1]
		}
		for _, k := range keys {
			d := (k >> shift) & 0xff
			tmp[count[d]] = k
			count[d]++
		}
		keys, tmp = tmp, keys
	}
	for i, k := range keys {
		a[i] = int64(k + uint64(lo))
	}
	return a
}

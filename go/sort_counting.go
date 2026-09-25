// LombokAlgoritma — counting sort
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// CountingSort sorts non-negative integers 0 … max(arr) in O(n + k). A value < 0 yields an
// OUT_OF_RANGE error (inputs of length ≤ 1 are returned unchanged, as in the reference).
func CountingSort(arr []int) ([]int, error) {
	if len(arr) <= 1 {
		return append([]int{}, arr...), nil
	}
	k := arr[0]
	for _, v := range arr {
		k = max(k, v)
	}
	return CountingSortMax(arr, k)
}

// CountingSortMax sorts integers in [0, maxVal]; a value outside that range yields OUT_OF_RANGE.
func CountingSortMax(arr []int, maxVal int) ([]int, error) {
	if len(arr) <= 1 {
		return append([]int{}, arr...), nil
	}
	for _, v := range arr {
		if v < 0 || v > maxVal {
			return nil, newErr(CodeOutOfRange, "CountingSort: value %d outside [0, %d]", v, maxVal)
		}
	}
	count := make([]int, maxVal+1)
	for _, v := range arr {
		count[v]++
	}
	out := make([]int, 0, len(arr))
	for v, c := range count {
		for j := 0; j < c; j++ {
			out = append(out, v)
		}
	}
	return out, nil
}

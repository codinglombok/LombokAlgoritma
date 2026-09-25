// LombokAlgoritma — Knuth–Morris–Pratt search over code points (SPEC §11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// KMPSearch returns every (possibly overlapping) start index of pattern in text, as code-point
// offsets; an empty pattern yields []. O(n + m).
func KMPSearch(text, pattern string) []int {
	p := []rune(pattern)
	results := []int{}
	if len(p) == 0 {
		return results
	}
	m := len(p)
	f := make([]int, m)
	k := 0
	for i := 1; i < m; i++ {
		for k > 0 && p[k] != p[i] {
			k = f[k-1]
		}
		if p[k] == p[i] {
			k++
		}
		f[i] = k
	}
	k = 0
	i := 0
	for _, c := range text {
		for k > 0 && p[k] != c {
			k = f[k-1]
		}
		if p[k] == c {
			k++
		}
		if k == m {
			results = append(results, i-k+1)
			k = f[k-1]
		}
		i++
	}
	return results
}

// LombokAlgoritma — Go String Module
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// KMPSearch returns all starting indices of pattern in text. O(n+m).
func KMPSearch(text, pattern string) []int {
	if pattern == "" {
		return nil
	}
	m := len(pattern)
	f := make([]int, m)
	k := 0
	for i := 1; i < m; i++ {
		for k > 0 && pattern[k] != pattern[i] {
			k = f[k-1]
		}
		if pattern[k] == pattern[i] {
			k++
		}
		f[i] = k
	}
	var results []int
	k = 0
	for i := 0; i < len(text); i++ {
		for k > 0 && pattern[k] != text[i] {
			k = f[k-1]
		}
		if pattern[k] == text[i] {
			k++
		}
		if k == m {
			results = append(results, i-m+1)
			k = f[k-1]
		}
	}
	return results
}

// Levenshtein returns the edit distance between a and b.
func Levenshtein(a, b string) int {
	ra, rb := []rune(a), []rune(b)
	if len(ra) > len(rb) {
		ra, rb = rb, ra
	}
	prev := make([]int, len(ra)+1)
	for i := range prev {
		prev[i] = i
	}
	curr := make([]int, len(ra)+1)
	for j := 1; j <= len(rb); j++ {
		curr[0] = j
		for i := 1; i <= len(ra); i++ {
			cost := 1
			if ra[i-1] == rb[j-1] {
				cost = 0
			}
			curr[i] = minOf3(curr[i-1]+1, prev[i]+1, prev[i-1]+cost)
		}
		prev, curr = curr, prev
	}
	return prev[len(ra)]
}

func minOf3(a, b, c int) int {
	if a < b {
		if a < c {
			return a
		}
		return c
	}
	if b < c {
		return b
	}
	return c
}

// FNV1a32 returns FNV-1a 32-bit hash.
func FNV1a32(data []byte) uint32 {
	h := uint32(0x811c9dc5)
	for _, b := range data {
		h ^= uint32(b)
		h *= 0x01000193
	}
	return h
}

// FNV1a64 returns FNV-1a 64-bit hash.
func FNV1a64(data []byte) uint64 {
	h := uint64(0xcbf29ce484222325)
	for _, b := range data {
		h ^= uint64(b)
		h *= 0x00000100000001b3
	}
	return h
}

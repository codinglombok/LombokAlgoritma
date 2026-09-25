// LombokAlgoritma — Levenshtein and (unrestricted) Damerau–Levenshtein distance (SPEC §11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// Levenshtein returns the edit distance (insert/delete/substitute, cost 1) between a and b
// over code points. O(|a|·|b|) time, O(min(|a|,|b|)) space.
func Levenshtein(a, b string) int {
	if a == b {
		return 0
	}
	ra, rb := []rune(a), []rune(b)
	if len(ra) > len(rb) {
		ra, rb = rb, ra
	}
	if len(ra) == 0 {
		return len(rb)
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
			curr[i] = min(curr[i-1]+1, prev[i]+1, prev[i-1]+cost)
		}
		prev, curr = curr, prev
	}
	return prev[len(ra)]
}

// DamerauLevenshtein returns the unrestricted Damerau–Levenshtein distance (Lowrance–Wagner:
// adjacent transpositions, with edits allowed between the transposed symbols) over code points.
func DamerauLevenshtein(a, b string) int {
	ra, rb := []rune(a), []rune(b)
	m, n := len(ra), len(rb)
	if m == 0 {
		return n
	}
	if n == 0 {
		return m
	}
	d := make([][]int, m+2)
	for i := range d {
		d[i] = make([]int, n+2)
	}
	maxDist := m + n
	d[0][0] = maxDist
	for i := 0; i <= m; i++ {
		d[i+1][0] = maxDist
		d[i+1][1] = i
	}
	for j := 0; j <= n; j++ {
		d[0][j+1] = maxDist
		d[1][j+1] = j
	}
	da := map[rune]int{}
	for i := 1; i <= m; i++ {
		db := 0
		for j := 1; j <= n; j++ {
			i1, j1 := da[rb[j-1]], db
			cost := 1
			if ra[i-1] == rb[j-1] {
				cost = 0
				db = j
			}
			d[i+1][j+1] = min(
				d[i][j]+cost,
				d[i+1][j]+1,
				d[i][j+1]+1,
				d[i1][j1]+(i-i1-1)+1+(j-j1-1),
			)
		}
		da[ra[i-1]] = i
	}
	return d[m+1][n+1]
}

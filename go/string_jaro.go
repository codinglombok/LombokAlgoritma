// LombokAlgoritma — Jaro and Jaro–Winkler similarity (SPEC §11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// DefaultJaroWinklerPrefixScale is the standard Winkler prefix scale p.
const DefaultJaroWinklerPrefixScale = 0.1

// Jaro returns the Jaro similarity in [0, 1] over code points, evaluated exactly as
// ((m/|a| + m/|b|) + (m − t/2)/m) / 3.
func Jaro(a, b string) float64 {
	if a == b {
		return 1
	}
	ra, rb := []rune(a), []rune(b)
	matchDist := max(len(ra), len(rb))/2 - 1
	if matchDist < 0 {
		return 0
	}
	aMatched := make([]bool, len(ra))
	bMatched := make([]bool, len(rb))
	matches := 0
	for i := range ra {
		lo := max(0, i-matchDist)
		hi := min(i+matchDist+1, len(rb))
		for j := lo; j < hi; j++ {
			if bMatched[j] || ra[i] != rb[j] {
				continue
			}
			aMatched[i] = true
			bMatched[j] = true
			matches++
			break
		}
	}
	if matches == 0 {
		return 0
	}
	transpositions := 0
	k := 0
	for i := range ra {
		if !aMatched[i] {
			continue
		}
		for !bMatched[k] {
			k++
		}
		if ra[i] != rb[k] {
			transpositions++
		}
		k++
	}
	m := float64(matches)
	t := float64(transpositions)
	return (m/float64(len(ra)) + m/float64(len(rb)) + (m-t/2)/m) / 3
}

// JaroWinkler returns j + ((ℓ·p)·(1 − j)) with j = Jaro(a, b) and ℓ the common prefix length
// (≤ 4 code points); p is usually DefaultJaroWinklerPrefixScale.
func JaroWinkler(a, b string, p float64) float64 {
	j := Jaro(a, b)
	ra, rb := []rune(a), []rune(b)
	prefix := 0
	for i := 0; i < min(4, len(ra), len(rb)); i++ {
		if ra[i] != rb[i] {
			break
		}
		prefix++
	}
	// float64(…) forbids FMA contraction (SPEC §0.2)
	return j + float64(float64(prefix)*p*(1-j))
}

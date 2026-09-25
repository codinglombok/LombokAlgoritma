// LombokAlgoritma — ternary search over a unimodal function (SPEC §7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// TernarySearch returns the x in [lo, hi] that maximises (maximize = true) or minimises f, to
// within epsilon: while hi − lo > ε, m1 = lo + (hi−lo)/3, m2 = hi − (hi−lo)/3 and one third is
// discarded; the result is (lo + hi)/2.
func TernarySearch(lo, hi float64, f func(x float64) float64, maximize bool, epsilon float64) float64 {
	for hi-lo > epsilon {
		m1 := lo + (hi-lo)/3
		m2 := hi - (hi-lo)/3
		var moveLo bool
		if maximize {
			moveLo = f(m1) < f(m2)
		} else {
			moveLo = f(m1) > f(m2)
		}
		if moveLo {
			lo = m1
		} else {
			hi = m2
		}
	}
	return (lo + hi) / 2
}

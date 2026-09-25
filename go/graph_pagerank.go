// LombokAlgoritma — PageRank by power iteration (SPEC §9.13)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// PageRank runs a fixed number of power iterations from 1/n with dangling mass redistributed
// uniformly (evaluation order normative, SPEC §9.13). n = 0 → []; damping ∉ [0, 1] yields
// OUT_OF_RANGE.
func PageRank(g Graph, damping float64, iterations int) ([]float64, error) {
	if err := g.validate(); err != nil {
		return nil, err
	}
	n := g.Nodes
	if n == 0 {
		return []float64{}, nil
	}
	if !(damping >= 0 && damping <= 1) {
		return nil, newErr(CodeOutOfRange, "PageRank: damping must be in [0, 1]")
	}
	outs := make([][]int, n)
	for _, e := range g.Edges {
		outs[e.From] = append(outs[e.From], e.To)
	}
	fn := float64(n)
	rank := make([]float64, n)
	for i := range rank {
		rank[i] = 1 / fn
	}
	for it := 0; it < iterations; it++ {
		dangling := 0.0
		for u := 0; u < n; u++ {
			if len(outs[u]) == 0 {
				dangling += rank[u]
			}
		}
		base := (1-damping)/fn + float64(damping*dangling)/fn
		next := make([]float64, n)
		for i := range next {
			next[i] = base
		}
		for u := 0; u < n; u++ {
			if deg := len(outs[u]); deg > 0 {
				c := float64(damping*rank[u]) / float64(deg)
				for _, v := range outs[u] {
					next[v] += c
				}
			}
		}
		rank = next
	}
	return rank, nil
}

// LombokAlgoritma — Floyd–Warshall all-pairs shortest paths (SPEC §9.6)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "math"

// FloydWarshall returns all-pairs distances (+Inf when unreachable). Parallel edges keep the
// minimum weight; loop order k → i → j with a strict < update. O(V³).
func FloydWarshall(g Graph) ([][]float64, error) {
	if err := g.validate(); err != nil {
		return nil, err
	}
	n := g.Nodes
	dist := make([][]float64, n)
	for i := range dist {
		dist[i] = make([]float64, n)
		for j := range dist[i] {
			if i != j {
				dist[i][j] = inf
			}
		}
	}
	for _, e := range g.Edges {
		dist[e.From][e.To] = math.Min(dist[e.From][e.To], e.Weight)
	}
	for k := 0; k < n; k++ {
		dk := dist[k]
		for i := 0; i < n; i++ {
			di := dist[i]
			dik := di[k]
			if dik == inf {
				continue
			}
			for j := 0; j < n; j++ {
				if cand := dik + dk[j]; cand < di[j] {
					di[j] = cand
				}
			}
		}
	}
	return dist, nil
}

// LombokAlgoritma — Bellman–Ford shortest paths with negative weights (SPEC §9.5)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// BellmanFordResult holds the distances from the source (+Inf when unreachable) and whether a
// negative cycle is reachable from it (the distances are then not final).
type BellmanFordResult struct {
	Distances        []float64
	HasNegativeCycle bool
}

// BellmanFord relaxes every edge in edge-list order for up to V−1 rounds (stopping early after a
// round without change), then runs one detection round. O(V·E).
func BellmanFord(g Graph, source int) (BellmanFordResult, error) {
	if err := g.validate(); err != nil {
		return BellmanFordResult{}, err
	}
	if err := g.checkNode(source, "source"); err != nil {
		return BellmanFordResult{}, err
	}
	dist := make([]float64, g.Nodes)
	for i := range dist {
		dist[i] = inf
	}
	dist[source] = 0
	relax := func(apply bool) bool {
		changed := false
		for _, e := range g.Edges {
			du := dist[e.From]
			if du != inf && du+e.Weight < dist[e.To] {
				if !apply {
					return true
				}
				dist[e.To] = du + e.Weight
				changed = true
			}
		}
		return changed
	}
	for round := 1; round < g.Nodes; round++ {
		if !relax(true) {
			break
		}
	}
	return BellmanFordResult{Distances: dist, HasNegativeCycle: relax(false)}, nil
}

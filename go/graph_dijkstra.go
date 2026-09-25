// LombokAlgoritma — Dijkstra single-source shortest paths (SPEC §9.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// Dijkstra returns the shortest distance from source to every node (+Inf when unreachable).
// Binary heap keyed by [distance, node]; stale entries are skipped. Any negative weight yields
// NEGATIVE_WEIGHT. O((V + E) log V).
func Dijkstra(g Graph, source int) ([]float64, error) {
	adj, err := g.adjacencyFrom(namedNode{"source", source})
	if err != nil {
		return nil, err
	}
	if g.hasNegativeWeight() {
		return nil, newErr(CodeNegativeWeight, "Dijkstra: negative edge weight")
	}
	dist := make([]float64, g.Nodes)
	for i := range dist {
		dist[i] = inf
	}
	dist[source] = 0
	heap := newMinHeap(func(a, b [2]float64) bool { return tupleLess(a[:], b[:]) })
	heap.push([2]float64{0, float64(source)})
	for top, ok := heap.pop(); ok; top, ok = heap.pop() {
		d, u := top[0], int(top[1])
		if d > dist[u] {
			continue
		}
		for _, a := range adj[u] {
			if nd := d + a.weight; nd < dist[a.to] {
				dist[a.to] = nd
				heap.push([2]float64{nd, float64(a.to)})
			}
		}
	}
	return dist, nil
}

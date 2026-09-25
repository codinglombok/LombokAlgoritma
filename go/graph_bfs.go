// LombokAlgoritma — breadth-first search (SPEC §9.1)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// BFS returns the hop distance from source to every node (−1 when unreachable); FIFO queue,
// neighbours in edge-list order. O(V + E).
func BFS(g Graph, source int) ([]int, error) {
	adj, err := g.adjacencyFrom(namedNode{"source", source})
	if err != nil {
		return nil, err
	}
	dist := make([]int, g.Nodes)
	for i := range dist {
		dist[i] = -1
	}
	dist[source] = 0
	queue := []int{source}
	for head := 0; head < len(queue); head++ {
		u := queue[head]
		for _, a := range adj[u] {
			if dist[a.to] == -1 {
				dist[a.to] = dist[u] + 1
				queue = append(queue, a.to)
			}
		}
	}
	return dist, nil
}

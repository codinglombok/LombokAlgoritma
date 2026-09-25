// LombokAlgoritma — topological sort, Kahn's algorithm (SPEC §9.7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// TopologicalSort returns a topological order: FIFO queue seeded with the in-degree-0 nodes in
// ascending order, neighbours released in edge-list order; [] when the graph has a cycle.
func TopologicalSort(g Graph) ([]int, error) {
	adj, err := g.adjacency()
	if err != nil {
		return nil, err
	}
	indegree := make([]int, g.Nodes)
	for _, e := range g.Edges {
		indegree[e.To]++
	}
	queue := []int{}
	for i, d := range indegree {
		if d == 0 {
			queue = append(queue, i)
		}
	}
	for head := 0; head < len(queue); head++ {
		for _, a := range adj[queue[head]] {
			indegree[a.to]--
			if indegree[a.to] == 0 {
				queue = append(queue, a.to)
			}
		}
	}
	if len(queue) != g.Nodes {
		return []int{}, nil
	}
	return queue, nil
}

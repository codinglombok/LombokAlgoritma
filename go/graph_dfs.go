// LombokAlgoritma — depth-first search, iterative pre-order (SPEC §9.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// DFS returns the pre-order of an iterative DFS from source: pop u, skip it if visited, else
// emit it and push its unvisited neighbours in reverse edge-list order. O(V + E).
func DFS(g Graph, source int) ([]int, error) {
	adj, err := g.adjacencyFrom(namedNode{"source", source})
	if err != nil {
		return nil, err
	}
	visited := make([]bool, g.Nodes)
	order := []int{}
	stack := []int{source}
	for len(stack) > 0 {
		u := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		if visited[u] {
			continue
		}
		visited[u] = true
		order = append(order, u)
		out := adj[u]
		for i := len(out) - 1; i >= 0; i-- {
			if !visited[out[i].to] {
				stack = append(stack, out[i].to)
			}
		}
	}
	return order, nil
}

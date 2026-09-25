// LombokAlgoritma — A* search (SPEC §9.4)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// AStarResult is the path source … target and its cost ({[], +Inf} when unreachable).
type AStarResult struct {
	Path []int
	Cost float64
}

// AStar finds a shortest path from source to target with an admissible heuristic (nil ⇒ 0,
// i.e. Dijkstra). The frontier is keyed by [g + h, node]; an entry is stale when
// f > g[u] + h(u); a predecessor changes only on a strict improvement. Any negative weight
// yields NEGATIVE_WEIGHT.
func AStar(g Graph, source, target int, heuristic func(node int) float64) (AStarResult, error) {
	adj, err := g.adjacencyFrom(namedNode{"source", source}, namedNode{"target", target})
	if err != nil {
		return AStarResult{}, err
	}
	if g.hasNegativeWeight() {
		return AStarResult{}, newErr(CodeNegativeWeight, "AStar: negative edge weight")
	}
	h := heuristic
	if h == nil {
		h = func(int) float64 { return 0 }
	}
	gScore := make([]float64, g.Nodes)
	prev := make([]int, g.Nodes)
	for i := range gScore {
		gScore[i] = inf
		prev[i] = -1
	}
	gScore[source] = 0
	heap := newMinHeap(func(a, b [2]float64) bool { return tupleLess(a[:], b[:]) })
	heap.push([2]float64{h(source), float64(source)})
	for top, ok := heap.pop(); ok; top, ok = heap.pop() {
		f, u := top[0], int(top[1])
		gu := gScore[u]
		if f > gu+h(u) {
			continue
		}
		if u == target {
			path := []int{target}
			for cur := prev[target]; cur != -1; cur = prev[cur] {
				path = append(path, cur)
			}
			for i, j := 0, len(path)-1; i < j; i, j = i+1, j-1 {
				path[i], path[j] = path[j], path[i]
			}
			return AStarResult{Path: path, Cost: gu}, nil
		}
		for _, a := range adj[u] {
			if ng := gu + a.weight; ng < gScore[a.to] {
				gScore[a.to] = ng
				prev[a.to] = u
				heap.push([2]float64{ng + h(a.to), float64(a.to)})
			}
		}
	}
	return AStarResult{Path: []int{}, Cost: inf}, nil
}

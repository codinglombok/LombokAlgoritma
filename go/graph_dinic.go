// LombokAlgoritma — maximum flow, Dinic (SPEC §9.11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "math"

// Dinic returns the value of a maximum source → sink flow; edge weights are capacities
// (parallel edges add up). source = sink yields INVALID_INPUT (after the node checks), a
// negative capacity NEGATIVE_WEIGHT. Only the flow value is normative; it is exact for integer
// capacities below 2^53. O(V²·E).
func Dinic(g Graph, source, sink int) (float64, error) {
	if err := g.validate(); err != nil {
		return 0, err
	}
	if err := g.checkNode(source, "source"); err != nil {
		return 0, err
	}
	if err := g.checkNode(sink, "sink"); err != nil {
		return 0, err
	}
	if source == sink {
		return 0, newErr(CodeInvalidInput, "Dinic: source and sink must differ")
	}
	n := g.Nodes
	// residual graph; edge id and id^1 are a forward/backward pair
	to := make([]int, 0, 2*len(g.Edges))
	capacity := make([]float64, 0, 2*len(g.Edges))
	head := make([][]int, n)
	for _, e := range g.Edges {
		if e.Weight < 0 {
			return 0, newErr(CodeNegativeWeight, "Dinic: negative capacity")
		}
		head[e.From] = append(head[e.From], len(to))
		to = append(to, e.To)
		capacity = append(capacity, e.Weight)
		head[e.To] = append(head[e.To], len(to))
		to = append(to, e.From)
		capacity = append(capacity, 0)
	}
	level := make([]int, n)
	it := make([]int, n)
	bfs := func() bool {
		for i := range level {
			level[i] = -1
		}
		level[source] = 0
		q := []int{source}
		for h := 0; h < len(q); h++ {
			u := q[h]
			for _, id := range head[u] {
				if v := to[id]; capacity[id] > 0 && level[v] == -1 {
					level[v] = level[u] + 1
					q = append(q, v)
				}
			}
		}
		return level[sink] != -1
	}
	augment := func() float64 {
		var path []int
		u := source
		for {
			if u == sink {
				f := math.Inf(1)
				for _, id := range path {
					f = math.Min(f, capacity[id])
				}
				for _, id := range path {
					capacity[id] -= f
					capacity[id^1] += f
				}
				return f
			}
			advanced := false
			for it[u] < len(head[u]) {
				id := head[u][it[u]]
				if v := to[id]; capacity[id] > 0 && level[v] == level[u]+1 {
					path = append(path, id)
					u = v
					advanced = true
					break
				}
				it[u]++
			}
			if advanced {
				continue
			}
			if u == source {
				return 0
			}
			level[u] = -1 // dead end: prune
			back := path[len(path)-1]
			path = path[:len(path)-1]
			u = to[back^1]
			it[u]++
		}
	}
	flow := 0.0
	for bfs() {
		for i := range it {
			it[i] = 0
		}
		for f := augment(); f > 0; f = augment() {
			flow += f
		}
	}
	return flow, nil
}

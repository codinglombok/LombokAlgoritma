// LombokAlgoritma — lazy Prim minimum spanning forest (SPEC §9.9)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// Prim returns a minimum spanning forest of g read as undirected. Trees grow from the
// lowest-numbered unvisited node; the frontier heap is keyed by [weight, to, from, edgeIndex]
// (a loop is recorded once). Each edge is returned oriented tree → new node, in the order taken.
func Prim(g Graph) ([]Edge, error) {
	if err := g.validate(); err != nil {
		return nil, err
	}
	n := g.Nodes
	type incident struct {
		to     int
		weight float64
		index  int
	}
	adj := make([][]incident, n)
	for i, e := range g.Edges {
		adj[e.From] = append(adj[e.From], incident{e.To, e.Weight, i})
		if e.From != e.To {
			adj[e.To] = append(adj[e.To], incident{e.From, e.Weight, i})
		}
	}
	inTree := make([]bool, n)
	out := []Edge{}
	heap := newMinHeap(func(a, b [4]float64) bool { return tupleLess(a[:], b[:]) })
	visit := func(u int) {
		inTree[u] = true
		for _, x := range adj[u] {
			if !inTree[x.to] {
				heap.push([4]float64{x.weight, float64(x.to), float64(u), float64(x.index)})
			}
		}
	}
	for root := 0; root < n; root++ {
		if inTree[root] {
			continue
		}
		visit(root)
		for top, ok := heap.pop(); ok; top, ok = heap.pop() {
			to := int(top[1])
			if inTree[to] {
				continue
			}
			out = append(out, Edge{From: int(top[2]), To: to, Weight: top[0]})
			visit(to)
		}
	}
	return out, nil
}

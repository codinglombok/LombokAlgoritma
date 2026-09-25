// LombokAlgoritma — graph tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"math"
	"testing"
)

var diamond = Graph{Nodes: 4, Edges: []Edge{{0, 1, 1}, {1, 2, 2}, {0, 2, 5}, {2, 3, 1}}}

func TestGraphValidation(t *testing.T) {
	bad := Graph{Nodes: -1}
	out := Graph{Nodes: 2, Edges: []Edge{{0, 2, 1}}}
	neg := Graph{Nodes: 2, Edges: []Edge{{0, 1, -1}}}
	type call func(Graph) error
	calls := map[string]call{
		"bfs":      func(g Graph) error { _, err := BFS(g, 0); return err },
		"dfs":      func(g Graph) error { _, err := DFS(g, 0); return err },
		"dijkstra": func(g Graph) error { _, err := Dijkstra(g, 0); return err },
		"astar":    func(g Graph) error { _, err := AStar(g, 0, 1, nil); return err },
		"bellman":  func(g Graph) error { _, err := BellmanFord(g, 0); return err },
		"floyd":    func(g Graph) error { _, err := FloydWarshall(g); return err },
		"topo":     func(g Graph) error { _, err := TopologicalSort(g); return err },
		"kruskal":  func(g Graph) error { _, err := Kruskal(g); return err },
		"prim":     func(g Graph) error { _, err := Prim(g); return err },
		"tarjan":   func(g Graph) error { _, err := TarjanSCC(g); return err },
		"dinic":    func(g Graph) error { _, err := Dinic(g, 0, 1); return err },
		"pagerank": func(g Graph) error { _, err := PageRank(g, 0.85, 3); return err },
	}
	for name, c := range calls {
		t.Run(name, func(t *testing.T) {
			assertCode(t, c(bad), CodeInvalidInput)
			assertCode(t, c(out), CodeOutOfRange)
		})
	}
	for _, name := range []string{"dijkstra", "astar", "dinic"} {
		assertCode(t, calls[name](neg), CodeNegativeWeight)
	}
	for name, f := range map[string]func() error{
		"bfs":      func() error { _, err := BFS(diamond, 4); return err },
		"dfs":      func() error { _, err := DFS(diamond, -1); return err },
		"dijkstra": func() error { _, err := Dijkstra(diamond, 9); return err },
		"astar":    func() error { _, err := AStar(diamond, 0, 9, nil); return err },
		"bellman":  func() error { _, err := BellmanFord(diamond, 9); return err },
		"dinic-s":  func() error { _, err := Dinic(diamond, 9, 1); return err },
		"dinic-t":  func() error { _, err := Dinic(diamond, 0, 9); return err },
	} {
		t.Run("node-"+name, func(t *testing.T) { assertCode(t, f(), CodeOutOfRange) })
	}
	_, err := Dinic(diamond, 1, 1)
	assertCode(t, err, CodeInvalidInput)
	_, err = PageRank(diamond, 1.5, 3)
	assertCode(t, err, CodeOutOfRange)
}

func TestGraphAlgorithms(t *testing.T) {
	assertEqual(t, must(BFS(diamond, 0)), []int{0, 1, 1, 2})
	assertEqual(t, must(DFS(diamond, 0)), []int{0, 1, 2, 3})
	assertEqual(t, must(Dijkstra(diamond, 0)), []float64{0, 1, 3, 4})
	r := must(AStar(diamond, 0, 3, func(v int) float64 { return []float64{3, 2, 1, 0}[v] }))
	assertEqual(t, r, AStarResult{Path: []int{0, 1, 2, 3}, Cost: 4})
	r = must(AStar(diamond, 3, 0, nil))
	assertEqual(t, r.Path, []int{})
	if !math.IsInf(r.Cost, 1) {
		t.Error("unreachable cost")
	}
	bf := must(BellmanFord(Graph{Nodes: 3, Edges: []Edge{{0, 1, 1}, {1, 2, -3}, {2, 1, 1}}}, 0))
	if !bf.HasNegativeCycle {
		t.Error("negative cycle")
	}
	assertEqual(t, must(FloydWarshall(diamond))[0], []float64{0, 1, 3, 4})
	assertEqual(t, must(TopologicalSort(diamond)), []int{0, 1, 2, 3})
	assertEqual(t, must(TopologicalSort(Graph{Nodes: 2, Edges: []Edge{{0, 1, 1}, {1, 0, 1}}})), []int{})
	assertEqual(t, must(Kruskal(diamond)), []Edge{{0, 1, 1}, {2, 3, 1}, {1, 2, 2}})
	assertEqual(t, must(Prim(diamond)), []Edge{{0, 1, 1}, {1, 2, 2}, {2, 3, 1}})
	assertEqual(t, must(TarjanSCC(Graph{Nodes: 3, Edges: []Edge{{0, 1, 1}, {1, 0, 1}, {1, 2, 1}}})), [][]int{{2}, {0, 1}})
	assertEqual(t, must(Dinic(diamond, 0, 3)), 1.0)
	assertEqual(t, must(PageRank(Graph{}, 0.85, 3)), []float64{})
	pr := must(PageRank(diamond, 0.85, 30))
	sum := 0.0
	for _, v := range pr {
		sum += v
	}
	if math.Abs(sum-1) > 1e-12 {
		t.Errorf("ranks sum to %v", sum)
	}
}

func TestBipartiteMatching(t *testing.T) {
	m := must(BipartiteMatching(3, 3, [][2]int{{0, 0}, {0, 1}, {1, 0}, {2, 2}}))
	assertEqual(t, m.Size, 3)
	for u, v := range m.MatchLeft {
		if m.MatchRight[v] != u {
			t.Error("inconsistent matching")
		}
	}
	assertEqual(t, must(BipartiteMatching(4, 1, [][2]int{{0, 0}, {1, 0}, {2, 0}, {3, 0}})).Size, 1)
	_, err := BipartiteMatching(1, 1, [][2]int{{0, 1}})
	assertCode(t, err, CodeOutOfRange)
	_, err = BipartiteMatching(-1, 1, nil)
	assertCode(t, err, CodeInvalidInput)
}

func TestMinHeap(t *testing.T) {
	h := newMinHeap(func(a, b int) bool { return a < b })
	if _, ok := h.pop(); ok {
		t.Error("empty pop")
	}
	for _, v := range []int{5, 1, 4, 1, 3} {
		h.push(v)
	}
	var got []int
	for v, ok := h.pop(); ok; v, ok = h.pop() {
		got = append(got, v)
	}
	assertEqual(t, got, []int{1, 1, 3, 4, 5})
	if tupleLess([]float64{1, 2}, []float64{1, 2}) || !tupleLess([]float64{1, 2}, []float64{1, 3}) {
		t.Error("tupleLess")
	}
}

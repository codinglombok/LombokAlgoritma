// LombokAlgoritma — graph model shared by the graph algorithms (SPEC §9.0)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "math"

// Edge is a directed edge From → To with a numeric Weight.
type Edge struct {
	From, To int
	Weight   float64
}

// Graph is a directed multigraph on the nodes 0 … Nodes−1 (parallel edges and loops allowed).
// Kruskal, Prim and bipartite matching read the edges as undirected. Edge order is significant:
// every traversal is defined in terms of it (SPEC §9.0).
type Graph struct {
	Nodes int
	Edges []Edge
}

type arc struct {
	to     int
	weight float64
}

var inf = math.Inf(1)

// validate checks the node count (INVALID_INPUT) and the edge endpoints (OUT_OF_RANGE).
func (g Graph) validate() error {
	if g.Nodes < 0 {
		return newErr(CodeInvalidInput, "graph: nodes must be non-negative")
	}
	for _, e := range g.Edges {
		if e.From < 0 || e.To < 0 || e.From >= g.Nodes || e.To >= g.Nodes {
			return newErr(CodeOutOfRange, "graph: edge %d→%d outside [0, %d)", e.From, e.To, g.Nodes)
		}
	}
	return nil
}

// checkNode returns OUT_OF_RANGE unless v is a node of g.
func (g Graph) checkNode(v int, name string) error {
	if v < 0 || v >= g.Nodes {
		return newErr(CodeOutOfRange, "graph: %s %d outside [0, %d)", name, v, g.Nodes)
	}
	return nil
}

// adjacency validates g and returns the outgoing arcs of every node in edge-list order.
func (g Graph) adjacency() ([][]arc, error) {
	if err := g.validate(); err != nil {
		return nil, err
	}
	adj := make([][]arc, g.Nodes)
	for _, e := range g.Edges {
		adj[e.From] = append(adj[e.From], arc{e.To, e.Weight})
	}
	return adj, nil
}

// adjacencyFrom is adjacency followed by checks of the given endpoint nodes.
func (g Graph) adjacencyFrom(nodes ...namedNode) ([][]arc, error) {
	adj, err := g.adjacency()
	if err != nil {
		return nil, err
	}
	for _, n := range nodes {
		if err := g.checkNode(n.v, n.name); err != nil {
			return nil, err
		}
	}
	return adj, nil
}

type namedNode struct {
	name string
	v    int
}

func (g Graph) hasNegativeWeight() bool {
	for _, e := range g.Edges {
		if e.Weight < 0 {
			return true
		}
	}
	return false
}

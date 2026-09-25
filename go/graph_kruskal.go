// LombokAlgoritma — Kruskal minimum spanning forest (SPEC §9.8)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "sort"

// Kruskal returns a minimum spanning forest of g read as undirected: edges in a stable
// ascending order of weight (ties keep edge-list order), taken when they join two components.
// The chosen edges are returned in the order taken, with their original orientation.
func Kruskal(g Graph) ([]Edge, error) {
	if err := g.validate(); err != nil {
		return nil, err
	}
	order := append([]Edge(nil), g.Edges...)
	sort.SliceStable(order, func(i, j int) bool { return order[i].Weight < order[j].Weight })
	ds := NewDisjointSet(g.Nodes)
	mst := []Edge{}
	for _, e := range order {
		if ds.Union(e.From, e.To) {
			mst = append(mst, e)
		}
	}
	return mst, nil
}

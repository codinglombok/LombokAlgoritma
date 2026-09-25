// LombokAlgoritma — strongly connected components, Tarjan (SPEC §9.10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "slices"

// TarjanSCC returns the strongly connected components in the order Tarjan completes them (a
// reverse topological order of the condensation); each component is sorted ascending. Iterative,
// but it visits exactly like the recursive version: roots ascending, neighbours in edge order.
func TarjanSCC(g Graph) ([][]int, error) {
	adj, err := g.adjacency()
	if err != nil {
		return nil, err
	}
	n := g.Nodes
	index := make([]int, n)
	low := make([]int, n)
	onStack := make([]bool, n)
	for i := range index {
		index[i] = -1
	}
	var stack []int
	out := [][]int{}
	counter := 0
	type frame struct{ v, pos int }
	for root := 0; root < n; root++ {
		if index[root] != -1 {
			continue
		}
		index[root], low[root] = counter, counter
		counter++
		stack = append(stack, root)
		onStack[root] = true
		call := []frame{{root, 0}}
		for len(call) > 0 {
			top := &call[len(call)-1]
			v := top.v
			if top.pos < len(adj[v]) {
				w := adj[v][top.pos].to
				top.pos++
				if index[w] == -1 {
					index[w], low[w] = counter, counter
					counter++
					stack = append(stack, w)
					onStack[w] = true
					call = append(call, frame{w, 0})
				} else if onStack[w] {
					low[v] = min(low[v], index[w])
				}
				continue
			}
			call = call[:len(call)-1]
			if len(call) > 0 {
				p := call[len(call)-1].v
				low[p] = min(low[p], low[v])
			}
			if low[v] == index[v] {
				comp := []int{}
				for {
					w := stack[len(stack)-1]
					stack = stack[:len(stack)-1]
					onStack[w] = false
					comp = append(comp, w)
					if w == v {
						break
					}
				}
				slices.Sort(comp)
				out = append(out, comp)
			}
		}
	}
	return out, nil
}

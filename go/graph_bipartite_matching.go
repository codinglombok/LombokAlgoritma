// LombokAlgoritma — maximum bipartite matching, Hopcroft–Karp (SPEC §9.12)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "math"

// MatchingResult is a maximum matching: Size is normative, the chosen pairs are not.
// MatchLeft[u] is the right vertex matched to u (or −1); MatchRight[v] likewise.
type MatchingResult struct {
	Size       int
	MatchLeft  []int
	MatchRight []int
}

// BipartiteMatching returns a maximum matching of the bipartite graph with left vertices
// 0 … nLeft−1, right vertices 0 … nRight−1 and edges pairs[i] = {left, right}. Negative vertex
// counts yield INVALID_INPUT, a pair outside the ranges OUT_OF_RANGE. O(E·√V).
func BipartiteMatching(nLeft, nRight int, pairs [][2]int) (MatchingResult, error) {
	if nLeft < 0 || nRight < 0 {
		return MatchingResult{}, newErr(CodeInvalidInput, "BipartiteMatching: negative vertex count")
	}
	adj := make([][]int, nLeft)
	for _, p := range pairs {
		u, v := p[0], p[1]
		if u < 0 || u >= nLeft || v < 0 || v >= nRight {
			return MatchingResult{}, newErr(CodeOutOfRange, "BipartiteMatching: edge [%d, %d] out of range", u, v)
		}
		adj[u] = append(adj[u], v)
	}
	matchLeft := make([]int, nLeft)
	matchRight := make([]int, nRight)
	for i := range matchLeft {
		matchLeft[i] = -1
	}
	for i := range matchRight {
		matchRight[i] = -1
	}
	const unreached = math.MaxInt
	dist := make([]int, nLeft)
	bfs := func() bool {
		var q []int
		for u := 0; u < nLeft; u++ {
			if matchLeft[u] == -1 {
				dist[u] = 0
				q = append(q, u)
			} else {
				dist[u] = unreached
			}
		}
		found := false
		for h := 0; h < len(q); h++ {
			u := q[h]
			for _, v := range adj[u] {
				w := matchRight[v]
				if w == -1 {
					found = true
				} else if dist[w] == unreached {
					dist[w] = dist[u] + 1
					q = append(q, w)
				}
			}
		}
		return found
	}
	it := make([]int, nLeft)
	tryAugment := func(root int) bool {
		stack := []int{root}
		var via []int
		for len(stack) > 0 {
			u := stack[len(stack)-1]
			pushed := false
			for it[u] < len(adj[u]) {
				v := adj[u][it[u]]
				it[u]++
				w := matchRight[v]
				if w == -1 {
					via = append(via, v)
					for k := len(stack) - 1; k >= 0; k-- {
						matchLeft[stack[k]] = via[k]
						matchRight[via[k]] = stack[k]
					}
					return true
				}
				if dist[w] == dist[u]+1 {
					via = append(via, v)
					stack = append(stack, w)
					pushed = true
					break
				}
			}
			if pushed {
				continue
			}
			dist[u] = unreached
			stack = stack[:len(stack)-1]
			if len(via) > 0 {
				via = via[:len(via)-1]
			}
		}
		return false
	}
	size := 0
	for bfs() {
		for i := range it {
			it[i] = 0
		}
		for u := 0; u < nLeft; u++ {
			if matchLeft[u] == -1 && tryAugment(u) {
				size++
			}
		}
	}
	return MatchingResult{Size: size, MatchLeft: matchLeft, MatchRight: matchRight}, nil
}

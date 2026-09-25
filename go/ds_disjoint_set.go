// LombokAlgoritma — disjoint set (union-find) with union by rank + full path compression (SPEC §8.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// DisjointSet partitions the elements 0 … n−1. Indices outside that range panic (like slices).
type DisjointSet struct {
	parent []int
	rank   []uint8
	count  int
}

// NewDisjointSet returns n singleton sets (n < 0 is treated as 0).
func NewDisjointSet(n int) *DisjointSet {
	n = max(n, 0)
	ds := &DisjointSet{parent: make([]int, n), rank: make([]uint8, n), count: n}
	for i := range ds.parent {
		ds.parent[i] = i
	}
	return ds
}

// Find returns the root of x's set, compressing the whole path (iteratively).
func (ds *DisjointSet) Find(x int) int {
	root := x
	for ds.parent[root] != root {
		root = ds.parent[root]
	}
	for ds.parent[x] != root {
		ds.parent[x], x = root, ds.parent[x]
	}
	return root
}

// Union merges the sets of x and y; it returns false when they were already joined.
func (ds *DisjointSet) Union(x, y int) bool {
	rx, ry := ds.Find(x), ds.Find(y)
	if rx == ry {
		return false
	}
	switch {
	case ds.rank[rx] < ds.rank[ry]:
		ds.parent[rx] = ry
	case ds.rank[rx] > ds.rank[ry]:
		ds.parent[ry] = rx
	default:
		ds.parent[ry] = rx
		ds.rank[rx]++
	}
	ds.count--
	return true
}

// Connected reports whether x and y are in the same set.
func (ds *DisjointSet) Connected(x, y int) bool { return ds.Find(x) == ds.Find(y) }

// Count returns the number of disjoint sets.
func (ds *DisjointSet) Count() int { return ds.count }

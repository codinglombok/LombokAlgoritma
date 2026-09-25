// LombokAlgoritma — segment tree with lazy propagation (range add / range sum), SPEC §8.5
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// SegmentTree supports adding a value to a range and querying range sums (0-based, inclusive).
type SegmentTree struct {
	tree []int64
	lazy []int64
	n    int
}

// NewSegmentTree builds a tree over values in O(n).
func NewSegmentTree(values []int64) *SegmentTree {
	n := len(values)
	st := &SegmentTree{tree: make([]int64, 4*n), lazy: make([]int64, 4*n), n: n}
	if n > 0 {
		st.build(values, 1, 0, n-1)
	}
	return st
}

func (st *SegmentTree) build(values []int64, node, lo, hi int) {
	if lo == hi {
		st.tree[node] = values[lo]
		return
	}
	mid := (lo + hi) >> 1
	st.build(values, 2*node, lo, mid)
	st.build(values, 2*node+1, mid+1, hi)
	st.tree[node] = st.tree[2*node] + st.tree[2*node+1]
}

func (st *SegmentTree) apply(node, lo, hi int, val int64) {
	st.tree[node] += val * int64(hi-lo+1)
	st.lazy[node] += val
}

func (st *SegmentTree) push(node, lo, hi int) {
	if p := st.lazy[node]; p != 0 {
		mid := (lo + hi) >> 1
		st.apply(2*node, lo, mid, p)
		st.apply(2*node+1, mid+1, hi, p)
		st.lazy[node] = 0
	}
}

// Query returns the sum of a[l..r] (the part of [l, r] inside [0, n) — empty ⇒ 0).
func (st *SegmentTree) Query(l, r int) int64 {
	if st.n == 0 {
		return 0
	}
	return st.query(l, r, 1, 0, st.n-1)
}

func (st *SegmentTree) query(l, r, node, lo, hi int) int64 {
	if r < lo || hi < l {
		return 0
	}
	if l <= lo && hi <= r {
		return st.tree[node]
	}
	st.push(node, lo, hi)
	mid := (lo + hi) >> 1
	return st.query(l, r, 2*node, lo, mid) + st.query(l, r, 2*node+1, mid+1, hi)
}

// Update adds val to every element of a[l..r].
func (st *SegmentTree) Update(l, r int, val int64) {
	if st.n > 0 {
		st.update(l, r, val, 1, 0, st.n-1)
	}
}

func (st *SegmentTree) update(l, r int, val int64, node, lo, hi int) {
	if r < lo || hi < l {
		return
	}
	if l <= lo && hi <= r {
		st.apply(node, lo, hi, val)
		return
	}
	st.push(node, lo, hi)
	mid := (lo + hi) >> 1
	st.update(l, r, val, 2*node, lo, mid)
	st.update(l, r, val, 2*node+1, mid+1, hi)
	st.tree[node] = st.tree[2*node] + st.tree[2*node+1]
}

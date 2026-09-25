// LombokAlgoritma — Fenwick tree (binary indexed tree), SPEC §8.4
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// FenwickTree maintains prefix sums over 1-based positions 1 … n.
type FenwickTree struct {
	tree []int64
}

// NewFenwickTree returns a tree initialised from values by Update(i+1, values[i]) in order.
func NewFenwickTree(values []int64) *FenwickTree {
	ft := &FenwickTree{tree: make([]int64, len(values)+1)}
	for i, v := range values {
		ft.Update(i+1, v)
	}
	return ft
}

// Len returns n.
func (ft *FenwickTree) Len() int { return len(ft.tree) - 1 }

// Update adds val at 1-based position i (positions < 1 or > n are ignored).
func (ft *FenwickTree) Update(i int, val int64) {
	if i < 1 {
		return
	}
	for ; i <= ft.Len(); i += i & -i {
		ft.tree[i] += val
	}
}

// PrefixSum returns the sum of positions 1 … i (0 for i ≤ 0; i > n is clamped to n).
func (ft *FenwickTree) PrefixSum(i int) int64 {
	var s int64
	for i = min(i, ft.Len()); i > 0; i -= i & -i {
		s += ft.tree[i]
	}
	return s
}

// RangeSum returns the sum of positions l … r = PrefixSum(r) − PrefixSum(l−1).
func (ft *FenwickTree) RangeSum(l, r int) int64 { return ft.PrefixSum(r) - ft.PrefixSum(l-1) }

// PointQuery returns the value at position i.
func (ft *FenwickTree) PointQuery(i int) int64 { return ft.RangeSum(i, i) }

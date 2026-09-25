// LombokAlgoritma — lazy segment tree, range add / range sum (SPEC §8.5)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use alloc::vec;
use alloc::vec::Vec;

/// Segment tree over `i64` with lazy propagation: `update(l, r, v)` adds `v` to `a[l..=r]`,
/// `query(l, r)` returns `Σ a[l..=r]` (0-based, inclusive). Indices outside `[0, n)` are
/// clipped (an empty intersection gives 0 / no-op). Arithmetic wraps on overflow.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SegmentTree {
    tree: Vec<i64>,
    lazy: Vec<i64>,
    n: usize,
}

impl SegmentTree {
    /// Tree over a copy of `values`.
    pub fn new(values: &[i64]) -> Self {
        let n = values.len();
        let mut t = SegmentTree {
            tree: vec![0; 4 * n.max(1)],
            lazy: vec![0; 4 * n.max(1)],
            n,
        };
        if n > 0 {
            t.build(values, 1, 0, n - 1);
        }
        t
    }

    /// Number of elements.
    pub fn len(&self) -> usize {
        self.n
    }

    /// `true` when there are no elements.
    pub fn is_empty(&self) -> bool {
        self.n == 0
    }

    fn build(&mut self, a: &[i64], node: usize, lo: usize, hi: usize) {
        if lo == hi {
            self.tree[node] = a[lo];
            return;
        }
        let mid = (lo + hi) / 2;
        self.build(a, 2 * node, lo, mid);
        self.build(a, 2 * node + 1, mid + 1, hi);
        self.tree[node] = self.tree[2 * node].wrapping_add(self.tree[2 * node + 1]);
    }

    fn apply(&mut self, node: usize, lo: usize, hi: usize, val: i64) {
        let width = (hi - lo + 1) as i64;
        self.tree[node] = self.tree[node].wrapping_add(val.wrapping_mul(width));
        self.lazy[node] = self.lazy[node].wrapping_add(val);
    }

    fn push(&mut self, node: usize, lo: usize, hi: usize) {
        let pending = self.lazy[node];
        if pending != 0 {
            let mid = (lo + hi) / 2;
            self.apply(2 * node, lo, mid, pending);
            self.apply(2 * node + 1, mid + 1, hi, pending);
            self.lazy[node] = 0;
        }
    }

    /// `Σ a[l..=r]`.
    pub fn query(&mut self, l: usize, r: usize) -> i64 {
        if self.n == 0 {
            return 0;
        }
        self.query_rec(l, r, 1, 0, self.n - 1)
    }

    fn query_rec(&mut self, l: usize, r: usize, node: usize, lo: usize, hi: usize) -> i64 {
        if r < lo || hi < l {
            return 0;
        }
        if l <= lo && hi <= r {
            return self.tree[node];
        }
        self.push(node, lo, hi);
        let mid = (lo + hi) / 2;
        self.query_rec(l, r, 2 * node, lo, mid)
            .wrapping_add(self.query_rec(l, r, 2 * node + 1, mid + 1, hi))
    }

    /// Add `val` to every element of `a[l..=r]`.
    pub fn update(&mut self, l: usize, r: usize, val: i64) {
        if self.n == 0 {
            return;
        }
        self.update_rec(l, r, val, 1, 0, self.n - 1);
    }

    fn update_rec(&mut self, l: usize, r: usize, val: i64, node: usize, lo: usize, hi: usize) {
        if r < lo || hi < l {
            return;
        }
        if l <= lo && hi <= r {
            self.apply(node, lo, hi, val);
            return;
        }
        self.push(node, lo, hi);
        let mid = (lo + hi) / 2;
        self.update_rec(l, r, val, 2 * node, lo, mid);
        self.update_rec(l, r, val, 2 * node + 1, mid + 1, hi);
        self.tree[node] = self.tree[2 * node].wrapping_add(self.tree[2 * node + 1]);
    }
}

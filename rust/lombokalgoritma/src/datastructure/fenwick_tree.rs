// LombokAlgoritma — Fenwick (binary indexed) tree (SPEC §8.4)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::{Error, Result};
use alloc::vec;
use alloc::vec::Vec;

/// Fenwick tree over `i64` with 1-based indices: point update and prefix sums in O(log n).
/// Arithmetic wraps on overflow (never panics).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FenwickTree {
    tree: Vec<i64>,
}

const fn lowbit(i: usize) -> usize {
    i & i.wrapping_neg()
}

impl FenwickTree {
    /// Tree of `n` zeros.
    pub fn new(n: usize) -> Self {
        FenwickTree {
            tree: vec![0; n + 1],
        }
    }

    /// Tree initialised by `update(i + 1, values[i])` in order.
    pub fn from_slice(values: &[i64]) -> Self {
        let mut t = FenwickTree::new(values.len());
        for (i, &v) in values.iter().enumerate() {
            t.add(i + 1, v);
        }
        t
    }

    /// Number of elements `n`.
    pub fn len(&self) -> usize {
        self.tree.len() - 1
    }

    /// `true` when `n = 0`.
    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    fn add(&mut self, mut i: usize, val: i64) {
        let n = self.len();
        while i <= n {
            self.tree[i] = self.tree[i].wrapping_add(val);
            i += lowbit(i);
        }
    }

    /// Add `val` at 1-based index `i`.
    ///
    /// # Errors
    /// [`Error::OutOfBounds`] unless `1 ≤ i ≤ n`.
    pub fn update(&mut self, i: usize, val: i64) -> Result<()> {
        if i == 0 || i > self.len() {
            return Err(Error::OutOfBounds);
        }
        self.add(i, val);
        Ok(())
    }

    /// Sum of elements `1 ..= i` (`prefix_sum(0) = 0`).
    ///
    /// # Errors
    /// [`Error::OutOfBounds`] when `i > n`.
    pub fn prefix_sum(&self, mut i: usize) -> Result<i64> {
        if i > self.len() {
            return Err(Error::OutOfBounds);
        }
        let mut s = 0i64;
        while i > 0 {
            s = s.wrapping_add(self.tree[i]);
            i -= lowbit(i);
        }
        Ok(s)
    }

    /// Sum of elements `l ..= r` (1-based): `prefix(r) − prefix(l − 1)`.
    ///
    /// # Errors
    /// [`Error::OutOfBounds`] when `r > n` or `l > n + 1`.
    pub fn range_sum(&self, l: usize, r: usize) -> Result<i64> {
        let hi = self.prefix_sum(r)?;
        let lo = if l == 0 { 0 } else { self.prefix_sum(l - 1)? };
        Ok(hi.wrapping_sub(lo))
    }

    /// Value at 1-based index `i` (`range_sum(i, i)`).
    ///
    /// # Errors
    /// [`Error::OutOfBounds`] when `i > n`.
    pub fn point_query(&self, i: usize) -> Result<i64> {
        self.range_sum(i, i)
    }
}

// LombokAlgoritma — disjoint set / union–find (SPEC §8.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::{Error, Result};
use alloc::vec;
use alloc::vec::Vec;

/// Union–find with union by rank and full path compression (near O(1) amortised).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DisjointSet {
    parent: Vec<usize>,
    rank: Vec<u8>,
    count: usize,
}

impl DisjointSet {
    /// `n` singleton sets `{0} … {n − 1}`.
    pub fn new(n: usize) -> Self {
        DisjointSet {
            parent: (0..n).collect(),
            rank: vec![0; n],
            count: n,
        }
    }

    /// Number of elements.
    pub fn len(&self) -> usize {
        self.parent.len()
    }

    /// `true` when there are no elements.
    pub fn is_empty(&self) -> bool {
        self.parent.is_empty()
    }

    /// Representative (root) of `x`'s set, compressing the whole path.
    ///
    /// # Errors
    /// [`Error::OutOfBounds`] when `x ≥ n`.
    pub fn find(&mut self, x: usize) -> Result<usize> {
        if x >= self.parent.len() {
            return Err(Error::OutOfBounds);
        }
        let mut root = x;
        while self.parent[root] != root {
            root = self.parent[root];
        }
        let mut cur = x;
        while self.parent[cur] != root {
            let next = self.parent[cur];
            self.parent[cur] = root;
            cur = next;
        }
        Ok(root)
    }

    /// Merge the sets of `x` and `y`; `false` when already in the same set.
    ///
    /// # Errors
    /// [`Error::OutOfBounds`] when `x` or `y` is `≥ n`.
    pub fn union(&mut self, x: usize, y: usize) -> Result<bool> {
        let rx = self.find(x)?;
        let ry = self.find(y)?;
        if rx == ry {
            return Ok(false);
        }
        match self.rank[rx].cmp(&self.rank[ry]) {
            core::cmp::Ordering::Less => self.parent[rx] = ry,
            core::cmp::Ordering::Greater => self.parent[ry] = rx,
            core::cmp::Ordering::Equal => {
                self.parent[ry] = rx;
                self.rank[rx] += 1;
            }
        }
        self.count -= 1;
        Ok(true)
    }

    /// `true` when `x` and `y` are in the same set.
    ///
    /// # Errors
    /// [`Error::OutOfBounds`] when `x` or `y` is `≥ n`.
    pub fn connected(&mut self, x: usize, y: usize) -> Result<bool> {
        Ok(self.find(x)? == self.find(y)?)
    }

    /// Number of disjoint sets.
    pub fn count(&self) -> usize {
        self.count
    }
}

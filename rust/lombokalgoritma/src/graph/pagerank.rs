// LombokAlgoritma — PageRank (SPEC §9.13)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::types::{validate, Graph};
use crate::{Error, Result};
use alloc::vec;
use alloc::vec::Vec;

/// PageRank by `iterations` power iterations from `1/n`; dangling mass is redistributed
/// uniformly. Per iteration (normative evaluation order):
/// `dangling = Σ rank[u]` (out-degree 0, u ascending); `base = (1 − d)/n + (d·dangling)/n`;
/// `next[v] = base`, then for `u` ascending with out-degree > 0, `c = (d·rank[u]) / outdeg[u]`
/// is added to `next[v]` for every edge `u → v` in edge-list order. The reference defaults are
/// `damping = 0.85`, `iterations = 50`.
///
/// # Errors
/// [`Error::OutOfRange`] for an edge endpoint outside `[0, n)` or `damping ∉ [0, 1]`
/// (an empty graph returns `[]` before the damping check).
pub fn page_rank(g: &Graph, damping: f64, iterations: usize) -> Result<Vec<f64>> {
    validate(g)?;
    let n = g.nodes;
    if n == 0 {
        return Ok(Vec::new());
    }
    if !(0.0..=1.0).contains(&damping) {
        return Err(Error::OutOfRange);
    }
    let mut outs: Vec<Vec<usize>> = vec![Vec::new(); n];
    for e in &g.edges {
        outs[e.from].push(e.to);
    }
    let nf = n as f64;
    let mut rank = vec![1.0 / nf; n];
    for _ in 0..iterations {
        let mut dangling = 0.0;
        for u in 0..n {
            if outs[u].is_empty() {
                dangling += rank[u];
            }
        }
        let base = (1.0 - damping) / nf + (damping * dangling) / nf;
        let mut next = vec![base; n];
        for u in 0..n {
            if outs[u].is_empty() {
                continue;
            }
            let c = (damping * rank[u]) / outs[u].len() as f64;
            for &v in &outs[u] {
                next[v] += c;
            }
        }
        rank = next;
    }
    Ok(rank)
}

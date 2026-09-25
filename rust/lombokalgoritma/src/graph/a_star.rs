// LombokAlgoritma — A* search (SPEC §9.4)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::types::{adjacency, check_node, has_negative, Graph};
use crate::core::{tuple_less, MinHeap};
use crate::{Error, Result};
use alloc::vec;
use alloc::vec::Vec;

/// Result of [`a_star`].
#[derive(Debug, Clone, PartialEq)]
pub struct AStarResult {
    /// Nodes `source … target`; empty when unreachable.
    pub path: Vec<usize>,
    /// Path cost; `f64::INFINITY` when unreachable.
    pub cost: f64,
}

/// A* from `source` to `target` with an admissible `heuristic` (`|_| 0.0` ⇒ Dijkstra). The
/// frontier is keyed by `[g + h, node]`; stale entries (`f > g[u] + h(u)`) are skipped; a
/// predecessor is replaced only on a strict improvement.
///
/// # Errors
/// [`Error::OutOfRange`] for an edge endpoint, `source` or `target` outside `[0, n)`;
/// [`Error::NegativeWeight`] when any edge weight is negative.
pub fn a_star<H: Fn(usize) -> f64>(
    g: &Graph,
    source: usize,
    target: usize,
    heuristic: H,
) -> Result<AStarResult> {
    let adj = adjacency(g)?;
    check_node(g, source)?;
    check_node(g, target)?;
    if has_negative(g) {
        return Err(Error::NegativeWeight);
    }
    let mut g_score = vec![f64::INFINITY; g.nodes];
    let mut prev: Vec<Option<usize>> = vec![None; g.nodes];
    g_score[source] = 0.0;
    let mut heap = MinHeap::new(|a: &[f64; 2], b: &[f64; 2]| tuple_less(a, b));
    heap.push([heuristic(source), source as f64]);
    while let Some([f, uf]) = heap.pop() {
        let u = uf as usize;
        let gu = g_score[u];
        if f > gu + heuristic(u) {
            continue;
        }
        if u == target {
            let mut path = vec![target];
            let mut cur = prev[target];
            while let Some(c) = cur {
                path.push(c);
                cur = prev[c];
            }
            path.reverse();
            return Ok(AStarResult { path, cost: gu });
        }
        for &(to, w) in &adj[u] {
            let ng = gu + w;
            if ng < g_score[to] {
                g_score[to] = ng;
                prev[to] = Some(u);
                heap.push([ng + heuristic(to), to as f64]);
            }
        }
    }
    Ok(AStarResult {
        path: Vec::new(),
        cost: f64::INFINITY,
    })
}

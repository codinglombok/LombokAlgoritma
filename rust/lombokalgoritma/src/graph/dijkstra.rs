// LombokAlgoritma — Dijkstra shortest paths (SPEC §9.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::types::{adjacency, check_node, has_negative, Graph};
use crate::core::{tuple_less, MinHeap};
use crate::{Error, Result};
use alloc::vec;
use alloc::vec::Vec;

/// Shortest distance from `source` to every node (`f64::INFINITY` when unreachable), binary heap
/// keyed by `[distance, node]`; stale entries (`d > dist[u]`) are skipped. O((V + E) log V).
///
/// # Errors
/// [`Error::OutOfRange`] for an edge endpoint or `source` outside `[0, n)`;
/// [`Error::NegativeWeight`] when any edge weight is negative.
pub fn dijkstra(g: &Graph, source: usize) -> Result<Vec<f64>> {
    let adj = adjacency(g)?;
    check_node(g, source)?;
    if has_negative(g) {
        return Err(Error::NegativeWeight);
    }
    let mut dist = vec![f64::INFINITY; g.nodes];
    dist[source] = 0.0;
    let mut heap = MinHeap::new(|a: &[f64; 2], b: &[f64; 2]| tuple_less(a, b));
    heap.push([0.0, source as f64]);
    while let Some([d, uf]) = heap.pop() {
        let u = uf as usize;
        if d > dist[u] {
            continue;
        }
        for &(to, w) in &adj[u] {
            let nd = d + w;
            if nd < dist[to] {
                dist[to] = nd;
                heap.push([nd, to as f64]);
            }
        }
    }
    Ok(dist)
}

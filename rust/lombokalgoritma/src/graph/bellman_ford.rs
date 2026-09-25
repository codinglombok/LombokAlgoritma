// LombokAlgoritma — Bellman–Ford (SPEC §9.5)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::types::{check_node, validate, Graph};
use crate::Result;
use alloc::vec;
use alloc::vec::Vec;

/// Result of [`bellman_ford`].
#[derive(Debug, Clone, PartialEq)]
pub struct BellmanFordResult {
    /// Distance from the source (`f64::INFINITY` when unreachable), as when the algorithm stopped.
    pub distances: Vec<f64>,
    /// `true` when a negative cycle is reachable from the source.
    pub has_negative_cycle: bool,
}

/// Relax every edge in edge-list order for up to `n − 1` rounds (stopping early after a round
/// without change), then one detection round. O(V·E).
///
/// # Errors
/// [`crate::Error::OutOfRange`] for an edge endpoint or `source` outside `[0, n)`.
pub fn bellman_ford(g: &Graph, source: usize) -> Result<BellmanFordResult> {
    validate(g)?;
    check_node(g, source)?;
    let mut dist = vec![f64::INFINITY; g.nodes];
    dist[source] = 0.0;
    for _ in 1..g.nodes {
        let mut changed = false;
        for e in &g.edges {
            let du = dist[e.from];
            if du != f64::INFINITY && du + e.weight < dist[e.to] {
                dist[e.to] = du + e.weight;
                changed = true;
            }
        }
        if !changed {
            break;
        }
    }
    let has_negative_cycle = g.edges.iter().any(|e| {
        let du = dist[e.from];
        du != f64::INFINITY && du + e.weight < dist[e.to]
    });
    Ok(BellmanFordResult {
        distances: dist,
        has_negative_cycle,
    })
}

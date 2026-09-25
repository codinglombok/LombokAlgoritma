// LombokAlgoritma — breadth-first search (SPEC §9.1)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::types::{adjacency, check_node, Graph};
use crate::Result;
use alloc::vec;
use alloc::vec::Vec;

/// Hop distance from `source` to every node (`None` when unreachable); FIFO queue, neighbours
/// in edge-list order. O(V + E).
///
/// # Errors
/// [`crate::Error::OutOfRange`] for an edge endpoint or `source` outside `[0, n)`.
pub fn bfs(g: &Graph, source: usize) -> Result<Vec<Option<usize>>> {
    let adj = adjacency(g)?;
    check_node(g, source)?;
    let mut dist = vec![None; g.nodes];
    dist[source] = Some(0);
    let mut queue = vec![source];
    let mut head = 0;
    while head < queue.len() {
        let u = queue[head];
        head += 1;
        let du = dist[u].unwrap_or(0);
        for &(to, _) in &adj[u] {
            if dist[to].is_none() {
                dist[to] = Some(du + 1);
                queue.push(to);
            }
        }
    }
    Ok(dist)
}

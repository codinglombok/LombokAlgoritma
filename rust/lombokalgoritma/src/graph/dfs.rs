// LombokAlgoritma — depth-first search (SPEC §9.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::types::{adjacency, check_node, Graph};
use crate::Result;
use alloc::vec;
use alloc::vec::Vec;

/// Pre-order of an iterative DFS from `source`: pop a node, skip it if visited, otherwise emit it
/// and push its unvisited neighbours in **reverse** edge-list order. O(V + E).
///
/// # Errors
/// [`crate::Error::OutOfRange`] for an edge endpoint or `source` outside `[0, n)`.
pub fn dfs(g: &Graph, source: usize) -> Result<Vec<usize>> {
    let adj = adjacency(g)?;
    check_node(g, source)?;
    let mut visited = vec![false; g.nodes];
    let mut order = Vec::new();
    let mut stack = vec![source];
    while let Some(u) = stack.pop() {
        if visited[u] {
            continue;
        }
        visited[u] = true;
        order.push(u);
        for &(to, _) in adj[u].iter().rev() {
            if !visited[to] {
                stack.push(to);
            }
        }
    }
    Ok(order)
}

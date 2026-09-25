// LombokAlgoritma — topological sort, Kahn (SPEC §9.7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::types::{adjacency, Graph};
use crate::Result;
use alloc::vec;
use alloc::vec::Vec;

/// Kahn's algorithm with a FIFO queue seeded with the in-degree-0 nodes ascending; neighbours
/// are released in edge-list order. Returns an empty vector when the graph has a cycle. O(V + E).
///
/// # Errors
/// [`crate::Error::OutOfRange`] for an edge endpoint outside `[0, n)`.
pub fn topological_sort(g: &Graph) -> Result<Vec<usize>> {
    let adj = adjacency(g)?;
    let mut indeg = vec![0usize; g.nodes];
    for e in &g.edges {
        indeg[e.to] += 1;
    }
    let mut queue: Vec<usize> = (0..g.nodes).filter(|&i| indeg[i] == 0).collect();
    let mut head = 0;
    while head < queue.len() {
        let u = queue[head];
        head += 1;
        for &(to, _) in &adj[u] {
            indeg[to] -= 1;
            if indeg[to] == 0 {
                queue.push(to);
            }
        }
    }
    if queue.len() == g.nodes {
        Ok(queue)
    } else {
        Ok(Vec::new())
    }
}

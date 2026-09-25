// LombokAlgoritma — graph model (SPEC §9.0)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::{Error, Result};
use alloc::vec;
use alloc::vec::Vec;

/// Directed edge `from → to` with a weight (capacity for [`super::dinic`]).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Edge {
    /// Tail node.
    pub from: usize,
    /// Head node.
    pub to: usize,
    /// Weight / capacity.
    pub weight: f64,
}

impl Edge {
    /// Edge `from → to` with `weight`.
    pub const fn new(from: usize, to: usize, weight: f64) -> Self {
        Edge { from, to, weight }
    }
}

/// Directed multigraph on nodes `0 … nodes − 1` (parallel edges and loops allowed).
///
/// Edge order is significant: every traversal is defined in terms of the edge-list order.
/// Kruskal, Prim and bipartite matching read the edges as undirected.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct Graph {
    /// Number of nodes.
    pub nodes: usize,
    /// Ordered edge list.
    pub edges: Vec<Edge>,
}

impl Graph {
    /// Graph with `nodes` nodes and the given edges.
    pub fn new(nodes: usize, edges: Vec<Edge>) -> Self {
        Graph { nodes, edges }
    }

    /// Graph from `(from, to, weight)` triples.
    pub fn from_triples(nodes: usize, edges: &[(usize, usize, f64)]) -> Self {
        Graph {
            nodes,
            edges: edges.iter().map(|&(f, t, w)| Edge::new(f, t, w)).collect(),
        }
    }
}

/// Outgoing neighbours `(to, weight)` of every node, in edge-list order.
pub(crate) type AdjList = Vec<Vec<(usize, f64)>>;

/// Check every edge endpoint lies in `[0, n)`.
pub(crate) fn validate(g: &Graph) -> Result<()> {
    if g.edges.iter().any(|e| e.from >= g.nodes || e.to >= g.nodes) {
        return Err(Error::OutOfRange);
    }
    Ok(())
}

/// Validate and build the outgoing adjacency list.
pub(crate) fn adjacency(g: &Graph) -> Result<AdjList> {
    validate(g)?;
    let mut adj = vec![Vec::new(); g.nodes];
    for e in &g.edges {
        adj[e.from].push((e.to, e.weight));
    }
    Ok(adj)
}

/// `Err(OutOfRange)` unless `v` is a node of `g`.
pub(crate) fn check_node(g: &Graph, v: usize) -> Result<()> {
    if v >= g.nodes {
        return Err(Error::OutOfRange);
    }
    Ok(())
}

pub(crate) fn has_negative(g: &Graph) -> bool {
    g.edges.iter().any(|e| e.weight < 0.0)
}

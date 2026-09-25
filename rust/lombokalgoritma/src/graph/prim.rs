// LombokAlgoritma — Prim minimum spanning forest, lazy (SPEC §9.9)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::types::{validate, Edge, Graph};
use crate::core::{tuple_less, MinHeap};
use crate::Result;
use alloc::vec;
use alloc::vec::Vec;

/// Minimum spanning forest of the graph read as undirected (lazy Prim). Trees grow from the
/// lowest-numbered unvisited node; the heap is keyed by `[weight, to, from, edge_index]`; each
/// chosen edge is returned oriented tree → new node, in the order taken. O(E log E).
///
/// # Errors
/// [`crate::Error::OutOfRange`] for an edge endpoint outside `[0, n)`.
pub fn prim(g: &Graph) -> Result<Vec<Edge>> {
    validate(g)?;
    let n = g.nodes;
    let mut adj: Vec<Vec<(usize, f64, usize)>> = vec![Vec::new(); n];
    for (i, e) in g.edges.iter().enumerate() {
        adj[e.from].push((e.to, e.weight, i));
        if e.from != e.to {
            adj[e.to].push((e.from, e.weight, i));
        }
    }
    let mut in_tree = vec![false; n];
    let mut out = Vec::new();
    let mut heap = MinHeap::new(|a: &[f64; 4], b: &[f64; 4]| tuple_less(a, b));
    let visit = |u: usize, in_tree: &mut Vec<bool>, heap: &mut MinHeap<[f64; 4], _>| {
        in_tree[u] = true;
        for &(to, w, i) in &adj[u] {
            if !in_tree[to] {
                heap.push([w, to as f64, u as f64, i as f64]);
            }
        }
    };
    for root in 0..n {
        if in_tree[root] {
            continue;
        }
        visit(root, &mut in_tree, &mut heap);
        while let Some([w, to, from, _]) = heap.pop() {
            let (to, from) = (to as usize, from as usize);
            if in_tree[to] {
                continue;
            }
            out.push(Edge::new(from, to, w));
            visit(to, &mut in_tree, &mut heap);
        }
    }
    Ok(out)
}

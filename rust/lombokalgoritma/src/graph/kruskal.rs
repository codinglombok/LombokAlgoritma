// LombokAlgoritma — Kruskal minimum spanning forest (SPEC §9.8)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::types::{validate, Edge, Graph};
use crate::datastructure::DisjointSet;
use crate::sort::mergesort_by;
use crate::Result;
use alloc::vec::Vec;
use core::cmp::Ordering;

/// Minimum spanning forest of the graph read as undirected: edges in a **stable** ascending
/// order of weight (ties keep edge-list order), taken when they join two components. Edges are
/// returned in the order taken, with their original orientation. O(E log E).
///
/// # Errors
/// [`crate::Error::OutOfRange`] for an edge endpoint outside `[0, n)`.
pub fn kruskal(g: &Graph) -> Result<Vec<Edge>> {
    validate(g)?;
    let mut order: Vec<Edge> = g.edges.clone();
    mergesort_by(&mut order, |a, b| {
        a.weight.partial_cmp(&b.weight).unwrap_or(Ordering::Equal)
    });
    let mut ds = DisjointSet::new(g.nodes);
    let mut out = Vec::new();
    for e in order {
        if ds.union(e.from, e.to)? {
            out.push(e);
        }
    }
    Ok(out)
}

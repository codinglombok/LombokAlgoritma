// LombokAlgoritma — Tarjan strongly connected components (SPEC §9.10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::types::{adjacency, Graph};
use crate::Result;
use alloc::vec;
use alloc::vec::Vec;

/// Strongly connected components (Tarjan), iterative but visiting exactly like the recursive
/// version: roots ascending, neighbours in edge-list order. Components are returned in completion
/// order (reverse topological order of the condensation), each sorted ascending. O(V + E).
///
/// # Errors
/// [`crate::Error::OutOfRange`] for an edge endpoint outside `[0, n)`.
pub fn tarjan_scc(g: &Graph) -> Result<Vec<Vec<usize>>> {
    let adj = adjacency(g)?;
    let n = g.nodes;
    let mut index: Vec<Option<usize>> = vec![None; n];
    let mut low = vec![0usize; n];
    let mut on_stack = vec![false; n];
    let mut stack: Vec<usize> = Vec::new();
    let mut out = Vec::new();
    let mut counter = 0usize;
    for root in 0..n {
        if index[root].is_some() {
            continue;
        }
        let mut call: Vec<(usize, usize)> = vec![(root, 0)];
        index[root] = Some(counter);
        low[root] = counter;
        counter += 1;
        stack.push(root);
        on_stack[root] = true;
        while let Some(&(v, pos)) = call.last() {
            if pos < adj[v].len() {
                if let Some(frame) = call.last_mut() {
                    frame.1 = pos + 1;
                }
                let w = adj[v][pos].0;
                match index[w] {
                    None => {
                        index[w] = Some(counter);
                        low[w] = counter;
                        counter += 1;
                        stack.push(w);
                        on_stack[w] = true;
                        call.push((w, 0));
                    }
                    Some(iw) if on_stack[w] => low[v] = low[v].min(iw),
                    Some(_) => {}
                }
                continue;
            }
            call.pop();
            if let Some(&(parent, _)) = call.last() {
                low[parent] = low[parent].min(low[v]);
            }
            if Some(low[v]) == index[v] {
                let mut comp = Vec::new();
                while let Some(w) = stack.pop() {
                    on_stack[w] = false;
                    comp.push(w);
                    if w == v {
                        break;
                    }
                }
                comp.sort_unstable();
                out.push(comp);
            }
        }
    }
    Ok(out)
}

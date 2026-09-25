// LombokAlgoritma — maximum bipartite matching, Hopcroft–Karp (SPEC §9.12)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::{Error, Result};
use alloc::vec;
use alloc::vec::Vec;

/// Result of [`bipartite_matching`].
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MatchingResult {
    /// Number of matched pairs (the only normative field).
    pub size: usize,
    /// Matched right vertex of each left vertex.
    pub match_left: Vec<Option<usize>>,
    /// Matched left vertex of each right vertex.
    pub match_right: Vec<Option<usize>>,
}

/// Maximum matching of the bipartite graph with left vertices `0 … n_left − 1`, right vertices
/// `0 … n_right − 1` and `(left, right)` edges. Hopcroft–Karp, O(E·√V).
///
/// # Errors
/// [`Error::OutOfRange`] for a pair outside the vertex ranges.
pub fn bipartite_matching(
    n_left: usize,
    n_right: usize,
    pairs: &[(usize, usize)],
) -> Result<MatchingResult> {
    let mut adj: Vec<Vec<usize>> = vec![Vec::new(); n_left];
    for &(u, v) in pairs {
        if u >= n_left || v >= n_right {
            return Err(Error::OutOfRange);
        }
        adj[u].push(v);
    }
    let mut match_left: Vec<Option<usize>> = vec![None; n_left];
    let mut match_right: Vec<Option<usize>> = vec![None; n_right];
    // dist = None ⇔ ∞
    let mut dist: Vec<Option<usize>> = vec![Some(0); n_left];
    let mut it = vec![0usize; n_left];
    let mut size = 0;
    loop {
        // BFS layering from the free left vertices
        let mut q = Vec::new();
        for u in 0..n_left {
            if match_left[u].is_none() {
                dist[u] = Some(0);
                q.push(u);
            } else {
                dist[u] = None;
            }
        }
        let mut found = false;
        let mut h = 0;
        while h < q.len() {
            let u = q[h];
            h += 1;
            for &v in &adj[u] {
                match match_right[v] {
                    None => found = true,
                    Some(w) if dist[w].is_none() => {
                        dist[w] = dist[u].map(|d| d + 1);
                        q.push(w);
                    }
                    Some(_) => {}
                }
            }
        }
        if !found {
            break;
        }
        it.fill(0);
        for root in 0..n_left {
            if match_left[root].is_some() {
                continue;
            }
            // iterative DFS along the layered graph
            let mut stack = vec![root];
            let mut via: Vec<usize> = Vec::new();
            let mut augmented = false;
            while let Some(&u) = stack.last() {
                let mut pushed = false;
                while it[u] < adj[u].len() {
                    let v = adj[u][it[u]];
                    it[u] += 1;
                    match match_right[v] {
                        None => {
                            via.push(v);
                            for (&lu, &rv) in stack.iter().zip(&via) {
                                match_left[lu] = Some(rv);
                                match_right[rv] = Some(lu);
                            }
                            augmented = true;
                            break;
                        }
                        Some(w) if dist[w].is_some() && dist[w] == dist[u].map(|d| d + 1) => {
                            via.push(v);
                            stack.push(w);
                            pushed = true;
                            break;
                        }
                        Some(_) => {}
                    }
                }
                if augmented {
                    break;
                }
                if pushed {
                    continue;
                }
                dist[u] = None;
                stack.pop();
                via.pop();
            }
            if augmented {
                size += 1;
            }
        }
    }
    Ok(MatchingResult {
        size,
        match_left,
        match_right,
    })
}

// LombokAlgoritma — Dinic maximum flow (SPEC §9.11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::types::{check_node, validate, Graph};
use crate::{Error, Result};
use alloc::vec;
use alloc::vec::Vec;

struct Residual {
    to: Vec<usize>,
    cap: Vec<f64>,
    head: Vec<Vec<usize>>,
    level: Vec<Option<usize>>,
    it: Vec<usize>,
}

impl Residual {
    fn bfs(&mut self, s: usize, t: usize) -> bool {
        self.level.fill(None);
        self.level[s] = Some(0);
        let mut q = vec![s];
        let mut h = 0;
        while h < q.len() {
            let u = q[h];
            h += 1;
            let lu = self.level[u].unwrap_or(0);
            for &id in &self.head[u] {
                let v = self.to[id];
                if self.cap[id] > 0.0 && self.level[v].is_none() {
                    self.level[v] = Some(lu + 1);
                    q.push(v);
                }
            }
        }
        self.level[t].is_some()
    }

    /// Find one augmenting path in the level graph and push flow along it; 0 when blocked.
    fn augment(&mut self, s: usize, t: usize) -> f64 {
        let mut path: Vec<usize> = Vec::new();
        let mut u = s;
        loop {
            if u == t {
                let f = path
                    .iter()
                    .fold(f64::INFINITY, |f, &id| f.min(self.cap[id]));
                for &id in &path {
                    self.cap[id] -= f;
                    self.cap[id ^ 1] += f;
                }
                return f;
            }
            let mut advanced = false;
            while self.it[u] < self.head[u].len() {
                let id = self.head[u][self.it[u]];
                let v = self.to[id];
                let next_level = self.level[u].map(|l| l + 1);
                if self.cap[id] > 0.0 && self.level[v].is_some() && self.level[v] == next_level {
                    path.push(id);
                    u = v;
                    advanced = true;
                    break;
                }
                self.it[u] += 1;
            }
            if advanced {
                continue;
            }
            if u == s {
                return 0.0;
            }
            self.level[u] = None; // dead end: prune
            let Some(back) = path.pop() else {
                return 0.0;
            };
            u = self.to[back ^ 1];
            self.it[u] += 1;
        }
    }
}

/// Value of a maximum `source → sink` flow; edge weights are capacities (parallel edges add up).
/// BFS level graph + blocking flow with current-arc pointers, O(V²·E). Only the flow value is
/// normative; it is exact for integer capacities below 2^53.
///
/// # Errors
/// [`Error::OutOfRange`] for an edge endpoint, `source` or `sink` outside `[0, n)`;
/// [`Error::InvalidInput`] when `source == sink`; [`Error::NegativeWeight`] for a negative
/// capacity.
pub fn dinic(g: &Graph, source: usize, sink: usize) -> Result<f64> {
    validate(g)?;
    check_node(g, source)?;
    check_node(g, sink)?;
    if source == sink {
        return Err(Error::InvalidInput);
    }
    let n = g.nodes;
    let mut r = Residual {
        to: Vec::with_capacity(2 * g.edges.len()),
        cap: Vec::with_capacity(2 * g.edges.len()),
        head: vec![Vec::new(); n],
        level: vec![None; n],
        it: vec![0; n],
    };
    for e in &g.edges {
        if e.weight < 0.0 {
            return Err(Error::NegativeWeight);
        }
        r.head[e.from].push(r.to.len());
        r.to.push(e.to);
        r.cap.push(e.weight);
        r.head[e.to].push(r.to.len());
        r.to.push(e.from);
        r.cap.push(0.0);
    }
    let mut flow = 0.0;
    while r.bfs(source, sink) {
        r.it.fill(0);
        loop {
            let f = r.augment(source, sink);
            if f > 0.0 {
                flow += f;
            } else {
                break;
            }
        }
    }
    Ok(flow)
}

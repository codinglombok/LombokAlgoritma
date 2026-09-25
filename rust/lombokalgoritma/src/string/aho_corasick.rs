// LombokAlgoritma — Aho–Corasick multi-pattern search (SPEC §11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use alloc::string::String;
use alloc::vec;
use alloc::vec::Vec;

#[derive(Debug, Clone, Default)]
struct Node {
    /// Children in insertion order.
    children: Vec<(char, usize)>,
    fail: usize,
    /// Patterns (ids) ending exactly here, in insertion order.
    own: Vec<usize>,
    /// `own` followed by the failure node's `output`.
    output: Vec<usize>,
}

impl Node {
    fn child(&self, c: char) -> Option<usize> {
        self.children.iter().find(|(k, _)| *k == c).map(|&(_, v)| v)
    }
}

/// One match: `pattern` found at code-point offset `index`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AhoCorasickMatch {
    /// The matched pattern.
    pub pattern: String,
    /// Start offset in code points.
    pub index: usize,
}

/// Aho–Corasick automaton over Unicode code points. O(n + m + z).
///
/// Matches are reported by ascending *end* position; at one end position the node's own
/// patterns come first (insertion order), then those inherited through the failure link.
#[derive(Debug, Clone)]
pub struct AhoCorasick {
    nodes: Vec<Node>,
    patterns: Vec<(String, usize)>,
    built: bool,
}

impl Default for AhoCorasick {
    fn default() -> Self {
        Self::new()
    }
}

impl AhoCorasick {
    /// Empty automaton.
    pub fn new() -> Self {
        AhoCorasick {
            nodes: vec![Node::default()],
            patterns: Vec::new(),
            built: false,
        }
    }

    /// Automaton with all `patterns` added and built.
    pub fn with_patterns<'a, I: IntoIterator<Item = &'a str>>(patterns: I) -> Self {
        let mut ac = Self::new();
        for p in patterns {
            ac.add_pattern(p);
        }
        ac.build();
        ac
    }

    /// Add a pattern (empty patterns are ignored); the automaton is rebuilt on the next search.
    pub fn add_pattern(&mut self, pattern: &str) {
        if pattern.is_empty() {
            return;
        }
        let mut cur = 0;
        let mut len = 0;
        for c in pattern.chars() {
            len += 1;
            cur = if let Some(next) = self.nodes[cur].child(c) {
                next
            } else {
                let next = self.nodes.len();
                self.nodes[cur].children.push((c, next));
                self.nodes.push(Node::default());
                next
            };
        }
        self.nodes[cur].own.push(self.patterns.len());
        self.patterns.push((String::from(pattern), len));
        self.built = false;
    }

    /// Compute the failure links (BFS).
    pub fn build(&mut self) {
        for n in &mut self.nodes {
            n.output = n.own.clone();
            n.fail = 0;
        }
        let mut queue: Vec<usize> = self.nodes[0].children.iter().map(|&(_, v)| v).collect();
        let mut head = 0;
        while head < queue.len() {
            let u = queue[head];
            head += 1;
            let children = self.nodes[u].children.clone();
            for (c, v) in children {
                let mut f = self.nodes[u].fail;
                while f != 0 && self.nodes[f].child(c).is_none() {
                    f = self.nodes[f].fail;
                }
                let fail = match self.nodes[f].child(c) {
                    Some(fv) if fv != v => fv,
                    _ => 0,
                };
                self.nodes[v].fail = fail;
                let inherited = self.nodes[fail].output.clone();
                self.nodes[v].output.extend(inherited);
                queue.push(v);
            }
        }
        self.built = true;
    }

    /// All matches in `text` (builds the automaton first if needed).
    pub fn search(&mut self, text: &str) -> Vec<AhoCorasickMatch> {
        if !self.built {
            self.build();
        }
        let mut out = Vec::new();
        let mut cur = 0;
        for (i, c) in text.chars().enumerate() {
            while cur != 0 && self.nodes[cur].child(c).is_none() {
                cur = self.nodes[cur].fail;
            }
            cur = self.nodes[cur].child(c).unwrap_or(0);
            for &id in &self.nodes[cur].output {
                let (p, len) = &self.patterns[id];
                out.push(AhoCorasickMatch {
                    pattern: p.clone(),
                    index: i + 1 - len,
                });
            }
        }
        out
    }
}

// LombokAlgoritma — Levenshtein and Damerau–Levenshtein distances (SPEC §11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use alloc::collections::BTreeMap;
use alloc::vec;
use alloc::vec::Vec;

/// Levenshtein edit distance over code points (insert/delete/substitute cost 1).
/// O(m·n) time, O(min(m, n)) space.
pub fn levenshtein(a: &str, b: &str) -> usize {
    if a == b {
        return 0;
    }
    let mut a: Vec<char> = a.chars().collect();
    let mut b: Vec<char> = b.chars().collect();
    if a.len() > b.len() {
        core::mem::swap(&mut a, &mut b);
    }
    if a.is_empty() {
        return b.len();
    }
    let mut prev: Vec<usize> = (0..=a.len()).collect();
    let mut cur = vec![0usize; a.len() + 1];
    for (j, cb) in b.iter().enumerate() {
        cur[0] = j + 1;
        for (i, ca) in a.iter().enumerate() {
            let cost = usize::from(ca != cb);
            cur[i + 1] = (cur[i] + 1).min(prev[i + 1] + 1).min(prev[i] + cost);
        }
        core::mem::swap(&mut prev, &mut cur);
    }
    prev[a.len()]
}

/// Unrestricted Damerau–Levenshtein distance (Lowrance–Wagner: adjacent transpositions, with
/// edits allowed between the transposed characters), over code points. O(m·n).
pub fn damerau_levenshtein(a: &str, b: &str) -> usize {
    let a: Vec<char> = a.chars().collect();
    let b: Vec<char> = b.chars().collect();
    let (m, n) = (a.len(), b.len());
    if m == 0 {
        return n;
    }
    if n == 0 {
        return m;
    }
    let max_dist = m + n;
    let mut d = vec![vec![0usize; n + 2]; m + 2];
    d[0][0] = max_dist;
    for i in 0..=m {
        d[i + 1][0] = max_dist;
        d[i + 1][1] = i;
    }
    for j in 0..=n {
        d[0][j + 1] = max_dist;
        d[1][j + 1] = j;
    }
    let mut da: BTreeMap<char, usize> = BTreeMap::new();
    for i in 1..=m {
        let mut db = 0;
        for j in 1..=n {
            let i1 = da.get(&b[j - 1]).copied().unwrap_or(0);
            let j1 = db;
            let cost = usize::from(a[i - 1] != b[j - 1]);
            if cost == 0 {
                db = j;
            }
            d[i + 1][j + 1] = (d[i][j] + cost)
                .min(d[i + 1][j] + 1)
                .min(d[i][j + 1] + 1)
                .min(d[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1));
        }
        da.insert(a[i - 1], i);
    }
    d[m + 1][n + 1]
}

// LombokAlgoritma — Knuth–Morris–Pratt (SPEC §11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use alloc::vec;
use alloc::vec::Vec;

fn failure(p: &[char]) -> Vec<usize> {
    let mut f = vec![0usize; p.len()];
    let mut k = 0;
    for i in 1..p.len() {
        while k > 0 && p[k] != p[i] {
            k = f[k - 1];
        }
        if p[k] == p[i] {
            k += 1;
        }
        f[i] = k;
    }
    f
}

/// All (possibly overlapping) start offsets of `pattern` in `text`, in **code points**;
/// empty for an empty pattern. O(n + m).
pub fn kmp_search(text: &str, pattern: &str) -> Vec<usize> {
    let p: Vec<char> = pattern.chars().collect();
    if p.is_empty() {
        return Vec::new();
    }
    let f = failure(&p);
    let mut out = Vec::new();
    let mut k = 0;
    for (i, c) in text.chars().enumerate() {
        while k > 0 && p[k] != c {
            k = f[k - 1];
        }
        if p[k] == c {
            k += 1;
        }
        if k == p.len() {
            out.push(i + 1 - k);
            k = f[k - 1];
        }
    }
    out
}

/// First match offset (code points), if any.
pub fn kmp_find(text: &str, pattern: &str) -> Option<usize> {
    kmp_search(text, pattern).first().copied()
}

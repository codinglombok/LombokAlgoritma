// LombokAlgoritma — Jaro and Jaro–Winkler similarity (SPEC §11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use alloc::vec;
use alloc::vec::Vec;

/// Jaro similarity in `[0, 1]` over code points. `a = b → 1`; match window
/// `⌊max(|a|, |b|)/2⌋ − 1` (negative → 0); greedy matching; the result is evaluated exactly as
/// `((m/|a| + m/|b|) + (m − t/2)/m) / 3`.
pub fn jaro(a: &str, b: &str) -> f64 {
    if a == b {
        return 1.0;
    }
    let a: Vec<char> = a.chars().collect();
    let b: Vec<char> = b.chars().collect();
    let longest = a.len().max(b.len());
    if longest / 2 < 1 {
        return 0.0; // match distance < 0
    }
    let md = longest / 2 - 1;
    let mut a_m = vec![false; a.len()];
    let mut b_m = vec![false; b.len()];
    let mut matches = 0usize;
    for i in 0..a.len() {
        let lo = i.saturating_sub(md);
        let hi = (i + md + 1).min(b.len());
        for j in lo..hi {
            if b_m[j] || a[i] != b[j] {
                continue;
            }
            a_m[i] = true;
            b_m[j] = true;
            matches += 1;
            break;
        }
    }
    if matches == 0 {
        return 0.0;
    }
    let mut t = 0usize;
    let mut k = 0usize;
    for i in 0..a.len() {
        if !a_m[i] {
            continue;
        }
        while !b_m[k] {
            k += 1;
        }
        if a[i] != b[k] {
            t += 1;
        }
        k += 1;
    }
    let m = matches as f64;
    (m / a.len() as f64 + m / b.len() as f64 + (m - t as f64 / 2.0) / m) / 3.0
}

/// Jaro–Winkler similarity: `j + ((ℓ·p)·(1 − j))`, `ℓ` = common prefix length (≤ 4);
/// the conventional scaling factor is `p = 0.1`.
pub fn jaro_winkler(a: &str, b: &str, p: f64) -> f64 {
    let j = jaro(a, b);
    let prefix = a
        .chars()
        .zip(b.chars())
        .take(4)
        .take_while(|(x, y)| x == y)
        .count();
    j + prefix as f64 * p * (1.0 - j)
}

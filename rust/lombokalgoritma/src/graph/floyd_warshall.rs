// LombokAlgoritma — Floyd–Warshall (SPEC §9.6)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::types::{validate, Graph};
use crate::Result;
use alloc::vec::Vec;

/// ECMAScript `Math.min` for two numbers (NaN propagates, `-0 < +0`).
fn js_min(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() {
        f64::NAN
    } else if a == b {
        if a.is_sign_negative() {
            a
        } else {
            b
        }
    } else if a < b {
        a
    } else {
        b
    }
}

/// All-pairs distances (`f64::INFINITY` when unreachable); parallel edges keep the minimum
/// weight; loop order `k → i → j`, rows with `dist[i][k] = ∞` skipped, strict `<` update. O(V³).
///
/// # Errors
/// [`crate::Error::OutOfRange`] for an edge endpoint outside `[0, n)`.
#[allow(clippy::needless_range_loop)]
pub fn floyd_warshall(g: &Graph) -> Result<Vec<Vec<f64>>> {
    validate(g)?;
    let n = g.nodes;
    let mut dist: Vec<Vec<f64>> = (0..n)
        .map(|i| {
            (0..n)
                .map(|j| if i == j { 0.0 } else { f64::INFINITY })
                .collect()
        })
        .collect();
    for e in &g.edges {
        dist[e.from][e.to] = js_min(dist[e.from][e.to], e.weight);
    }
    for k in 0..n {
        for i in 0..n {
            let dik = dist[i][k];
            if dik == f64::INFINITY {
                continue;
            }
            // dist[k][j] is read live (not via an iterator): row k may change while i = k (negative self-loop)
            for j in 0..n {
                let cand = dik + dist[k][j];
                if cand < dist[i][j] {
                    dist[i][j] = cand;
                }
            }
        }
    }
    Ok(dist)
}

#[cfg(test)]
mod tests {
    use super::js_min;
    #[test]
    fn min_semantics() {
        assert!(js_min(f64::NAN, 1.0).is_nan());
        assert!(js_min(0.0, -0.0).is_sign_negative());
        assert!(js_min(-0.0, 0.0).is_sign_negative());
        assert_eq!(js_min(2.0, 1.0), 1.0);
        assert_eq!(js_min(1.0, 2.0), 1.0);
    }
}

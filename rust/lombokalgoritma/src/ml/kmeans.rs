// LombokAlgoritma — k-means (Lloyd + k-means++), SPEC §13.1
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::num::sqrt;
use crate::rng::Xoshiro256pp;
use crate::{Error, Result};
use alloc::vec;
use alloc::vec::Vec;

/// Options of [`kmeans`].
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct KMeansOptions {
    /// Maximum number of Lloyd iterations (default 300).
    pub max_iter: usize,
    /// Stop when every centroid moved by less than `tol` (default `1e-4`).
    pub tol: f64,
    /// xoshiro256++ seed (default [`Xoshiro256pp::DEFAULT_SEED`]).
    pub seed: u64,
}

impl Default for KMeansOptions {
    fn default() -> Self {
        KMeansOptions {
            max_iter: 300,
            tol: 1e-4,
            seed: Xoshiro256pp::DEFAULT_SEED,
        }
    }
}

/// Result of [`kmeans`].
#[derive(Debug, Clone, PartialEq)]
pub struct KMeansResult {
    /// Final centroids.
    pub centroids: Vec<Vec<f64>>,
    /// Cluster of every point.
    pub labels: Vec<usize>,
    /// Lloyd iterations performed (≤ `max_iter`).
    pub iterations: usize,
    /// `Σ sq(pᵢ, centroid[labelᵢ])`.
    pub inertia: f64,
}

fn sq_dist(a: &[f64], b: &[f64]) -> f64 {
    let mut s = 0.0;
    for (x, y) in a.iter().zip(b) {
        let d = x - y;
        s += d * d;
    }
    s
}

fn kmeanspp(points: &[Vec<f64>], k: usize, rng: &mut Xoshiro256pp) -> Result<Vec<Vec<f64>>> {
    let n = points.len();
    let first = rng.next_int(n as u64)? as usize;
    let mut centroids = vec![points[first].clone()];
    let mut dists: Vec<f64> = points.iter().map(|p| sq_dist(p, &centroids[0])).collect();
    while centroids.len() < k {
        let mut total = 0.0;
        for d in &dists {
            total += d;
        }
        let mut r = rng.next_float() * total;
        let mut pick = n - 1;
        for (i, d) in dists.iter().enumerate() {
            r -= d;
            if r <= 0.0 {
                pick = i;
                break;
            }
        }
        let c = points[pick].clone();
        for (i, p) in points.iter().enumerate() {
            let d = sq_dist(p, &c);
            if d < dists[i] {
                dists[i] = d;
            }
        }
        centroids.push(c);
    }
    Ok(centroids)
}

/// k-means clustering, deterministic for a given seed (SPEC §13.1): k-means++ seeding with
/// xoshiro256++, then Lloyd iterations — assignment to the lowest-index centroid with the
/// strictly smallest squared distance; new centroid = member mean (sums in point order, then
/// divided by the count); an empty cluster keeps its centroid; stop when `max shift < tol`.
///
/// # Errors
/// [`Error::EmptyInput`] without points; [`Error::OutOfRange`] unless `1 ≤ k ≤ n`;
/// [`Error::InvalidInput`] for points of unequal dimension.
pub fn kmeans(points: &[Vec<f64>], k: usize, options: KMeansOptions) -> Result<KMeansResult> {
    let n = points.len();
    if n == 0 {
        return Err(Error::EmptyInput);
    }
    if k < 1 || k > n {
        return Err(Error::OutOfRange);
    }
    let d = points[0].len();
    if points.iter().any(|p| p.len() != d) {
        return Err(Error::InvalidInput);
    }
    let mut rng = Xoshiro256pp::new(options.seed);
    let mut centroids = kmeanspp(points, k, &mut rng)?;
    let mut labels = vec![0usize; n];
    let mut iter = 0;
    while iter < options.max_iter {
        iter += 1;
        for (i, p) in points.iter().enumerate() {
            let mut best = 0;
            let mut best_dist = f64::INFINITY;
            for (c, cen) in centroids.iter().enumerate() {
                let dist = sq_dist(p, cen);
                if dist < best_dist {
                    best_dist = dist;
                    best = c;
                }
            }
            labels[i] = best;
        }
        let mut sums = vec![vec![0.0; d]; k];
        let mut counts = vec![0usize; k];
        for (p, &c) in points.iter().zip(&labels) {
            for (s, x) in sums[c].iter_mut().zip(p) {
                *s += x;
            }
            counts[c] += 1;
        }
        let mut max_shift = 0.0;
        for c in 0..k {
            if counts[c] == 0 {
                continue;
            }
            let cnt = counts[c] as f64;
            let nc: Vec<f64> = sums[c].iter().map(|v| v / cnt).collect();
            let shift = sqrt(sq_dist(&centroids[c], &nc));
            if shift > max_shift {
                max_shift = shift;
            }
            centroids[c] = nc;
        }
        if max_shift < options.tol {
            break;
        }
    }
    let mut inertia = 0.0;
    for (p, &l) in points.iter().zip(&labels) {
        inertia += sq_dist(p, &centroids[l]);
    }
    Ok(KMeansResult {
        centroids,
        labels,
        iterations: iter,
        inertia,
    })
}

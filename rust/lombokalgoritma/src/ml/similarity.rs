// LombokAlgoritma — vector similarity and distance (SPEC §13.1)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Every Σ runs from index 0 upwards starting at `0.0`, without FMA or reassociation.
use crate::num::{abs, sqrt};
use crate::sort::mergesort_by;
use crate::{Error, Result};
use alloc::collections::BTreeSet;
use alloc::vec::Vec;
use core::cmp::Ordering;

fn same_len(a: &[f64], b: &[f64]) -> Result<()> {
    if a.len() == b.len() {
        Ok(())
    } else {
        Err(Error::InvalidInput)
    }
}

/// Dot product `Σ aᵢ·bᵢ`.
///
/// # Errors
/// [`Error::InvalidInput`] when the lengths differ.
pub fn dot_product(a: &[f64], b: &[f64]) -> Result<f64> {
    same_len(a, b)?;
    let mut s = 0.0;
    for (x, y) in a.iter().zip(b) {
        s += x * y;
    }
    Ok(s)
}

/// Euclidean norm `√(Σ vᵢ·vᵢ)`.
pub fn l2_norm(v: &[f64]) -> f64 {
    let mut s = 0.0;
    for x in v {
        s += x * x;
    }
    sqrt(s)
}

/// Cosine similarity `dot / (‖a‖·‖b‖)`; 0 when either norm is 0.
///
/// # Errors
/// [`Error::InvalidInput`] when the lengths differ.
pub fn cosine_similarity(a: &[f64], b: &[f64]) -> Result<f64> {
    same_len(a, b)?;
    let (na, nb) = (l2_norm(a), l2_norm(b));
    if na == 0.0 || nb == 0.0 {
        return Ok(0.0);
    }
    Ok(dot_product(a, b)? / (na * nb))
}

/// Euclidean distance `√(Σ (aᵢ−bᵢ)·(aᵢ−bᵢ))`.
///
/// # Errors
/// [`Error::InvalidInput`] when the lengths differ.
pub fn l2_distance(a: &[f64], b: &[f64]) -> Result<f64> {
    same_len(a, b)?;
    let mut s = 0.0;
    for (x, y) in a.iter().zip(b) {
        let d = x - y;
        s += d * d;
    }
    Ok(sqrt(s))
}

/// Manhattan distance `Σ |aᵢ−bᵢ|`.
///
/// # Errors
/// [`Error::InvalidInput`] when the lengths differ.
pub fn l1_distance(a: &[f64], b: &[f64]) -> Result<f64> {
    same_len(a, b)?;
    let mut s = 0.0;
    for (x, y) in a.iter().zip(b) {
        s += abs(x - y);
    }
    Ok(s)
}

/// `vᵢ / ‖v‖` (all zeros when the norm is 0).
pub fn normalize(v: &[f64]) -> Vec<f64> {
    let n = l2_norm(v);
    if n == 0.0 {
        return v.iter().map(|_| 0.0).collect();
    }
    v.iter().map(|x| x / n).collect()
}

/// Jaccard similarity `|A∩B| / |A∪B|` of the element sets (duplicates ignored); two empty sets
/// give 1.
pub fn jaccard_similarity<T: Ord>(a: &[T], b: &[T]) -> f64 {
    let sa: BTreeSet<&T> = a.iter().collect();
    let sb: BTreeSet<&T> = b.iter().collect();
    let inter = sa.intersection(&sb).count();
    let union = sa.len() + sb.len() - inter;
    if union == 0 {
        1.0
    } else {
        inter as f64 / union as f64
    }
}

/// Pearson correlation: `num / √(sa·sb)` with deviations from the means; 0 when either
/// variance sum is 0.
///
/// # Errors
/// [`Error::InvalidInput`] when the lengths differ.
pub fn pearson(a: &[f64], b: &[f64]) -> Result<f64> {
    same_len(a, b)?;
    let n = a.len() as f64;
    let mut sum_a = 0.0;
    for x in a {
        sum_a += x;
    }
    let mut sum_b = 0.0;
    for x in b {
        sum_b += x;
    }
    let (mean_a, mean_b) = (sum_a / n, sum_b / n);
    let (mut num, mut den_a, mut den_b) = (0.0, 0.0, 0.0);
    for (x, y) in a.iter().zip(b) {
        let da = x - mean_a;
        let db = y - mean_b;
        num += da * db;
        den_a += da * da;
        den_b += db * db;
    }
    if den_a == 0.0 || den_b == 0.0 {
        return Ok(0.0);
    }
    Ok(num / sqrt(den_a * den_b))
}

/// One scored candidate of [`batch_cosine`].
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ScoredIndex {
    /// Index into the candidate list.
    pub index: usize,
    /// Cosine similarity with the query.
    pub score: f64,
}

/// Cosine similarity of `query` against every candidate, sorted by score descending, ties by
/// index ascending.
///
/// # Errors
/// [`Error::InvalidInput`] when a candidate's length differs from the query's.
pub fn batch_cosine(query: &[f64], candidates: &[Vec<f64>]) -> Result<Vec<ScoredIndex>> {
    let mut out = Vec::with_capacity(candidates.len());
    for (index, c) in candidates.iter().enumerate() {
        out.push(ScoredIndex {
            index,
            score: cosine_similarity(query, c)?,
        });
    }
    mergesort_by(&mut out, |a, b| {
        b.score
            .partial_cmp(&a.score)
            .unwrap_or(Ordering::Equal)
            .then(a.index.cmp(&b.index))
    });
    Ok(out)
}

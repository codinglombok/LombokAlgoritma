// LombokAlgoritma — counting sort
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Counting sort for integers in `[0, k]`, O(n + k) time and space.
use crate::{Error, Result};
use alloc::vec;
use alloc::vec::Vec;

/// Sorted copy of `arr`, whose values must lie in `[0, max_val]` (`max_val` defaults to the
/// maximum of `arr`). Inputs with at most one element are returned unchanged (as the reference).
///
/// # Errors
/// [`Error::OutOfRange`] for a value that is negative or above `max_val`.
pub fn counting_sort(arr: &[i64], max_val: Option<i64>) -> Result<Vec<i64>> {
    if arr.len() <= 1 {
        return Ok(arr.to_vec());
    }
    let k = match max_val {
        Some(k) => k,
        None => arr.iter().copied().max().unwrap_or(0),
    };
    if arr.iter().any(|&v| v < 0 || v > k) {
        return Err(Error::OutOfRange);
    }
    let size = usize::try_from(k).map_err(|_| Error::OutOfRange)?;
    let mut count = vec![0usize; size.checked_add(1).ok_or(Error::OutOfRange)?];
    for &v in arr {
        count[v as usize] += 1;
    }
    let mut out = Vec::with_capacity(arr.len());
    for (value, &c) in count.iter().enumerate() {
        out.extend(core::iter::repeat(value as i64).take(c));
    }
    Ok(out)
}

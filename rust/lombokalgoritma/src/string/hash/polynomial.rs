// LombokAlgoritma — polynomial rolling hash (SPEC §11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::{Error, Result};

/// Polynomial hash over Unicode code points by Horner's rule:
/// `h = ((h·base + (cp − 96)) mod m + m) mod m`, always in `[0, m)` (exact 128-bit arithmetic).
/// The reference defaults are `base = 31`, `m = 1 000 000 007`.
///
/// # Errors
/// [`Error::OutOfRange`] when `m < 1`.
pub fn polynomial_hash(s: &str, base: i64, m: i64) -> Result<i64> {
    if m < 1 {
        return Err(Error::OutOfRange);
    }
    let (b, m) = (i128::from(base), i128::from(m));
    let mut h: i128 = 0;
    for ch in s.chars() {
        h = ((h * b + (i128::from(u32::from(ch)) - 96)) % m + m) % m;
    }
    Ok(h as i64)
}

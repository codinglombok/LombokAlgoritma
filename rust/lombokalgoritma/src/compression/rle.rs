// LombokAlgoritma — byte run-length encoding (SPEC §13.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::{Error, Result};
use alloc::vec::Vec;

/// `(count, value)` pairs with `1 ≤ count ≤ 255`; longer runs are split.
pub fn rle_encode(data: &[u8]) -> Vec<u8> {
    let mut out = Vec::new();
    let mut i = 0;
    while i < data.len() {
        let v = data[i];
        let mut run = 1;
        while i + run < data.len() && data[i + run] == v && run < 255 {
            run += 1;
        }
        out.push(run as u8);
        out.push(v);
        i += run;
    }
    out
}

/// Inverse of [`rle_encode`].
///
/// # Errors
/// [`Error::InvalidInput`] for an odd length or a zero count.
pub fn rle_decode(data: &[u8]) -> Result<Vec<u8>> {
    if data.len() % 2 != 0 {
        return Err(Error::InvalidInput);
    }
    let mut out = Vec::new();
    for pair in data.chunks_exact(2) {
        if pair[0] == 0 {
            return Err(Error::InvalidInput);
        }
        out.extend(core::iter::repeat(pair[1]).take(usize::from(pair[0])));
    }
    Ok(out)
}

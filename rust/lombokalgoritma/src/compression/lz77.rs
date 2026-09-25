// LombokAlgoritma — LZ77 (SPEC §13.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::{Error, Result};
use alloc::vec::Vec;

/// Default (and maximum) window size.
pub const LZ77_MAX_WINDOW: usize = 255;

/// LZ77 with tokens `00 literal` or `01 offset length` (`1 ≤ offset ≤ window ≤ 255`,
/// `3 ≤ length ≤ 255`, matches may overlap). Greedy longest match; among equally long matches
/// the earliest start (largest offset) wins.
///
/// # Errors
/// [`Error::OutOfRange`] when `window ∉ [1, 255]`.
pub fn lz77_compress(data: &[u8], window: usize) -> Result<Vec<u8>> {
    if window == 0 || window > LZ77_MAX_WINDOW {
        return Err(Error::OutOfRange);
    }
    let mut out = Vec::new();
    let mut i = 0;
    while i < data.len() {
        let (mut best_len, mut best_off) = (0usize, 0usize);
        for j in i.saturating_sub(window)..i {
            let mut len = 0;
            while i + len < data.len() && data[j + len] == data[i + len] && len < 255 {
                len += 1;
            }
            if len > best_len {
                best_len = len;
                best_off = i - j;
            }
        }
        if best_len >= 3 {
            out.extend_from_slice(&[1, best_off as u8, best_len as u8]);
            i += best_len;
        } else {
            out.extend_from_slice(&[0, data[i]]);
            i += 1;
        }
    }
    Ok(out)
}

/// Inverse of [`lz77_compress`].
///
/// # Errors
/// [`Error::InvalidInput`] for a flag ∉ {0, 1}, a truncated token, or an offset of 0 or beyond
/// the output produced so far.
pub fn lz77_decompress(data: &[u8]) -> Result<Vec<u8>> {
    let mut out: Vec<u8> = Vec::new();
    let mut i = 0;
    while i < data.len() {
        let flag = data[i];
        i += 1;
        match flag {
            0 => {
                let &lit = data.get(i).ok_or(Error::InvalidInput)?;
                out.push(lit);
                i += 1;
            }
            1 => {
                if i + 1 >= data.len() {
                    return Err(Error::InvalidInput);
                }
                let (off, len) = (usize::from(data[i]), usize::from(data[i + 1]));
                i += 2;
                if off == 0 || off > out.len() {
                    return Err(Error::InvalidInput);
                }
                let start = out.len() - off;
                for j in 0..len {
                    out.push(out[start + j]);
                }
            }
            _ => return Err(Error::InvalidInput),
        }
    }
    Ok(out)
}

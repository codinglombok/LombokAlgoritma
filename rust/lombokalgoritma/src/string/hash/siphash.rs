// LombokAlgoritma — SipHash-2-4 (SPEC §12)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! SipHash is a keyed PRF for hash-table DoS resistance; it is **not** a protocol MAC
//! (cryptography lives in `lombokencryptdecrypt`).
use crate::{Error, Result};

fn le64(b: &[u8]) -> u64 {
    let mut w = [0u8; 8];
    w.copy_from_slice(&b[..8]);
    u64::from_le_bytes(w)
}

struct State([u64; 4]);

impl State {
    fn round(&mut self) {
        let v = &mut self.0;
        v[0] = v[0].wrapping_add(v[1]);
        v[1] = v[1].rotate_left(13) ^ v[0];
        v[0] = v[0].rotate_left(32);
        v[2] = v[2].wrapping_add(v[3]);
        v[3] = v[3].rotate_left(16) ^ v[2];
        v[0] = v[0].wrapping_add(v[3]);
        v[3] = v[3].rotate_left(21) ^ v[0];
        v[2] = v[2].wrapping_add(v[1]);
        v[1] = v[1].rotate_left(17) ^ v[2];
        v[2] = v[2].rotate_left(32);
    }

    fn compress(&mut self, m: u64) {
        self.0[3] ^= m;
        self.round();
        self.round();
        self.0[0] ^= m;
    }
}

/// SipHash-2-4 of `data` under a 16-byte `key` (`k0 = key[0..8]`, `k1 = key[8..16]`,
/// little-endian); the 8-byte little-endian output read as a `u64`.
///
/// # Errors
/// [`Error::InvalidInput`] when `key` is not exactly 16 bytes.
pub fn siphash24(key: &[u8], data: &[u8]) -> Result<u64> {
    if key.len() != 16 {
        return Err(Error::InvalidInput);
    }
    let (k0, k1) = (le64(&key[..8]), le64(&key[8..]));
    let mut s = State([
        k0 ^ 0x736f_6d65_7073_6575,
        k1 ^ 0x646f_7261_6e64_6f6d,
        k0 ^ 0x6c79_6765_6e65_7261,
        k1 ^ 0x7465_6462_7974_6573,
    ]);
    let mut chunks = data.chunks_exact(8);
    for c in &mut chunks {
        s.compress(le64(c));
    }
    let mut last = u64::from(data.len() as u8) << 56;
    for (i, &b) in chunks.remainder().iter().enumerate() {
        last |= u64::from(b) << (8 * i);
    }
    s.compress(last);
    s.0[2] ^= 0xff;
    for _ in 0..4 {
        s.round();
    }
    Ok(s.0[0] ^ s.0[1] ^ s.0[2] ^ s.0[3])
}

// LombokAlgoritma — Bloom filter (SPEC §8.1)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::num::{ceil, ln, round_half_up};
use crate::string::{fnv1a32, murmur3_32};
use crate::{Error, Result};
use alloc::vec;
use alloc::vec::Vec;

const LN2: f64 = core::f64::consts::LN_2;

/// Bloom filter with `m` bits and `k` hash functions (Kirsch–Mitzenmacher double hashing):
/// `h1 = FNV-1a-32(item)`, `h2 = MurmurHash3_x86_32(item, 0x9747b28c)`,
/// `pos_i = (h1 + i·h2) mod m`; bit `p` is bit `p mod 8` (LSB first) of byte `⌊p/8⌋`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BloomFilter {
    bits: Vec<u8>,
    k: u32,
    m: u64,
}

impl BloomFilter {
    /// Filter sized for `expected_items` at `false_positive_rate`:
    /// `m = ⌈−n·ln p / ln²2⌉`, `k = max(1, round(m/n · ln 2))`. These use `ln`, so `m`/`k` are
    /// **not** normative across ports — use [`BloomFilter::with_params`] for portable filters.
    ///
    /// # Errors
    /// [`Error::OutOfRange`] unless `expected_items ≥ 1` and `0 < false_positive_rate < 1`
    /// (and the resulting size is addressable).
    pub fn new(expected_items: u64, false_positive_rate: f64) -> Result<Self> {
        if expected_items == 0 || !(false_positive_rate > 0.0 && false_positive_rate < 1.0) {
            return Err(Error::OutOfRange);
        }
        let n = expected_items as f64;
        let m = ceil(-n * ln(false_positive_rate) / (LN2 * LN2));
        let k = round_half_up(m / n * LN2).max(1.0);
        if m >= 18_446_744_073_709_551_616.0 || k > f64::from(u32::MAX) {
            return Err(Error::OutOfRange);
        }
        let m = m as u64;
        let bytes = usize::try_from(m.div_ceil(8)).map_err(|_| Error::OutOfRange)?;
        Ok(BloomFilter {
            bits: vec![0; bytes],
            k: k as u32,
            m,
        })
    }

    /// Filter with exactly `m` bits (`1 ≤ m < 2^32`) and `k` hash functions (`1 ≤ k ≤ 64`).
    ///
    /// # Errors
    /// [`Error::OutOfRange`] for `m` or `k` outside those ranges.
    pub fn with_params(m: u64, k: u32) -> Result<Self> {
        if m == 0 || m >= 1 << 32 || k == 0 || k > 64 {
            return Err(Error::OutOfRange);
        }
        Ok(BloomFilter {
            bits: vec![0; m.div_ceil(8) as usize],
            k,
            m,
        })
    }

    fn positions(&self, item: &[u8]) -> impl Iterator<Item = u64> {
        let h1 = u64::from(fnv1a32(item));
        let h2 = u64::from(murmur3_32(item, 0x9747_b28c));
        let m = self.m;
        // h1 + i·h2 < 2^32·(k + 1): exact in u64 for any realistic k
        (0..u64::from(self.k)).map(move |i| h1.wrapping_add(i.wrapping_mul(h2)) % m)
    }

    /// Insert `item` (hashed as bytes; a `&str` is hashed as UTF-8).
    pub fn add<T: AsRef<[u8]> + ?Sized>(&mut self, item: &T) {
        let pos: Vec<u64> = self.positions(item.as_ref()).collect();
        for p in pos {
            self.bits[(p >> 3) as usize] |= 1 << (p & 7);
        }
    }

    /// `false` ⇒ definitely absent; `true` ⇒ probably present.
    pub fn has<T: AsRef<[u8]> + ?Sized>(&self, item: &T) -> bool {
        self.positions(item.as_ref())
            .all(|p| (self.bits[(p >> 3) as usize] >> (p & 7)) & 1 == 1)
    }

    /// Number of set bits.
    pub fn set_bits(&self) -> u64 {
        self.bits.iter().map(|b| u64::from(b.count_ones())).sum()
    }

    /// Estimated false-positive rate from the fill ratio: `(set_bits / m)^k`.
    pub fn estimated_fpr(&self) -> f64 {
        let ratio = self.set_bits() as f64 / self.m as f64;
        (0..self.k).fold(1.0, |acc, _| acc * ratio)
    }

    /// The bit array (SPEC §8.1 layout, `⌈m/8⌉` bytes).
    pub fn as_bytes(&self) -> &[u8] {
        &self.bits
    }

    /// Copy of the bit array.
    pub fn to_bytes(&self) -> Vec<u8> {
        self.bits.clone()
    }

    /// Number of bits `m`.
    pub fn size(&self) -> u64 {
        self.m
    }

    /// Number of hash functions `k`.
    pub fn hash_count(&self) -> u32 {
        self.k
    }
}

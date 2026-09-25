// LombokAlgoritma — deterministic PRNGs (SPEC §5)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Deterministic, seedable generators: SplitMix64, xoshiro256++ and PCG32 (PCG-XSH-RR 64/32).
//!
//! These are **not** suitable for secrets (use a CSPRNG from the platform).
use crate::{Error, Result};

/// SplitMix64 (Steele, Lea, Flood 2014; `prng.di.unimi.it/splitmix64.c`) — SPEC §5.1.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SplitMix64 {
    state: u64,
}

impl SplitMix64 {
    /// Generator whose initial state is `seed`.
    pub const fn new(seed: u64) -> Self {
        SplitMix64 { state: seed }
    }

    /// Next 64-bit output.
    pub fn next_u64(&mut self) -> u64 {
        self.state = self.state.wrapping_add(0x9e37_79b9_7f4a_7c15);
        let mut z = self.state;
        z = (z ^ (z >> 30)).wrapping_mul(0xbf58_476d_1ce4_e5b9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94d0_49bb_1331_11eb);
        z ^ (z >> 31)
    }
}

/// xoshiro256++ (Blackman & Vigna, `prng.di.unimi.it/xoshiro256plusplus.c`) — SPEC §5.2.
/// State = four successive SplitMix64 outputs of the seed.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Xoshiro256pp {
    s: [u64; 4],
}

impl Xoshiro256pp {
    /// Default seed `0x123456789abcdef0`.
    pub const DEFAULT_SEED: u64 = 0x1234_5678_9abc_def0;

    /// Generator seeded through SplitMix64(`seed`).
    pub fn new(seed: u64) -> Self {
        let mut sm = SplitMix64::new(seed);
        let s = [sm.next_u64(), sm.next_u64(), sm.next_u64(), sm.next_u64()];
        Xoshiro256pp { s }
    }

    /// Next 64-bit output.
    pub fn next_u64(&mut self) -> u64 {
        let s = &mut self.s;
        let result = s[0].wrapping_add(s[3]).rotate_left(23).wrapping_add(s[0]);
        let t = s[1] << 17;
        s[2] ^= s[0];
        s[3] ^= s[1];
        s[1] ^= s[2];
        s[0] ^= s[3];
        s[2] ^= t;
        s[3] = s[3].rotate_left(45);
        result
    }

    /// Uniform float in `[0, 1)`: `(next ≫ 11) / 2^53` (exact).
    pub fn next_float(&mut self) -> f64 {
        (self.next_u64() >> 11) as f64 / 9_007_199_254_740_992.0
    }

    /// Unbiased integer in `[0, n)` by rejection sampling, `1 ≤ n ≤ 2^53 − 1`.
    ///
    /// # Errors
    /// [`Error::OutOfRange`] when `n` is outside `[1, 2^53 − 1]`.
    pub fn next_int(&mut self, n: u64) -> Result<u64> {
        if n == 0 || n > (1u64 << 53) - 1 {
            return Err(Error::OutOfRange);
        }
        // 2^64 mod n, computed without 128-bit arithmetic
        let threshold = n.wrapping_neg() % n;
        loop {
            let r = self.next_u64();
            if r >= threshold {
                return Ok(r % n);
            }
        }
    }
}

impl Default for Xoshiro256pp {
    fn default() -> Self {
        Xoshiro256pp::new(Self::DEFAULT_SEED)
    }
}

/// PCG32 — PCG-XSH-RR 64/32 as in pcg-c `pcg32_srandom_r(initstate, initseq)` — SPEC §5.3.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Pcg32 {
    state: u64,
    inc: u64,
}

impl Pcg32 {
    /// Default `initstate`.
    pub const DEFAULT_STATE: u64 = 0x853c_49e6_748f_ea9b;
    /// Default `initseq`.
    pub const DEFAULT_SEQ: u64 = 0xda3e_39cb_94b9_5bdb;
    const MULT: u64 = 6_364_136_223_846_793_005;

    /// Generator initialised like `pcg32_srandom_r(initstate, initseq)`.
    pub fn new(init_state: u64, init_seq: u64) -> Self {
        let mut g = Pcg32 {
            state: 0,
            inc: (init_seq << 1) | 1,
        };
        g.step();
        g.state = g.state.wrapping_add(init_state);
        g.step();
        g
    }

    fn step(&mut self) {
        self.state = self.state.wrapping_mul(Self::MULT).wrapping_add(self.inc);
    }

    /// Next 32-bit output.
    pub fn next_u32(&mut self) -> u32 {
        let old = self.state;
        self.step();
        let xorshifted = (((old >> 18) ^ old) >> 27) as u32;
        let rot = (old >> 59) as u32;
        xorshifted.rotate_right(rot)
    }

    /// Unbiased integer in `[0, bound)` (`pcg32_boundedrand_r`), `1 ≤ bound ≤ 2^32 − 1`.
    ///
    /// # Errors
    /// [`Error::OutOfRange`] when `bound == 0`.
    pub fn next_bounded(&mut self, bound: u32) -> Result<u32> {
        if bound == 0 {
            return Err(Error::OutOfRange);
        }
        let threshold = bound.wrapping_neg() % bound;
        loop {
            let r = self.next_u32();
            if r >= threshold {
                return Ok(r % bound);
            }
        }
    }

    /// Uniform float in `[0, 1)`: `next / 2^32` (exact).
    pub fn next_float(&mut self) -> f64 {
        f64::from(self.next_u32()) / 4_294_967_296.0
    }
}

impl Default for Pcg32 {
    fn default() -> Self {
        Pcg32::new(Self::DEFAULT_STATE, Self::DEFAULT_SEQ)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use alloc::vec::Vec;

    #[test]
    fn splitmix_reference() {
        let mut r = SplitMix64::new(0);
        assert_eq!(r.next_u64(), 0xe220_a839_7b1d_cdaf);
        assert_eq!(r.next_u64(), 0x6e78_9e6a_a1b9_65f4);
    }

    #[test]
    fn xoshiro_reference() {
        let mut r = Xoshiro256pp::new(0);
        assert_eq!(r.next_u64(), 0x5317_5d61_490b_23df);
        assert_eq!(r.next_u64(), 0x61da_6f3d_c380_d507);
        let mut d = Xoshiro256pp::default();
        let mut e = Xoshiro256pp::new(Xoshiro256pp::DEFAULT_SEED);
        assert_eq!(d.next_u64(), e.next_u64());
        let f = Xoshiro256pp::new(0).next_float();
        assert!((0.0..1.0).contains(&f));
        assert_eq!(r.next_int(0), Err(Error::OutOfRange));
        assert_eq!(r.next_int(1 << 53), Err(Error::OutOfRange));
        assert_eq!(r.next_int(1), Ok(0));
        assert!(r.next_int((1 << 53) - 1).unwrap() < (1 << 53) - 1);
    }

    #[test]
    fn pcg_reference() {
        // pcg-c demo: pcg32_srandom_r(&rng, 42u, 54u)
        let mut r = Pcg32::new(42, 54);
        let got: Vec<u32> = (0..6).map(|_| r.next_u32()).collect();
        assert_eq!(
            got,
            [
                0xa15c_02b7,
                0x7b47_f409,
                0xba1d_3330,
                0x83d2_f293,
                0xbfa4_784b,
                0xcbed_606e
            ]
        );
        assert_eq!(r.next_bounded(0), Err(Error::OutOfRange));
        for b in [1u32, 2, 7, u32::MAX] {
            assert!(r.next_bounded(b).unwrap() < b);
        }
        let f = Pcg32::default().next_float();
        assert!((0.0..1.0).contains(&f));
    }
}

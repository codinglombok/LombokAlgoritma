// LombokAlgoritma — HyperLogLog (SPEC §8.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::num::{ln, round_half_up};
use crate::string::{fmix32, fnv1a32};
use crate::{Error, Result};
use alloc::vec;
use alloc::vec::Vec;

/// HyperLogLog cardinality estimator with `2^b` one-byte registers.
///
/// `add`: `h = fmix32(FNV-1a-32(item))`, register `j = h ≫ (32 − b)`, `w = (h ≪ b) mod 2^32`,
/// `ρ = w = 0 ? 32 − b + 1 : clz(w) + 1`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HyperLogLog {
    registers: Vec<u8>,
    b: u32,
}

impl Default for HyperLogLog {
    /// Precision `b = 14` (≈ 0.8 % standard error).
    fn default() -> Self {
        HyperLogLog::new(14)
    }
}

impl HyperLogLog {
    /// Estimator with precision `b`, clamped to `[4, 16]`.
    pub fn new(b: u32) -> Self {
        let b = b.clamp(4, 16);
        HyperLogLog {
            registers: vec![0; 1 << b],
            b,
        }
    }

    /// Precision `b` (after clamping).
    pub fn precision(&self) -> u32 {
        self.b
    }

    /// Add `item` (hashed as bytes; a `&str` is hashed as UTF-8).
    pub fn add<T: AsRef<[u8]> + ?Sized>(&mut self, item: &T) {
        let h = fmix32(fnv1a32(item.as_ref()));
        let j = (h >> (32 - self.b)) as usize;
        let w = h << self.b;
        let rho = if w == 0 {
            32 - self.b + 1
        } else {
            w.leading_zeros() + 1
        } as u8;
        if rho > self.registers[j] {
            self.registers[j] = rho;
        }
    }

    /// Estimated cardinality, rounded to an integer (`Math.round`, halves up).
    ///
    /// `E = ((α·m)·m)/Z`, `Z = Σ 2^(−reg[i])`; linear counting `m·ln(m/V)` when `E ≤ 2.5·m` and
    /// `V > 0` registers are zero; large-range correction `−2^32·ln(1 − E/2^32)` when
    /// `E > 2^32/30`. Returned as `f64` because that correction is undefined (NaN) for `E ≥ 2^32`.
    pub fn count(&self) -> f64 {
        let m = self.registers.len() as f64;
        let alpha = match self.registers.len() {
            16 => 0.673,
            32 => 0.697,
            64 => 0.709,
            _ => 0.7213 / (1.0 + 1.079 / m),
        };
        let mut sum = 0.0;
        let mut zeros = 0u32;
        for &r in &self.registers {
            sum += 1.0 / (1u64 << r) as f64;
            if r == 0 {
                zeros += 1;
            }
        }
        let mut e = alpha * m * m / sum;
        if e <= 2.5 * m {
            if zeros > 0 {
                e = m * ln(m / f64::from(zeros));
            }
        } else if e > 4_294_967_296.0 / 30.0 {
            e = -4_294_967_296.0 * ln(1.0 - e / 4_294_967_296.0);
        }
        round_half_up(e)
    }

    /// The `2^b` registers (index order) — SPEC §8.2.
    pub fn registers(&self) -> &[u8] {
        &self.registers
    }

    /// Copy of the registers.
    pub fn registers_bytes(&self) -> Vec<u8> {
        self.registers.clone()
    }

    /// Union estimator: register-wise maximum.
    ///
    /// # Errors
    /// [`Error::InvalidInput`] when the precisions differ.
    pub fn merge(&self, other: &HyperLogLog) -> Result<HyperLogLog> {
        if self.b != other.b {
            return Err(Error::InvalidInput);
        }
        let registers = self
            .registers
            .iter()
            .zip(&other.registers)
            .map(|(&a, &b)| a.max(b))
            .collect();
        Ok(HyperLogLog {
            registers,
            b: self.b,
        })
    }
}

#[cfg(test)]
impl HyperLogLog {
    pub(crate) fn registers_mut(&mut self) -> &mut [u8] {
        &mut self.registers
    }
}

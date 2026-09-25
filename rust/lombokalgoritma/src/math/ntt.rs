// LombokAlgoritma — number-theoretic transform (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::modular::mod_pow_u64;
use crate::{Error, Result};
use alloc::vec::Vec;

/// Default NTT prime `998244353 = 119·2^23 + 1`.
pub const NTT_MOD: u64 = 998_244_353;
/// Primitive root of [`NTT_MOD`].
pub const NTT_ROOT: u64 = 3;

/// Forward NTT modulo [`NTT_MOD`] with root [`NTT_ROOT`]:
/// `A_k = Σ_j a_j·ω^(jk) mod p`, `ω = g^((p−1)/n)`, natural order.
///
/// # Errors
/// [`Error::InvalidInput`] unless the length is a power of two dividing `p − 1`.
pub fn ntt(a: &[u64]) -> Result<Vec<u64>> {
    ntt_with(a, NTT_MOD, NTT_ROOT)
}

/// Forward NTT with a custom prime `modulus` and primitive root `g` (iterative Cooley–Tukey).
///
/// # Errors
/// [`Error::OutOfRange`] when `modulus < 2`; [`Error::InvalidInput`] unless the length is a
/// power of two dividing `modulus − 1`.
pub fn ntt_with(a: &[u64], modulus: u64, g: u64) -> Result<Vec<u64>> {
    if modulus < 2 {
        return Err(Error::OutOfRange);
    }
    let n = a.len();
    if n == 0 || !n.is_power_of_two() {
        return Err(Error::InvalidInput);
    }
    if (modulus - 1) % n as u64 != 0 {
        return Err(Error::InvalidInput);
    }
    let m = u128::from(modulus);
    let mut r: Vec<u128> = a.iter().map(|&x| u128::from(x)).collect();
    // bit-reversal permutation
    let mut j = 0usize;
    for i in 1..n {
        let mut bit = n >> 1;
        while j & bit != 0 {
            j ^= bit;
            bit >>= 1;
        }
        j ^= bit;
        if i < j {
            r.swap(i, j);
        }
    }
    let mut len = 2;
    while len <= n {
        let w = u128::from(mod_pow_u64(g, (modulus - 1) / len as u64, modulus));
        let half = len / 2;
        let mut i = 0;
        while i < n {
            let mut wn = 1u128;
            for k in 0..half {
                let u = r[i + k];
                let v = r[i + k + half] * wn % m;
                r[i + k] = (u + v) % m;
                r[i + k + half] = (u + m - v) % m;
                wn = wn * w % m;
            }
            i += len;
        }
        len <<= 1;
    }
    Ok(r.into_iter().map(|x| x as u64).collect())
}

/// Inverse NTT modulo [`NTT_MOD`].
///
/// # Errors
/// As [`ntt`].
pub fn intt(a: &[u64]) -> Result<Vec<u64>> {
    intt_with(a, NTT_MOD, NTT_ROOT)
}

/// Inverse NTT with a custom prime `modulus` and primitive root `g`.
///
/// # Errors
/// As [`ntt_with`].
pub fn intt_with(a: &[u64], modulus: u64, g: u64) -> Result<Vec<u64>> {
    let inv_g = mod_pow_u64(g, modulus.saturating_sub(2), modulus);
    let r = ntt_with(a, modulus, inv_g)?;
    let n_inv = u128::from(mod_pow_u64(a.len() as u64, modulus - 2, modulus));
    let m = u128::from(modulus);
    Ok(r.into_iter()
        .map(|x| (u128::from(x) * n_inv % m) as u64)
        .collect())
}

/// Coefficients of the product polynomial `a · b` modulo [`NTT_MOD`], length `|a| + |b| − 1`
/// (empty when both inputs are empty).
///
/// # Errors
/// [`Error::InvalidInput`] when the padded length exceeds 2^23 (does not divide `p − 1`).
pub fn poly_mul_ntt(a: &[u64], b: &[u64]) -> Result<Vec<u64>> {
    let total = a.len() + b.len();
    let mut n = 1usize;
    while n < total {
        n <<= 1;
    }
    let mut fa = a.to_vec();
    fa.resize(n, 0);
    let mut fb = b.to_vec();
    fb.resize(n, 0);
    let ta = ntt(&fa)?;
    let tb = ntt(&fb)?;
    let m = u128::from(NTT_MOD);
    let tc: Vec<u64> = ta
        .iter()
        .zip(&tb)
        .map(|(&x, &y)| (u128::from(x) * u128::from(y) % m) as u64)
        .collect();
    let mut c = intt(&tc)?;
    c.truncate(total.saturating_sub(1));
    Ok(c)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn transforms() {
        assert_eq!(
            ntt(&[1, 2, 3, 4]),
            Ok(alloc::vec![10, 173_167_434, 998_244_351, 825_076_915])
        );
        assert_eq!(ntt(&[1, 2, 3]), Err(Error::InvalidInput));
        assert_eq!(ntt(&[]), Err(Error::InvalidInput));
        assert_eq!(ntt(&[7]), Ok(alloc::vec![7]));
        assert_eq!(ntt_with(&[1, 2], 1, 1), Err(Error::OutOfRange));
        assert_eq!(ntt_with(&[1, 2, 3, 4], 7, 3), Err(Error::InvalidInput));
        let a = [5u64, 0, 998_244_352, 17, 3, 3, 1, 0];
        assert_eq!(intt(&ntt(&a).unwrap()).unwrap(), a);
        assert_eq!(
            poly_mul_ntt(&[1, 2, 3], &[4, 5]),
            Ok(alloc::vec![4, 13, 22, 15])
        );
        assert_eq!(poly_mul_ntt(&[], &[]), Ok(alloc::vec![]));
        assert_eq!(poly_mul_ntt(&[], &[1, 2]), Ok(alloc::vec![0]));
        assert_eq!(
            poly_mul_ntt(&[998_244_352], &[998_244_352]),
            Ok(alloc::vec![1])
        );
    }
}

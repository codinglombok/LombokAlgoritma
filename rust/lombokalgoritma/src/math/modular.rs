// LombokAlgoritma — modular exponentiation and CRT (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::gcd::egcd;
use crate::{Error, Result};

/// `base^exp mod m` in `[0, m)` by square-and-multiply with 128-bit intermediates; a negative
/// base is first reduced into `[0, m)`; `m = 1 → 0`.
///
/// # Errors
/// [`Error::OutOfRange`] when `m < 1` or `exp < 0`.
pub fn mod_pow(base: i64, exp: i64, m: i64) -> Result<i64> {
    if m < 1 || exp < 0 {
        return Err(Error::OutOfRange);
    }
    let b = base.rem_euclid(m) as u64;
    Ok(mod_pow_u64(b, exp as u64, m as u64) as i64)
}

/// `base^exp mod m` for unsigned operands (`m ≥ 1`; `m = 1 → 0`), exact for every `u64` modulus.
pub fn mod_pow_u64(base: u64, mut exp: u64, m: u64) -> u64 {
    if m <= 1 {
        return 0;
    }
    let m = u128::from(m);
    let mut b = u128::from(base) % m;
    let mut result = 1u128;
    while exp > 0 {
        if exp & 1 == 1 {
            result = result * b % m;
        }
        exp >>= 1;
        b = b * b % m;
    }
    result as u64
}

/// `(a + b) mod m` for `a, b < m` without overflow.
fn add_mod(a: u128, b: u128, m: u128) -> u128 {
    if a >= m - b {
        a - (m - b)
    } else {
        a + b
    }
}

/// `(a · b) mod m` for any `u128` operands (double-and-add).
fn mul_mod_u128(a: u128, mut b: u128, m: u128) -> u128 {
    let mut a = a % m;
    let mut r = 0u128;
    while b > 0 {
        if b & 1 == 1 {
            r = add_mod(r, a, m);
        }
        a = add_mod(a, a, m);
        b >>= 1;
    }
    r
}

/// Chinese Remainder Theorem: the unique `x ∈ [0, M)`, `M = Π mᵢ`, with `x ≡ rᵢ (mod mᵢ)`.
/// Uses the Bézout coefficient `x` of `egcd(Mᵢ mod mᵢ, mᵢ)` as the inverse of `Mᵢ = M / mᵢ`.
///
/// # Errors
/// [`Error::InvalidInput`] for slices of different length; [`Error::OutOfRange`] for a modulus
/// `< 1`; [`Error::Overflow`] when `M ≥ 2^127`; [`Error::NotCoprime`] when the moduli are not
/// pairwise coprime.
pub fn crt(remainders: &[i64], moduli: &[i64]) -> Result<u128> {
    if remainders.len() != moduli.len() {
        return Err(Error::InvalidInput);
    }
    if moduli.iter().any(|&m| m < 1) {
        return Err(Error::OutOfRange);
    }
    let mut big_m: i128 = 1;
    for &m in moduli {
        big_m = big_m.checked_mul(i128::from(m)).ok_or(Error::Overflow)?;
    }
    let big_m = big_m as u128;
    let mut x = 0u128;
    for (&r, &m) in remainders.iter().zip(moduli) {
        let mi = u128::from(m as u64);
        let big_mi = big_m / mi;
        let (g, inv, _) = egcd((big_mi % mi) as i128, mi as i128);
        if g != 1 && g != -1 {
            return Err(Error::NotCoprime);
        }
        let inv_mi = inv.rem_euclid(mi as i128) as u128;
        let ri = i128::from(r).rem_euclid(mi as i128) as u128;
        // ri < mi, so ri · Mi < M (no overflow)
        let term = mul_mod_u128(ri * big_mi % big_m, inv_mi, big_m);
        x = add_mod(x, term, big_m);
    }
    Ok(x % big_m)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn small() {
        assert_eq!(mod_pow(2, 10, 1000), Ok(24));
        assert_eq!(mod_pow(7, 0, 13), Ok(1));
        assert_eq!(mod_pow(5, 3, 1), Ok(0));
        assert_eq!(mod_pow(-2, 3, 5), Ok(2));
        assert_eq!(mod_pow(2, -1, 5), Err(Error::OutOfRange));
        assert_eq!(mod_pow(2, 1, 0), Err(Error::OutOfRange));
        assert_eq!(mod_pow_u64(3, 4, 0), 0);
    }
    #[test]
    fn large_modulus_no_overflow() {
        let p = (1u64 << 61) - 1;
        assert_eq!(mod_pow_u64(123_456_789, p - 1, p), 1);
        assert_eq!(mod_pow_u64(2, 64, u64::MAX - 58), 59);
        assert_eq!(
            mod_pow(123_456_789_123, 987_654_321, 9_223_372_036_854_775_783),
            Ok(3_224_504_524_924_993_594)
        );
    }
    #[test]
    fn chinese_remainder() {
        assert_eq!(crt(&[2, 3, 2], &[3, 5, 7]), Ok(23));
        assert_eq!(crt(&[1, 2, 3, 4], &[5, 7, 9, 11]), Ok(1731));
        assert_eq!(crt(&[-1], &[7]), Ok(6));
        assert_eq!(crt(&[], &[]), Ok(0));
        assert_eq!(crt(&[1, 1], &[4, 6]), Err(Error::NotCoprime));
        assert_eq!(crt(&[1], &[4, 6]), Err(Error::InvalidInput));
        assert_eq!(crt(&[1], &[0]), Err(Error::OutOfRange));
        let big = [i64::MAX, i64::MAX - 1, 5];
        assert_eq!(crt(&[1, 1, 1], &big), Err(Error::Overflow));
        // large moduli: M ≈ 2^125, exercises the 128-bit mul-mod path
        let m = [(1i64 << 62) - 57, (1i64 << 61) - 1, 7];
        let x = crt(&[5, 9, 3], &m).unwrap();
        for (r, mi) in [5u128, 9, 3].iter().zip(m) {
            assert_eq!(x % mi as u128, *r);
        }
    }
}

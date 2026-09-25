// LombokAlgoritma — gcd, lcm, extended gcd, modular inverse (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::{Error, Result};

/// Greatest common divisor of `|a|` and `|b|`; `gcd(0, 0) = 0`.
pub fn gcd(a: i64, b: i64) -> u64 {
    gcd_u64(a.unsigned_abs(), b.unsigned_abs())
}

/// Greatest common divisor of unsigned values (Euclid).
pub fn gcd_u64(mut a: u64, mut b: u64) -> u64 {
    while b != 0 {
        let t = b;
        b = a % b;
        a = t;
    }
    a
}

/// Least common multiple `|a / gcd(a, b) · b|` (exact, up to 2^126); 0 when either is 0.
pub fn lcm(a: i64, b: i64) -> u128 {
    if a == 0 || b == 0 {
        return 0;
    }
    let (ua, ub) = (a.unsigned_abs(), b.unsigned_abs());
    u128::from(ua / gcd_u64(ua, ub)) * u128::from(ub)
}

/// Bézout triple of [`extended_gcd`]: `a·x + b·y = g`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ExtendedGcd {
    /// `gcd` with the sign produced by the recursion (`extended_gcd(a, 0).g = a`).
    pub g: i128,
    /// Coefficient of `a`.
    pub x: i128,
    /// Coefficient of `b`.
    pub y: i128,
}

/// Extended Euclid, recursive with **truncated** division (SPEC §10): `b = 0 → (a, 1, 0)`, else
/// `(g, x₁, y₁) = egcd(b, a rem b)` and the result is `(g, y₁, x₁ − (a quo b)·y₁)`.
pub fn extended_gcd(a: i64, b: i64) -> ExtendedGcd {
    let (g, x, y) = egcd(i128::from(a), i128::from(b));
    ExtendedGcd { g, x, y }
}

pub(crate) fn egcd(a: i128, b: i128) -> (i128, i128, i128) {
    if b == 0 {
        return (a, 1, 0);
    }
    let (g, x1, y1) = egcd(b, a % b);
    (g, y1, x1 - (a / b) * y1)
}

/// Inverse of `a` modulo `m`, in `[0, m)`.
///
/// # Errors
/// [`Error::OutOfRange`] when `m < 1`; [`Error::NoInverse`] when `gcd(a, m) ≠ 1`.
pub fn mod_inverse(a: i64, m: i64) -> Result<i64> {
    if m < 1 {
        return Err(Error::OutOfRange);
    }
    let m = i128::from(m);
    let (g, x, _) = egcd(i128::from(a).rem_euclid(m), m);
    if g != 1 {
        return Err(Error::NoInverse);
    }
    Ok(x.rem_euclid(m) as i64)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn basics() {
        assert_eq!(gcd(12, 8), 4);
        assert_eq!(gcd(0, 5), 5);
        assert_eq!(gcd(-12, 18), 6);
        assert_eq!(gcd(0, 0), 0);
        assert_eq!(gcd(i64::MIN, 0), 1u64 << 63);
        assert_eq!(lcm(4, 6), 12);
        assert_eq!(lcm(-4, 6), 12);
        assert_eq!(lcm(0, 6), 0);
        assert_eq!(
            lcm(i64::MAX, i64::MAX - 1),
            (i64::MAX as u128) * (i64::MAX as u128 - 1)
        );
        assert_eq!(mod_inverse(3, 11), Ok(4));
        assert_eq!(mod_inverse(-3, 11), Ok(7));
        assert_eq!(mod_inverse(5, 1), Ok(0));
        assert_eq!(mod_inverse(2, 4), Err(Error::NoInverse));
        assert_eq!(mod_inverse(2, 0), Err(Error::OutOfRange));
    }

    #[test]
    fn extended() {
        assert_eq!(extended_gcd(0, 0), ExtendedGcd { g: 0, x: 1, y: 0 });
        assert_eq!(extended_gcd(12, 18), ExtendedGcd { g: 6, x: -1, y: 1 });
        assert_eq!(extended_gcd(-12, 18), ExtendedGcd { g: 6, x: 1, y: 1 });
        assert_eq!(extended_gcd(17, 5), ExtendedGcd { g: 1, x: -2, y: 7 });
        let r = extended_gcd(i64::MAX, 6_700_417);
        assert_eq!((r.g, r.x, r.y), (1, -2, 2_753_074_036_095));
        let r = extended_gcd(i64::MIN, -1);
        assert_eq!(r.g, -1);
        assert_eq!(i128::from(i64::MIN) * r.x - r.y, r.g);
    }
}

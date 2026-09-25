// LombokAlgoritma — Miller–Rabin primality and next prime (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::modular::mod_pow_u64;
use crate::{Error, Result};

const WITNESSES: [u64; 12] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

/// Deterministic Miller–Rabin with the first 12 primes as witnesses (exact for all `u64`).
pub fn is_prime(n: u64) -> bool {
    if n < 2 {
        return false;
    }
    if n == 2 || n == 3 || n == 5 || n == 7 {
        return true;
    }
    if n % 2 == 0 || n % 3 == 0 {
        return false;
    }
    let mut d = n - 1;
    let mut r = 0u32;
    while d % 2 == 0 {
        d /= 2;
        r += 1;
    }
    let nm1 = n - 1;
    'witness: for a in WITNESSES {
        if a >= n {
            continue;
        }
        let mut x = mod_pow_u64(a, d, n);
        if x == 1 || x == nm1 {
            continue;
        }
        for _ in 1..r {
            x = (u128::from(x) * u128::from(x) % u128::from(n)) as u64;
            if x == nm1 {
                continue 'witness;
            }
        }
        return false;
    }
    true
}

/// Smallest prime `≥ n` (`n ≤ 2 → 2`).
///
/// # Errors
/// [`Error::Overflow`] when that prime does not fit in `u64` (`n > 2^64 − 59`).
pub fn next_prime(n: u64) -> Result<u64> {
    if n <= 2 {
        return Ok(2);
    }
    let mut c = if n % 2 == 0 {
        n.checked_add(1).ok_or(Error::Overflow)?
    } else {
        n
    };
    while !is_prime(c) {
        c = c.checked_add(2).ok_or(Error::Overflow)?;
    }
    Ok(c)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn primes() {
        let small: alloc::vec::Vec<u64> = (0..60).filter(|&n| is_prime(n)).collect();
        assert_eq!(
            small,
            [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]
        );
        assert!(!is_prime(561));
        assert!(!is_prime(3_215_031_751));
        assert!(!is_prime(4_759_123_141));
        assert!(is_prime(9_223_372_036_854_775_783));
        assert!(!is_prime(9_223_372_036_854_775_807));
        assert!(is_prime(u64::MAX - 58));
        assert!(is_prime(41));
        assert_eq!(next_prime(0), Ok(2));
        assert_eq!(next_prime(14), Ok(17));
        assert_eq!(next_prime(17), Ok(17));
        assert_eq!(next_prime(1_000_000_000), Ok(1_000_000_007));
        assert_eq!(next_prime(u64::MAX - 58), Ok(u64::MAX - 58));
        assert_eq!(next_prime(u64::MAX - 57), Err(Error::Overflow));
        assert_eq!(next_prime(u64::MAX - 1), Err(Error::Overflow));
    }
}

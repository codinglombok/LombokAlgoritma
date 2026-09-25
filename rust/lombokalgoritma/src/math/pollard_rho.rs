// LombokAlgoritma — Pollard's rho and prime factorisation (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::gcd::gcd_u64;
use super::prime::is_prime;
use crate::{Error, Result};
use alloc::vec;
use alloc::vec::Vec;

fn step(x: u64, c: u64, n: u64) -> u64 {
    ((u128::from(x) * u128::from(x) + u128::from(c)) % u128::from(n)) as u64
}

/// A non-trivial factor of the composite `n` by Pollard's rho with Floyd cycle detection
/// (`x₀ = 2`, `c = 1, 2, 3, …` until a proper factor appears — deterministic in every port).
///
/// # Errors
/// [`Error::InvalidInput`] when `n < 4` or `n` is prime (no non-trivial factor exists).
pub fn pollard_rho(n: u64) -> Result<u64> {
    if n < 4 || is_prime(n) {
        return Err(Error::InvalidInput);
    }
    if n % 2 == 0 {
        return Ok(2);
    }
    let mut c = 1u64;
    loop {
        let (mut x, mut y, mut d) = (2u64, 2u64, 1u64);
        while d == 1 {
            x = step(x, c, n);
            y = step(step(y, c, n), c, n);
            d = gcd_u64(x.abs_diff(y), n);
        }
        if d != n {
            return Ok(d);
        }
        c += 1;
    }
}

const SMALL_PRIMES: [u64; 12] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

/// Prime factors of `|n|` in ascending order, with multiplicity (`|n| ≤ 1 → []`).
pub fn factorize(n: i64) -> Vec<u64> {
    factorize_u64(n.unsigned_abs())
}

/// Prime factors of `n` in ascending order, with multiplicity (`n ≤ 1 → []`).
pub fn factorize_u64(mut n: u64) -> Vec<u64> {
    let mut out = Vec::new();
    if n == 0 {
        return out;
    }
    for p in SMALL_PRIMES {
        while n % p == 0 {
            out.push(p);
            n /= p;
        }
    }
    let mut stack = if n > 1 { vec![n] } else { Vec::new() };
    while let Some(m) = stack.pop() {
        if is_prime(m) {
            out.push(m);
            continue;
        }
        // m is composite with no factor ≤ 37, so m ≥ 41² and pollard_rho cannot fail
        let d = pollard_rho(m).unwrap_or(m);
        stack.push(d);
        stack.push(m / d);
    }
    out.sort_unstable();
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn factors() {
        assert!(factorize(0).is_empty());
        assert!(factorize(1).is_empty());
        assert!(factorize(-1).is_empty());
        assert_eq!(factorize(-12), [2, 2, 3]);
        assert_eq!(factorize(600_851_475_143), [71, 839, 1471, 6857]);
        assert_eq!(factorize(i64::MAX), [7, 7, 73, 127, 337, 92737, 649_657]);
        assert_eq!(
            factorize(1_000_000_016_000_000_063),
            [1_000_000_007, 1_000_000_009]
        );
        assert_eq!(factorize(41 * 41 * 43), [41, 41, 43]);
        assert_eq!(factorize(i64::MIN), [2; 63]);
        assert_eq!(
            factorize_u64(u64::MAX),
            [3, 5, 17, 257, 641, 65537, 6_700_417]
        );
        assert_eq!(pollard_rho(3), Err(Error::InvalidInput));
        assert_eq!(pollard_rho(97), Err(Error::InvalidInput));
        assert_eq!(pollard_rho(10), Ok(2));
        let d = pollard_rho(1681).unwrap();
        assert_eq!(d, 41);
    }
}

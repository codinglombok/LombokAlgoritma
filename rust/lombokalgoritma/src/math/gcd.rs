//! GCD, LCM and modular inverse.

/// Greatest common divisor (Euclid).
pub fn gcd(mut a: u64, mut b: u64) -> u64 {
    while b != 0 {
        let t = b;
        b = a % b;
        a = t;
    }
    a
}

/// Least common multiple; `lcm(0, x) = 0`. Returns `None` on overflow.
pub fn lcm(a: u64, b: u64) -> Option<u64> {
    if a == 0 || b == 0 {
        return Some(0);
    }
    (a / gcd(a, b)).checked_mul(b)
}

/// Inverse of `a` modulo `m` (m ≥ 1), or `None` if gcd(a, m) ≠ 1.
pub fn mod_inverse(a: i64, m: i64) -> Option<i64> {
    if m <= 0 {
        return None;
    }
    let m128 = i128::from(m);
    let (mut old_r, mut r) = (i128::from(a).rem_euclid(m128), m128);
    let (mut old_s, mut s) = (1i128, 0i128);
    while r != 0 {
        let q = old_r / r;
        (old_r, r) = (r, old_r - q * r);
        (old_s, s) = (s, old_s - q * s);
    }
    if old_r != 1 {
        return None;
    }
    i64::try_from(old_s.rem_euclid(m128)).ok()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn basics() {
        assert_eq!(gcd(12, 8), 4);
        assert_eq!(gcd(0, 5), 5);
        assert_eq!(lcm(4, 6), Some(12));
        assert_eq!(lcm(u64::MAX, u64::MAX - 1), None);
        assert_eq!(mod_inverse(3, 11), Some(4));
        assert_eq!(mod_inverse(-3, 11), Some(7));
        assert_eq!(mod_inverse(2, 4), None);
    }
}

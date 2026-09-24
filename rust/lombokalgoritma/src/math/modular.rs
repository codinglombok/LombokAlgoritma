//! Modular arithmetic.

/// `base^exp mod m` in O(log exp). Uses 128-bit intermediates, so it is exact for every
/// `u64` modulus (v0.1.0 used `wrapping_mul` on `u64`, which overflowed for m > 2^32).
pub fn mod_pow(base: u64, mut exp: u64, m: u64) -> u64 {
    if m == 1 {
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

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn small() {
        assert_eq!(mod_pow(2, 10, 1000), 24);
        assert_eq!(mod_pow(7, 0, 13), 1);
        assert_eq!(mod_pow(5, 3, 1), 0);
    }
    #[test]
    fn large_modulus_no_overflow() {
        // Fermat: a^(p-1) ≡ 1 (mod p) for the prime p = 2^61 − 1
        let p = (1u64 << 61) - 1;
        assert_eq!(mod_pow(123_456_789, p - 1, p), 1);
        // 2^64 mod (2^64 − 59) = 59
        assert_eq!(mod_pow(2, 64, u64::MAX - 58), 59);
    }
}

//! Branch-free bit helpers.

/// Returns `a` if `cond == 1`, `b` if `cond == 0`, without branching.
#[inline]
pub fn ct_select_u32(cond: u32, a: u32, b: u32) -> u32 {
    let mask = cond.wrapping_neg();
    (mask & a) | (!mask & b)
}

/// Returns 1 if `a == b` (same length and bytes), else 0. Constant-time in the contents.
#[inline]
pub fn ct_eq_bytes(a: &[u8], b: &[u8]) -> u8 {
    if a.len() != b.len() {
        return 0;
    }
    let mut diff: u8 = 0;
    for (x, y) in a.iter().zip(b.iter()) {
        diff |= x ^ y;
    }
    1u8.wrapping_sub((diff | diff.wrapping_neg()) >> 7)
}

/// Rotate right (32-bit).
#[inline]
pub fn rotr32(x: u32, k: u32) -> u32 {
    x.rotate_right(k)
}

/// Rotate left (32-bit).
#[inline]
pub fn rotl32(x: u32, k: u32) -> u32 {
    x.rotate_left(k)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn select_and_eq() {
        assert_eq!(ct_select_u32(1, 7, 9), 7);
        assert_eq!(ct_select_u32(0, 7, 9), 9);
        assert_eq!(ct_eq_bytes(b"abc", b"abc"), 1);
        assert_eq!(ct_eq_bytes(b"abc", b"abd"), 0);
        assert_eq!(ct_eq_bytes(b"ab", b"abc"), 0);
        assert_eq!(rotl32(rotr32(0x1234_5678, 5), 5), 0x1234_5678);
    }
}

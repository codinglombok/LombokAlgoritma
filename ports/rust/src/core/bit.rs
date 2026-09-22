#[inline(always)]
pub fn ct_select_u32(cond: u32, a: u32, b: u32) -> u32 {
    let mask = (cond as i32).wrapping_neg() as u32;
    (mask & a) | (!mask & b)
}
#[inline(always)]
pub fn ct_eq_bytes(a: &[u8], b: &[u8]) -> u8 {
    if a.len() != b.len() { return 0; }
    let mut diff: u8 = 0;
    for (x, y) in a.iter().zip(b.iter()) { diff |= x ^ y; }
    (1u8).wrapping_sub((diff | diff.wrapping_neg()) >> 7)
}
#[inline(always)]
pub fn rotr32(x: u32, k: u32) -> u32 { x.rotate_right(k) }
#[inline(always)]
pub fn rotl32(x: u32, k: u32) -> u32 { x.rotate_left(k) }

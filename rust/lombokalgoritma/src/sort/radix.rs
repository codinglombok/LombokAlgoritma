// LombokAlgoritma — LSD radix sort
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! LSD radix sort (8-bit digits), stable, O(n) per pass. Signed values are handled by flipping
//! the sign bit, which maps `i64` order onto `u64` order (SPEC §6: negatives supported).
use alloc::vec::Vec;

fn radix_by_key<T: Copy>(a: &mut [T], passes: u32, key: impl Fn(T) -> u64) {
    if a.len() <= 1 {
        return;
    }
    let mut t: Vec<T> = a.to_vec();
    for pass in 0..passes {
        let sh = pass * 8;
        let mut cnt = [0usize; 256];
        for &v in a.iter() {
            cnt[((key(v) >> sh) & 0xff) as usize] += 1;
        }
        if cnt.contains(&a.len()) {
            continue; // every element has the same digit: the pass is the identity
        }
        for i in 1..256 {
            cnt[i] += cnt[i - 1];
        }
        for &v in a.iter().rev() {
            let idx = ((key(v) >> sh) & 0xff) as usize;
            cnt[idx] -= 1;
            t[cnt[idx]] = v;
        }
        a.copy_from_slice(&t);
    }
}

/// Ascending stable LSD radix sort of `i64` values (negatives supported).
pub fn radix_sort_lsd(a: &mut [i64]) {
    radix_by_key(a, 8, |v| (v as u64) ^ (1u64 << 63));
}

/// Ascending stable LSD radix sort of `u32` values.
pub fn radix_sort_lsd_u32(a: &mut [u32]) {
    radix_by_key(a, 4, u64::from);
}

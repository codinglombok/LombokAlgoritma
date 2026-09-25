// LombokAlgoritma — interpolation search (SPEC §7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

/// Interpolation search in an ascending `i64` slice; O(log log n) on uniform data.
///
/// `pos = lo + ⌊(hi − lo)·(t − arr[lo]) / (arr[hi] − arr[lo])⌋` with exact (128-bit) integer
/// arithmetic.
pub fn interpolation_search(arr: &[i64], target: i64) -> Option<usize> {
    if arr.is_empty() {
        return None;
    }
    let (mut lo, mut hi) = (0usize, arr.len() - 1);
    while lo <= hi && target >= arr[lo] && target <= arr[hi] {
        if lo == hi {
            return (arr[lo] == target).then_some(lo);
        }
        let range = i128::from(arr[hi]) - i128::from(arr[lo]);
        if range == 0 {
            return (arr[lo] == target).then_some(lo);
        }
        let num = (hi - lo) as i128 * (i128::from(target) - i128::from(arr[lo]));
        let pos = lo + (num / range) as usize;
        match arr[pos].cmp(&target) {
            core::cmp::Ordering::Equal => return Some(pos),
            core::cmp::Ordering::Less => lo = pos + 1,
            core::cmp::Ordering::Greater => {
                if pos == 0 {
                    return None;
                }
                hi = pos - 1;
            }
        }
    }
    None
}

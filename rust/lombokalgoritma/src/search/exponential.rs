// LombokAlgoritma — exponential search (SPEC §7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::binary_search;

/// Exponential (galloping) search: double `b` while `arr[b] < target`, then binary search
/// `arr[⌊b/2⌋ ..= min(b, n − 1)]`. O(log i).
pub fn exponential_search<T: Ord>(arr: &[T], target: &T) -> Option<usize> {
    let n = arr.len();
    if n == 0 {
        return None;
    }
    if arr[0] == *target {
        return Some(0);
    }
    let mut bound = 1usize;
    while bound < n && arr[bound] < *target {
        bound = bound.saturating_mul(2);
    }
    let lo = bound / 2;
    let hi = bound.min(n - 1);
    binary_search(&arr[lo..=hi], target).map(|i| lo + i)
}

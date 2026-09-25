// LombokAlgoritma — binary search, lower/upper bound (SPEC §7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use core::cmp::Ordering;

/// Index of `target` in the ascending slice `arr`, if present.
///
/// Normative probe order (SPEC §7): closed interval `lo = 0, hi = n − 1`,
/// `mid = ⌊(lo + hi) / 2⌋` — so with duplicates the returned index matches every port.
/// (v0.1.x used a half-open interval, which picked a different duplicate.)
pub fn binary_search<T: Ord>(arr: &[T], target: &T) -> Option<usize> {
    // `hi` is exclusive here; `lo + (hi − 1 − lo) / 2` equals ⌊(lo + hi_inclusive) / 2⌋.
    let (mut lo, mut hi) = (0usize, arr.len());
    while lo < hi {
        let mid = lo + (hi - 1 - lo) / 2;
        match arr[mid].cmp(target) {
            Ordering::Equal => return Some(mid),
            Ordering::Less => lo = mid + 1,
            Ordering::Greater => hi = mid,
        }
    }
    None
}

/// First index `i` with `arr[i] >= target` (or `arr.len()`).
pub fn lower_bound<T: Ord>(arr: &[T], target: &T) -> usize {
    let (mut lo, mut hi) = (0, arr.len());
    while lo < hi {
        let mid = lo + (hi - lo) / 2;
        if arr[mid] < *target {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    lo
}

/// First index `i` with `arr[i] > target` (or `arr.len()`).
pub fn upper_bound<T: Ord>(arr: &[T], target: &T) -> usize {
    let (mut lo, mut hi) = (0, arr.len());
    while lo < hi {
        let mid = lo + (hi - lo) / 2;
        if arr[mid] <= *target {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    lo
}

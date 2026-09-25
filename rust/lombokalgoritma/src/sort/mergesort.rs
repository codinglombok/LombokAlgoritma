// LombokAlgoritma — mergesort
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Bottom-up stable mergesort, O(n log n) time, O(n) space.
use core::cmp::Ordering;

/// Ascending stable mergesort.
pub fn mergesort<T: Ord + Clone>(a: &mut [T]) {
    mergesort_by(a, Ord::cmp);
}

/// Stable mergesort by comparator (elements comparing `Equal` keep their input order).
pub fn mergesort_by<T: Clone, F: FnMut(&T, &T) -> Ordering>(a: &mut [T], mut c: F) {
    let n = a.len();
    if n <= 1 {
        return;
    }
    let mut t = a.to_vec();
    let mut w = 1;
    while w < n {
        let mut lo = 0;
        while lo < n {
            let mid = (lo + w).min(n);
            let hi = (lo + 2 * w).min(n);
            let (mut i, mut j, mut k) = (lo, mid, lo);
            while i < mid && j < hi {
                if c(&a[i], &a[j]) != Ordering::Greater {
                    t[k] = a[i].clone();
                    i += 1;
                } else {
                    t[k] = a[j].clone();
                    j += 1;
                }
                k += 1;
            }
            while i < mid {
                t[k] = a[i].clone();
                i += 1;
                k += 1;
            }
            while j < hi {
                t[k] = a[j].clone();
                j += 1;
                k += 1;
            }
            lo += 2 * w;
        }
        a.clone_from_slice(&t);
        w *= 2;
    }
}

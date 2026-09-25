// LombokAlgoritma — quicksort
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Median-of-three quicksort with a three-way (Dijkstra) partition and insertion sort for small
//! slices; not stable. Recursing only into the smaller side bounds the stack depth by O(log n),
//! and the three-way partition keeps inputs with many duplicates at O(n log n)
//! (v0.1.x used a Lomuto partition that degraded to O(n²) time and O(n) stack on equal keys).

/// Ascending in-place quicksort.
pub fn quicksort<T: Ord>(a: &mut [T]) {
    let mut a = a;
    loop {
        let n = a.len();
        if n <= 16 {
            insertion_sort(a);
            return;
        }
        let (lt, gt) = partition3(a);
        let (left, rest) = core::mem::take(&mut a).split_at_mut(lt);
        let right = &mut rest[gt - lt + 1..];
        if left.len() < right.len() {
            quicksort(left);
            a = right;
        } else {
            quicksort(right);
            a = left;
        }
    }
}

fn insertion_sort<T: Ord>(a: &mut [T]) {
    for i in 1..a.len() {
        let mut j = i;
        while j > 0 && a[j] < a[j - 1] {
            a.swap(j, j - 1);
            j -= 1;
        }
    }
}

/// Partition around the median of `a[0]`, `a[n/2]`, `a[n−1]`; returns `(lt, gt)` such that
/// `a[..lt] < p`, `a[lt..=gt] == p`, `a[gt+1..] > p`.
fn partition3<T: Ord>(a: &mut [T]) -> (usize, usize) {
    let hi = a.len() - 1;
    let mid = hi / 2;
    if a[mid] < a[0] {
        a.swap(0, mid);
    }
    if a[hi] < a[0] {
        a.swap(0, hi);
    }
    if a[hi] < a[mid] {
        a.swap(mid, hi);
    }
    a.swap(0, mid); // pivot (the median) to the front
                    // invariant: a[lt..i] all equal the pivot, a[lt] is a pivot copy
    let (mut lt, mut i, mut gt) = (0usize, 1usize, hi);
    while i <= gt {
        match a[i].cmp(&a[lt]) {
            core::cmp::Ordering::Less => {
                a.swap(lt, i);
                lt += 1;
                i += 1;
            }
            core::cmp::Ordering::Greater => {
                a.swap(i, gt);
                gt -= 1;
            }
            core::cmp::Ordering::Equal => i += 1,
        }
    }
    (lt, gt)
}

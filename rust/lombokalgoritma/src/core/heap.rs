// LombokAlgoritma — binary min-heap
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Array-backed binary min-heap with a caller-supplied strict `less` predicate.
//!
//! SPEC §9.0 requires every graph heap to use a *total* lexicographic key (e.g. `[distance, node]`)
//! so the pop order — and therefore every output — does not depend on the heap implementation.
use alloc::vec::Vec;

/// Binary min-heap ordered by `less`.
pub struct MinHeap<T, F: Fn(&T, &T) -> bool> {
    items: Vec<T>,
    less: F,
}

impl<T, F: Fn(&T, &T) -> bool> MinHeap<T, F> {
    /// Empty heap ordered by the strict predicate `less`.
    pub fn new(less: F) -> Self {
        MinHeap {
            items: Vec::new(),
            less,
        }
    }

    /// Number of items.
    pub fn len(&self) -> usize {
        self.items.len()
    }

    /// `true` when the heap holds no items.
    pub fn is_empty(&self) -> bool {
        self.items.is_empty()
    }

    /// Insert `item` (sift-up).
    pub fn push(&mut self, item: T) {
        let a = &mut self.items;
        a.push(item);
        let mut i = a.len() - 1;
        while i > 0 {
            let p = (i - 1) >> 1;
            if !(self.less)(&a[i], &a[p]) {
                break;
            }
            a.swap(i, p);
            i = p;
        }
    }

    /// Remove and return the minimum, or `None` when empty.
    pub fn pop(&mut self) -> Option<T> {
        let a = &mut self.items;
        let last = a.pop()?;
        if a.is_empty() {
            return Some(last);
        }
        let top = core::mem::replace(&mut a[0], last);
        let mut i = 0;
        loop {
            let l = 2 * i + 1;
            let r = l + 1;
            let mut m = i;
            if l < a.len() && (self.less)(&a[l], &a[m]) {
                m = l;
            }
            if r < a.len() && (self.less)(&a[r], &a[m]) {
                m = r;
            }
            if m == i {
                break;
            }
            a.swap(i, m);
            i = m;
        }
        Some(top)
    }
}

/// Lexicographic `<` on equal-length `f64` tuples, exactly like the TypeScript `tupleLess`
/// (the first differing component decides; `NaN` never compares less).
pub fn tuple_less(a: &[f64], b: &[f64]) -> bool {
    for (x, y) in a.iter().zip(b.iter()) {
        #[allow(clippy::float_cmp)]
        if x != y {
            return x < y;
        }
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;
    use alloc::vec;

    #[test]
    fn pops_in_order() {
        let mut h = MinHeap::new(|a: &[f64; 2], b: &[f64; 2]| tuple_less(a, b));
        assert!(h.is_empty());
        assert_eq!(h.pop(), None);
        for (i, d) in [5.0, 1.0, 3.0, 1.0, 9.0, 0.5, 3.0].iter().enumerate() {
            h.push([*d, i as f64]);
        }
        assert_eq!(h.len(), 7);
        let mut out = vec![];
        while let Some(x) = h.pop() {
            out.push(x);
        }
        assert_eq!(
            out,
            vec![
                [0.5, 5.0],
                [1.0, 1.0],
                [1.0, 3.0],
                [3.0, 2.0],
                [3.0, 6.0],
                [5.0, 0.0],
                [9.0, 4.0]
            ]
        );
        assert!(!tuple_less(&[1.0, 2.0], &[1.0, 2.0]));
        assert!(!tuple_less(&[f64::NAN], &[1.0]));
    }
}

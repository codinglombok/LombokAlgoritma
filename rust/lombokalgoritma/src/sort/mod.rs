// LombokAlgoritma — sorting (SPEC §6)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Sorting algorithms. `timsort`, `mergesort`, `radix_sort_lsd` and `counting_sort` are stable;
//! `quicksort` and `heapsort` are not (only the order of values is normative for them).
mod counting;
mod heapsort;
mod mergesort;
mod quicksort;
mod radix;
mod timsort;

pub use counting::counting_sort;
pub use heapsort::heapsort;
pub use mergesort::{mergesort, mergesort_by};
pub use quicksort::quicksort;
pub use radix::{radix_sort_lsd, radix_sort_lsd_u32};
pub use timsort::{timsort, timsort_by};

/// Default sort: stable [`timsort`].
pub fn sort<T: Ord + Clone>(arr: &mut [T]) {
    timsort(arr);
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Error;
    use alloc::vec;
    use alloc::vec::Vec;

    fn lcg(seed: &mut u64) -> u32 {
        *seed = seed
            .wrapping_mul(6_364_136_223_846_793_005)
            .wrapping_add(1_442_695_040_888_963_407);
        (*seed >> 33) as u32
    }

    #[test]
    fn all_sorts_agree_with_std() {
        let mut s = 1u64;
        for n in [0usize, 1, 2, 15, 16, 17, 31, 32, 33, 64, 100, 1000, 5000] {
            for modulus in [3u32, 50, u32::MAX] {
                let base: Vec<u32> = (0..n).map(|_| lcg(&mut s) % modulus).collect();
                let mut want = base.clone();
                want.sort_unstable();
                let run = |f: fn(&mut [u32])| {
                    let mut v = base.clone();
                    f(&mut v);
                    v
                };
                assert_eq!(run(timsort), want, "timsort n={n}");
                assert_eq!(run(mergesort), want, "mergesort n={n}");
                assert_eq!(run(quicksort), want, "quicksort n={n}");
                assert_eq!(run(heapsort), want, "heapsort n={n}");
                assert_eq!(run(radix_sort_lsd_u32), want, "radix n={n}");
                assert_eq!(run(sort), want, "sort n={n}");
                let signed: Vec<i64> = base.iter().map(|&x| i64::from(x) - (1 << 31)).collect();
                let mut want_s = signed.clone();
                want_s.sort_unstable();
                let mut got = signed.clone();
                radix_sort_lsd(&mut got);
                assert_eq!(got, want_s, "radix i64 n={n}");
            }
        }
        let mut extremes = vec![i64::MAX, i64::MIN, 0, -1, 1, i64::MIN + 1];
        radix_sort_lsd(&mut extremes);
        assert_eq!(extremes, [i64::MIN, i64::MIN + 1, -1, 0, 1, i64::MAX]);
        let mut sorted: Vec<u32> = (0..3000).collect();
        quicksort(&mut sorted);
        assert!(sorted.windows(2).all(|w| w[0] <= w[1]));
        let mut rev: Vec<u32> = (0..3000).rev().collect();
        quicksort(&mut rev);
        assert_eq!(rev, sorted);
    }

    #[test]
    fn stable_sorts_are_stable() {
        let mut s = 7u64;
        let items: Vec<(u32, usize)> = (0..2000).map(|i| (lcg(&mut s) % 10, i)).collect();
        let mut want = items.clone();
        want.sort_by_key(|x| x.0); // std sort_by_key is stable
        let mut got = items.clone();
        timsort_by(&mut got, |a, b| a.0.cmp(&b.0));
        assert_eq!(got, want);
        let mut got = items;
        mergesort_by(&mut got, |a, b| a.0.cmp(&b.0));
        assert_eq!(got, want);
    }

    #[test]
    fn counting() {
        assert_eq!(counting_sort(&[], None), Ok(vec![]));
        assert_eq!(counting_sort(&[-5], None), Ok(vec![-5]));
        assert_eq!(
            counting_sort(&[3, 1, 2, 1, 0], None),
            Ok(vec![0, 1, 1, 2, 3])
        );
        assert_eq!(counting_sort(&[3, 1], Some(5)), Ok(vec![1, 3]));
        assert_eq!(counting_sort(&[3, -1, 2], None), Err(Error::OutOfRange));
        assert_eq!(counting_sort(&[3, 1], Some(2)), Err(Error::OutOfRange));
        assert_eq!(counting_sort(&[3, 1], Some(-3)), Err(Error::OutOfRange));
    }
}

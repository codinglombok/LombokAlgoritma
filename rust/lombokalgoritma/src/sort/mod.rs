//! Sorting algorithms. `timsort`/`mergesort` are stable; `quicksort`/`heapsort` are not.
mod heapsort;
mod mergesort;
mod quicksort;
mod radix;
mod timsort;

pub use heapsort::heapsort;
pub use mergesort::mergesort;
pub use quicksort::quicksort;
pub use radix::radix_sort_lsd;
pub use timsort::{timsort, timsort_by};

/// Default sort: stable [`timsort`].
pub fn sort<T: Ord + Clone>(arr: &mut [T]) {
    timsort(arr);
}

#[cfg(test)]
mod tests {
    use super::*;
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
        for n in [0usize, 1, 2, 15, 16, 17, 31, 32, 33, 64, 100, 1000] {
            let base: Vec<u32> = (0..n).map(|_| lcg(&mut s) % 50).collect();
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
            assert_eq!(run(radix_sort_lsd), want, "radix n={n}");
            assert_eq!(run(sort), want, "sort n={n}");
        }
    }

    #[test]
    fn timsort_is_stable() {
        let mut s = 7u64;
        let items: Vec<(u32, usize)> = (0..2000).map(|i| (lcg(&mut s) % 10, i)).collect();
        let mut want = items.clone();
        want.sort_by_key(|x| x.0); // std sort_by_key is stable
        let mut got = items;
        timsort_by(&mut got, |a, b| a.0.cmp(&b.0));
        assert_eq!(got, want);
    }
}

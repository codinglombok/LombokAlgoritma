// LombokAlgoritma — searching (SPEC §7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Searching sorted (ascending) slices, plus linear and ternary search. With duplicates the
//! returned index is normative per algorithm (SPEC §7), so the probe orders below are fixed.
mod binary;
mod exponential;
mod fibonacci;
mod interpolation;
mod jump;
mod linear;
mod ternary;

pub use binary::{binary_search, lower_bound, upper_bound};
pub use exponential::exponential_search;
pub use fibonacci::fibonacci_search;
pub use interpolation::interpolation_search;
pub use jump::jump_search;
pub use linear::linear_search;
pub use ternary::ternary_search;

#[cfg(test)]
mod tests {
    use super::*;
    use alloc::vec::Vec;

    #[test]
    fn searches() {
        let a = [1, 3, 3, 5, 7];
        assert_eq!(binary_search(&a, &5), Some(3));
        assert_eq!(binary_search(&a, &4), None);
        assert_eq!(binary_search(&a, &0), None);
        assert_eq!(binary_search(&a, &9), None);
        assert_eq!(binary_search::<i32>(&[], &1), None);
        assert_eq!(lower_bound(&a, &3), 1);
        assert_eq!(upper_bound(&a, &3), 3);
        assert_eq!(lower_bound(&a, &9), 5);
        assert_eq!(linear_search(&a, &7), Some(4));
        assert_eq!(linear_search(&a, &8), None);
    }

    #[test]
    fn duplicates_follow_the_spec_probe_order() {
        // closed-interval binary search: mid = ⌊(0 + 6)/2⌋ = 3
        let a = [2, 2, 2, 2, 2, 2, 2];
        assert_eq!(binary_search(&a, &2), Some(3));
        let b = [1, 2, 2];
        assert_eq!(binary_search(&b, &2), Some(1));
    }

    #[test]
    fn all_variants_find_every_element() {
        let arr: Vec<i64> = (0..200).map(|i| i * 8 + (i % 7)).collect();
        for n in [0usize, 1, 2, 3, 5, 8, 13, 50, 200] {
            let s = &arr[..n];
            for t in -2..(1600 + 2) {
                let want = s.iter().position(|&x| x == t);
                assert_eq!(binary_search(s, &t), want, "binary n={n} t={t}");
                assert_eq!(interpolation_search(s, t), want, "interp n={n} t={t}");
                assert_eq!(exponential_search(s, &t), want, "exp n={n} t={t}");
                assert_eq!(jump_search(s, &t), want, "jump n={n} t={t}");
                assert_eq!(fibonacci_search(s, &t), want, "fib n={n} t={t}");
            }
        }
        assert_eq!(interpolation_search(&[4, 4, 4], 4), Some(0));
        assert_eq!(interpolation_search(&[4, 4, 4], 5), None);
        assert_eq!(interpolation_search(&[i64::MIN, 0, i64::MAX], 0), Some(1));
        assert_eq!(interpolation_search(&[1, 2, 10], 3), None);
    }

    #[test]
    fn ternary() {
        let c = 3.7;
        let x = ternary_search(0.0, 10.0, |x| -((x - c) * (x - c)), true, 1e-9);
        assert!((x - c).abs() < 1e-6);
        let y = ternary_search(-5.0, 5.0, |x| x * x, false, 1e-6);
        assert!(y.abs() < 1e-5);
        // epsilon below the float spacing still terminates
        let z = ternary_search(1.0, 2.0, |x| x, true, 0.0);
        assert!((1.0..=2.0).contains(&z));
    }
}

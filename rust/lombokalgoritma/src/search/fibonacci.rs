// LombokAlgoritma — Fibonacci search (SPEC §7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use core::cmp::Ordering;

/// Fibonacci search (Ferguson's classic variant, exactly as SPEC §7). O(log n).
pub fn fibonacci_search<T: Ord>(arr: &[T], target: &T) -> Option<usize> {
    let n = arr.len();
    let (mut fib_mm2, mut fib_mm1, mut fib_m) = (0usize, 1usize, 1usize);
    while fib_m < n {
        fib_mm2 = fib_mm1;
        fib_mm1 = fib_m;
        fib_m = fib_mm1 + fib_mm2;
    }
    // `offset` of the reference is `start − 1` (it starts at −1)
    let mut start = 0usize;
    while fib_m > 1 {
        let i = (start + fib_mm2 - 1).min(n - 1);
        match arr[i].cmp(target) {
            Ordering::Less => {
                fib_m = fib_mm1;
                fib_mm1 = fib_mm2;
                fib_mm2 = fib_m - fib_mm1;
                start = i + 1;
            }
            Ordering::Greater => {
                fib_m = fib_mm2;
                fib_mm1 -= fib_mm2;
                fib_mm2 = fib_m - fib_mm1;
            }
            Ordering::Equal => return Some(i),
        }
    }
    (fib_mm1 != 0 && start < n && arr[start] == *target).then_some(start)
}

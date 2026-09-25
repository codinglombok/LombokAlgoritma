// LombokAlgoritma — sieve of Eratosthenes and segmented sieve (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::num::isqrt_u64;
use alloc::vec;
use alloc::vec::Vec;

/// All primes `≤ n`, ascending. O(n log log n).
pub fn sieve(n: usize) -> Vec<usize> {
    if n < 2 {
        return Vec::new();
    }
    let mut composite = vec![false; n + 1];
    let mut i = 2usize;
    while i * i <= n {
        if !composite[i] {
            let mut j = i * i;
            while j <= n {
                composite[j] = true;
                j += i;
            }
        }
        i += 1;
    }
    (2..=n).filter(|&i| !composite[i]).collect()
}

/// All primes in `[lo, hi]`, ascending (empty when `hi < lo`). Memory O(√hi + (hi − lo)).
pub fn segmented_sieve(lo: u64, hi: u64) -> Vec<u64> {
    if hi < lo {
        return Vec::new();
    }
    let base = sieve(isqrt_u64(hi) as usize); // primes ≤ ⌊√hi⌋ suffice
    let size = (hi - lo) as usize + 1;
    let mut composite = vec![false; size];
    for p in base {
        let p = p as u64;
        let first = lo.div_ceil(p).saturating_mul(p);
        let mut j = (p * p).max(first);
        while j <= hi {
            composite[(j - lo) as usize] = true;
            match j.checked_add(p) {
                Some(next) => j = next,
                None => break,
            }
        }
    }
    (0..size)
        .filter(|&i| !composite[i] && lo + i as u64 > 1)
        .map(|i| lo + i as u64)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn sieves() {
        assert!(sieve(0).is_empty());
        assert!(sieve(1).is_empty());
        assert_eq!(sieve(30), [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
        assert_eq!(segmented_sieve(0, 30), [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
        assert!(segmented_sieve(1, 1).is_empty());
        assert!(segmented_sieve(10, 5).is_empty());
        assert_eq!(segmented_sieve(24, 30), [29]);
        assert_eq!(segmented_sieve(2, 2), [2]);
        let big = segmented_sieve(1_000_000, 1_000_100);
        assert_eq!(big.first(), Some(&1_000_003));
        assert!(big.iter().all(|&p| super::super::is_prime(p)));
        let t = 1_000_000_000_000u64;
        let want: Vec<u64> = (t..=t + 200)
            .filter(|&n| super::super::is_prime(n))
            .collect();
        assert_eq!(segmented_sieve(t, t + 200), want);
    }
}

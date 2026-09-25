// LombokAlgoritma — linear search (SPEC §7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

/// First index of `target` in `arr`, if present. O(n); `arr` need not be sorted.
pub fn linear_search<T: PartialEq>(arr: &[T], target: &T) -> Option<usize> {
    arr.iter().position(|x| x == target)
}

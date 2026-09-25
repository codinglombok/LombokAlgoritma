// LombokAlgoritma — jump search (SPEC §7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::num::isqrt_u64;

/// Jump search with block size `max(1, ⌊√n⌋)`; the final block `prev ..= min(cur, n − 1)` is
/// scanned inclusively and the first equal index is returned. O(√n).
pub fn jump_search<T: Ord>(arr: &[T], target: &T) -> Option<usize> {
    let n = arr.len();
    if n == 0 {
        return None;
    }
    let step = (isqrt_u64(n as u64) as usize).max(1);
    let mut prev = 0;
    let mut cur = step;
    while cur < n && arr[cur] < *target {
        prev = cur;
        cur += step;
    }
    (prev..=cur.min(n - 1)).find(|&i| arr[i] == *target)
}

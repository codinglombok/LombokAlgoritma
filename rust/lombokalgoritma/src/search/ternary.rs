// LombokAlgoritma — ternary search (SPEC §7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

/// Ternary search for the arg-max (`maximize = true`) or arg-min of a unimodal `f` on
/// `[lo, hi]`: while `hi − lo > epsilon`, `m1 = lo + (hi − lo)/3`, `m2 = hi − (hi − lo)/3`;
/// maximum: `f(m1) < f(m2) → lo = m1` else `hi = m2` (minimum: `>`). Returns `(lo + hi) / 2`.
///
/// The loop also stops when an iteration can no longer shrink the interval (an `epsilon`
/// below the float spacing would otherwise never terminate).
pub fn ternary_search<F: FnMut(f64) -> f64>(
    lo: f64,
    hi: f64,
    mut f: F,
    maximize: bool,
    epsilon: f64,
) -> f64 {
    let (mut lo, mut hi) = (lo, hi);
    while hi - lo > epsilon {
        let m1 = lo + (hi - lo) / 3.0;
        let m2 = hi - (hi - lo) / 3.0;
        let (f1, f2) = (f(m1), f(m2));
        let go_right = if maximize { f1 < f2 } else { f1 > f2 };
        let (nlo, nhi) = if go_right { (m1, hi) } else { (lo, m2) };
        if nlo.to_bits() == lo.to_bits() && nhi.to_bits() == hi.to_bits() {
            break;
        }
        lo = nlo;
        hi = nhi;
    }
    (lo + hi) / 2.0
}

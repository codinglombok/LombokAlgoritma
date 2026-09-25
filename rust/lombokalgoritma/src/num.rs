// LombokAlgoritma — float/integer helpers usable in `no_std`
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! `f64::sqrt/abs/floor/ln` are `std`-only on the MSRV (1.75). With the `std` feature the hardware
//! versions are used; otherwise software fallbacks. `sqrt` and `abs` are exact (correctly rounded,
//! IEEE 754), so results never depend on the feature. `ln` is not normative at the bit level
//! (SPEC §0.2); its fallback is a port of fdlibm's `__ieee754_log` (< 1 ulp).
#![cfg_attr(feature = "std", allow(dead_code))]

/// Square root, correctly rounded.
#[inline]
pub(crate) fn sqrt(x: f64) -> f64 {
    #[cfg(feature = "std")]
    {
        x.sqrt()
    }
    #[cfg(not(feature = "std"))]
    {
        soft_sqrt(x)
    }
}

/// Absolute value (clears the sign bit).
#[inline]
pub(crate) fn abs(x: f64) -> f64 {
    f64::from_bits(x.to_bits() & !(1u64 << 63))
}

/// Largest integer ≤ `x`.
#[inline]
pub(crate) fn floor(x: f64) -> f64 {
    #[cfg(feature = "std")]
    {
        x.floor()
    }
    #[cfg(not(feature = "std"))]
    {
        soft_floor(x)
    }
}

/// Smallest integer ≥ `x`.
#[inline]
pub(crate) fn ceil(x: f64) -> f64 {
    -floor(-x)
}

/// ECMAScript `Math.round`: nearest integer, halves rounded towards +∞.
#[inline]
pub(crate) fn round_half_up(x: f64) -> f64 {
    let r = floor(x);
    if x - r >= 0.5 {
        r + 1.0
    } else {
        r
    }
}

/// Natural logarithm (not bit-normative).
#[inline]
pub(crate) fn ln(x: f64) -> f64 {
    #[cfg(feature = "std")]
    {
        x.ln()
    }
    #[cfg(not(feature = "std"))]
    {
        soft_ln(x)
    }
}

/// Integer square root ⌊√n⌋ and the remainder `n − ⌊√n⌋²` (bit-by-bit method).
pub(crate) fn isqrt_rem_u128(n: u128) -> (u128, u128) {
    let mut x = n;
    let mut res = 0u128;
    let mut bit = 1u128 << 126;
    while bit > n {
        bit >>= 2;
    }
    while bit != 0 {
        if x >= res + bit {
            x -= res + bit;
            res = (res >> 1) + bit;
        } else {
            res >>= 1;
        }
        bit >>= 2;
    }
    (res, x)
}

/// ⌊√n⌋ for `u64`.
pub(crate) fn isqrt_u64(n: u64) -> u64 {
    isqrt_rem_u128(u128::from(n)).0 as u64
}

/// Software IEEE 754 square root (round-to-nearest-even), bit-identical to hardware `sqrt`.
pub(crate) fn soft_sqrt(x: f64) -> f64 {
    if x.is_nan() || x == 0.0 || x == f64::INFINITY {
        return x; // NaN, ±0, +∞ map to themselves
    }
    let bits = x.to_bits();
    if bits >> 63 == 1 {
        return f64::NAN;
    }
    let biased = ((bits >> 52) & 0x7ff) as i64;
    let mut mant = bits & ((1u64 << 52) - 1);
    let mut e;
    if biased == 0 {
        // subnormal: normalise so bit 52 is set
        let shift = i64::from(mant.leading_zeros()) - 11;
        mant <<= shift;
        e = 1 - shift - 1075;
    } else {
        mant |= 1u64 << 52;
        e = biased - 1075;
    }
    // x = mant · 2^e with mant ∈ [2^52, 2^53); make e even
    if e & 1 != 0 {
        mant <<= 1;
        e -= 1;
    }
    // √x = √(mant · 2^54) · 2^((e − 54)/2); √(mant · 2^54) ∈ [2^53, 2^54): 53 bits + 1 guard bit
    let (r, rem) = isqrt_rem_u128(u128::from(mant) << 54);
    let r = r as u64;
    let sig = r >> 1;
    let guard = r & 1;
    let round_up = guard == 1 && (rem != 0 || sig & 1 == 1);
    let exp = (e - 54) / 2 + 1 + 52 + 1023; // biased exponent of sig · 2^((e − 54)/2 + 1)
    let out = ((exp as u64) << 52) + (sig - (1u64 << 52)) + u64::from(round_up);
    f64::from_bits(out)
}

/// Software floor.
pub(crate) fn soft_floor(x: f64) -> f64 {
    if abs(x) >= 4_503_599_627_370_496.0 || x.is_nan() || x == 0.0 {
        return x; // already integral (|x| ≥ 2^52), NaN, ±0
    }
    let t = (x as i64) as f64; // truncation towards zero
    let t = if t > x { t - 1.0 } else { t };
    if t == 0.0 && x < 0.0 {
        -0.0
    } else {
        t
    }
}

/// Software natural logarithm — port of fdlibm `e_log.c` (Sun Microsystems, freely redistributable).
#[allow(clippy::unreadable_literal, clippy::excessive_precision)]
pub(crate) fn soft_ln(x: f64) -> f64 {
    const LN2_HI: f64 = 6.93147180369123816490e-01;
    const LN2_LO: f64 = 1.90821492927058770002e-10;
    const TWO54: f64 = 1.80143985094819840000e+16;
    const LG1: f64 = 6.666666666666735130e-01;
    const LG2: f64 = 3.999999999940941908e-01;
    const LG3: f64 = 2.857142874366239149e-01;
    const LG4: f64 = 2.222219843214978396e-01;
    const LG5: f64 = 1.818357216161805012e-01;
    const LG6: f64 = 1.531383769920937332e-01;
    const LG7: f64 = 1.479819860511658591e-01;

    let mut x = x;
    let bits = x.to_bits();
    let mut hx = (bits >> 32) as u32 as i32;
    let lx = bits as u32;
    let mut k: i32 = 0;
    if hx < 0x0010_0000 {
        if ((hx & 0x7fff_ffff) as u32 | lx) == 0 {
            return f64::NEG_INFINITY; // log(±0)
        }
        if hx < 0 {
            return f64::NAN; // log(negative)
        }
        k -= 54;
        x *= TWO54; // scale subnormal up
        hx = (x.to_bits() >> 32) as u32 as i32;
    }
    if hx >= 0x7ff0_0000 {
        return x + x; // +∞ or NaN
    }
    k += (hx >> 20) - 1023;
    hx &= 0x000f_ffff;
    let i = (hx + 0x95f64) & 0x0010_0000;
    // normalise x or x/2
    let hi = (hx | (i ^ 0x3ff0_0000)) as u32;
    x = f64::from_bits((u64::from(hi) << 32) | (x.to_bits() & 0xffff_ffff));
    k += i >> 20;
    let f = x - 1.0;
    let dk = f64::from(k);
    if (0x000f_ffff & (2 + hx)) < 3 {
        // |f| < 2^-20
        if f == 0.0 {
            return if k == 0 {
                0.0
            } else {
                dk * LN2_HI + dk * LN2_LO
            };
        }
        let r = f * f * (0.5 - 0.333_333_333_333_333_33 * f);
        return if k == 0 {
            f - r
        } else {
            dk * LN2_HI - ((r - dk * LN2_LO) - f)
        };
    }
    let s = f / (2.0 + f);
    let z = s * s;
    let mut i = hx - 0x6147a;
    let w = z * z;
    let j = 0x6b851 - hx;
    let t1 = w * (LG2 + w * (LG4 + w * LG6));
    let t2 = z * (LG1 + w * (LG3 + w * (LG5 + w * LG7)));
    i |= j;
    let r = t2 + t1;
    if i > 0 {
        let hfsq = 0.5 * f * f;
        if k == 0 {
            f - (hfsq - s * (hfsq + r))
        } else {
            dk * LN2_HI - ((hfsq - (s * (hfsq + r) + dk * LN2_LO)) - f)
        }
    } else if k == 0 {
        f - s * (f - r)
    } else {
        dk * LN2_HI - ((s * (f - r) - dk * LN2_LO) - f)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Deterministic stream of "interesting" doubles: random bit patterns + edge cases.
    fn samples() -> alloc::vec::Vec<f64> {
        let mut v = alloc::vec![
            0.0,
            -0.0,
            1.0,
            2.0,
            4.0,
            0.5,
            f64::MIN_POSITIVE,
            f64::MAX,
            f64::EPSILON,
            5e-324,
            1e-310,
            3.0,
            1e300,
            123_456_789.0,
            f64::INFINITY,
            f64::NEG_INFINITY,
            f64::NAN,
            -1.0,
            -1e-310,
        ];
        let mut s = 0x9e37_79b9_7f4a_7c15u64;
        for _ in 0..20_000 {
            s ^= s << 13;
            s ^= s >> 7;
            s ^= s << 17;
            v.push(f64::from_bits(s));
            v.push(f64::from_bits(s >> 12 | 0x3ff0_0000_0000_0000)); // [1, 2)
        }
        for i in 0..2000u64 {
            v.push(i as f64);
            v.push(f64::from_bits(i)); // subnormals
            v.push(i as f64 * 0.37 - 300.0);
        }
        v
    }

    fn same(a: f64, b: f64) -> bool {
        (a.is_nan() && b.is_nan()) || a.to_bits() == b.to_bits()
    }

    #[test]
    fn soft_sqrt_is_bit_exact() {
        for x in samples() {
            assert!(
                same(soft_sqrt(x), x.sqrt()),
                "sqrt({x:e}) bits {:x}",
                x.to_bits()
            );
            assert!(same(sqrt(x), x.sqrt()));
        }
    }

    #[test]
    fn soft_floor_matches_std() {
        for x in samples() {
            assert!(same(soft_floor(x), x.floor()), "floor({x:e})");
            assert!(same(floor(x), x.floor()));
            assert!(same(ceil(x), x.ceil()), "ceil({x:e})");
            assert!(same(abs(x), x.abs()));
        }
    }

    #[test]
    fn soft_ln_within_one_ulp() {
        for x in samples() {
            let (a, b) = (soft_ln(x), x.ln());
            if a.is_nan() || b.is_nan() || a.is_infinite() || b.is_infinite() {
                assert!(same(a, b), "ln({x:e}) = {a} vs {b}");
            } else {
                let d = (a.to_bits() as i64 - b.to_bits() as i64).abs();
                assert!(d <= 1 || (a - b).abs() < 1e-300, "ln({x:e}) = {a} vs {b}");
            }
            let want = if cfg!(feature = "std") {
                x.ln()
            } else {
                soft_ln(x)
            };
            assert!(same(ln(x), want));
        }
    }

    #[test]
    fn rounding_and_isqrt() {
        assert_eq!(round_half_up(2.5), 3.0);
        assert_eq!(round_half_up(2.4999), 2.0);
        assert_eq!(round_half_up(-2.5), -2.0);
        assert_eq!(round_half_up(0.499_999_999_999_999_94), 0.0);
        for n in [
            0u64,
            1,
            2,
            3,
            4,
            15,
            16,
            17,
            99,
            100,
            u64::MAX,
            (1 << 62) + 5,
        ] {
            let r = u128::from(isqrt_u64(n));
            assert!(r * r <= u128::from(n) && (r + 1) * (r + 1) > u128::from(n));
        }
        assert_eq!(isqrt_rem_u128(10), (3, 1));
    }
}

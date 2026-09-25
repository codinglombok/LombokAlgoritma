// LombokAlgoritma — Karatsuba multiplication (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

fn decimal_digits(mut v: u128) -> u32 {
    let mut d = 1;
    while v >= 10 {
        v /= 10;
        d += 1;
    }
    d
}

fn karatsuba_u128(x: u128, y: u128) -> u128 {
    if x < 1000 || y < 1000 {
        return x * y;
    }
    // split x = x1·B + x0, y = y1·B + y0 with B = 10^⌈digits/2⌉ (as the reference)
    let n = decimal_digits(x).max(decimal_digits(y));
    let b = 10u128.pow(n.div_ceil(2));
    let (x1, x0, y1, y0) = (x / b, x % b, y / b, y % b);
    let z0 = karatsuba_u128(x0, y0);
    let z2 = karatsuba_u128(x1, y1);
    let z1 = karatsuba_u128(x0 + x1, y0 + y1) - z2 - z0;
    z2 * b * b + z1 * b + z0
}

/// Exact product `x · y` by Karatsuba's divide and conquer on decimal halves
/// (only the value is normative). Every `i64 × i64` product fits in `i128`.
pub fn karatsuba(x: i64, y: i64) -> i128 {
    let p = karatsuba_u128(u128::from(x.unsigned_abs()), u128::from(y.unsigned_abs()));
    let p = p as i128; // |p| ≤ 2^126
    if (x < 0) != (y < 0) {
        -p
    } else {
        p
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn products() {
        assert_eq!(karatsuba(0, 5), 0);
        assert_eq!(karatsuba(12345, 6789), 83_810_205);
        assert_eq!(karatsuba(-999, 1001), -999_999);
        assert_eq!(
            karatsuba(i64::MAX, i64::MAX),
            85_070_591_730_234_615_847_396_907_784_232_501_249
        );
        assert_eq!(
            karatsuba(1_234_567_890_123, -98_765_432_109),
            -121_932_631_135_894_528_159_407
        );
        assert_eq!(karatsuba(i64::MIN, i64::MIN), 1i128 << 126);
        assert_eq!(karatsuba(i64::MIN, 3), -(3i128 << 63));
        let mut s = 99u64;
        for _ in 0..500 {
            s = s.wrapping_mul(6_364_136_223_846_793_005).wrapping_add(1);
            let (a, b) = (s as i64, (s >> 7) as i64 >> (s % 60));
            assert_eq!(karatsuba(a, b), i128::from(a) * i128::from(b));
        }
    }
}

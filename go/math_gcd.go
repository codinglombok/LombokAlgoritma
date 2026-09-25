// LombokAlgoritma — GCD, LCM, extended Euclid, modular inverse (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "math/bits"

// absU64 returns |v| as uint64 (exact also for math.MinInt64).
func absU64(v int64) uint64 {
	if v < 0 {
		return -uint64(v)
	}
	return uint64(v)
}

// GCD returns gcd(|a|, |b|) by binary GCD (Stein); GCD(0, 0) = 0. The result is unsigned so
// that GCD(math.MinInt64, 0) = 2^63 is representable.
func GCD(a, b int64) uint64 { return gcdU64(absU64(a), absU64(b)) }

func gcdU64(a, b uint64) uint64 {
	if a == 0 {
		return b
	}
	if b == 0 {
		return a
	}
	shift := bits.TrailingZeros64(a | b)
	a >>= bits.TrailingZeros64(a)
	for b != 0 {
		b >>= bits.TrailingZeros64(b)
		if a > b {
			a, b = b, a
		}
		b -= a
	}
	return a << shift
}

// LCM returns |a / gcd(a, b) · b|, or 0 when either argument is 0. A result ≥ 2^64 yields an
// OVERFLOW error.
func LCM(a, b int64) (uint64, error) {
	if a == 0 || b == 0 {
		return 0, nil
	}
	ua, ub := absU64(a), absU64(b)
	hi, lo := bits.Mul64(ua/gcdU64(ua, ub), ub)
	if hi != 0 {
		return 0, newErr(CodeOverflow, "LCM(%d, %d) exceeds 64 bits", a, b)
	}
	return lo, nil
}

// ExtendedGCD returns (g, x, y) with a·x + b·y = g, computed recursively:
// b = 0 → (a, 1, 0); else (g, x₁, y₁) = ExtendedGCD(b, a rem b) and the result is
// (g, y₁, x₁ − (a quo b)·y₁), with Go's truncated division (SPEC §10). g carries the sign of
// the last non-zero remainder, exactly as in the reference.
func ExtendedGCD(a, b int64) (g, x, y int64) {
	if b == 0 {
		return a, 1, 0
	}
	g, x1, y1 := ExtendedGCD(b, a%b)
	return g, y1, x1 - (a/b)*y1
}

// ModInverse returns a⁻¹ mod m in [0, m). m < 1 yields OUT_OF_RANGE; gcd(a, m) ≠ 1 yields
// NO_INVERSE.
func ModInverse(a, m int64) (int64, error) {
	if m < 1 {
		return 0, newErr(CodeOutOfRange, "ModInverse: modulus must be ≥ 1")
	}
	g, x, _ := ExtendedGCD(floorMod(a, m), m)
	if g != 1 {
		return 0, newErr(CodeNoInverse, "ModInverse: gcd(%d, %d) = %d", a, m, g)
	}
	return floorMod(x, m), nil
}

// floorMod returns a mod m in [0, m) for m ≥ 1.
func floorMod(a, m int64) int64 {
	r := a % m
	if r < 0 {
		r += m
	}
	return r
}

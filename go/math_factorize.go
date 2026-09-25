// LombokAlgoritma — Pollard's rho and prime factorisation (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "slices"

var smallPrimes = [...]uint64{2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}

// PollardRho returns a non-trivial factor of the composite n (Floyd cycle detection, x₀ = 2,
// c = 1, 2, 3, … until a proper factor appears). n < 4 or a prime n yields INVALID_INPUT.
func PollardRho(n int64) (int64, error) {
	if n < 4 || IsPrime(n) {
		return 0, newErr(CodeInvalidInput, "PollardRho: n must be composite")
	}
	return int64(pollardRhoU64(uint64(n))), nil
}

// pollardRhoU64 requires a composite n ≤ 2^63.
func pollardRhoU64(n uint64) uint64 {
	if n%2 == 0 {
		return 2
	}
	for c := uint64(1); ; c++ {
		f := func(x uint64) uint64 { return (mulMod(x, x, n) + c) % n }
		x, y, d := uint64(2), uint64(2), uint64(1)
		for d == 1 {
			x = f(x)
			y = f(f(y))
			if x > y {
				d = gcdU64(x-y, n)
			} else {
				d = gcdU64(y-x, n)
			}
		}
		if d != n {
			return d
		}
	}
}

// Factorize returns the prime factors of |n| in ascending order with multiplicity;
// |n| ≤ 1 → [].
func Factorize(n int64) []int64 {
	m := absU64(n)
	out := []int64{}
	for _, p := range smallPrimes {
		for m%p == 0 {
			out = append(out, int64(p))
			m /= p
		}
	}
	var stack []uint64
	if m > 1 {
		stack = append(stack, m)
	}
	for len(stack) > 0 {
		v := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		if isPrimeU64(v) {
			out = append(out, int64(v))
			continue
		}
		d := pollardRhoU64(v)
		stack = append(stack, d, v/d)
	}
	slices.Sort(out)
	return out
}

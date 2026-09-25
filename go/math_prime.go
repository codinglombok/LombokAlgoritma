// LombokAlgoritma — Miller–Rabin, next prime, sieves (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "math"

// millerRabinWitnesses are the first 12 primes: deterministic for every n < 3.3·10²⁴.
var millerRabinWitnesses = [...]uint64{2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}

// IsPrime reports whether n is prime (deterministic Miller–Rabin with witnesses 2 … 37);
// n < 2 is not prime.
func IsPrime(n int64) bool {
	return n >= 2 && isPrimeU64(uint64(n))
}

func isPrimeU64(n uint64) bool {
	switch {
	case n < 2:
		return false
	case n == 2 || n == 3 || n == 5 || n == 7:
		return true
	case n%2 == 0 || n%3 == 0:
		return false
	}
	d := n - 1
	r := 0
	for d%2 == 0 {
		d /= 2
		r++
	}
	for _, a := range millerRabinWitnesses {
		if a >= n {
			continue
		}
		x := powMod(a, d, n)
		if x == 1 || x == n-1 {
			continue
		}
		composite := true
		for i := 0; i < r-1; i++ {
			x = mulMod(x, x, n)
			if x == n-1 {
				composite = false
				break
			}
		}
		if composite {
			return false
		}
	}
	return true
}

// NextPrime returns the smallest prime ≥ n (2 for n ≤ 2). OVERFLOW when that prime exceeds
// math.MaxInt64.
func NextPrime(n int64) (int64, error) {
	if n <= 2 {
		return 2, nil
	}
	c := n
	if c%2 == 0 {
		c++
	}
	for !isPrimeU64(uint64(c)) {
		if c > math.MaxInt64-2 {
			return 0, newErr(CodeOverflow, "NextPrime(%d) exceeds int64", n)
		}
		c += 2
	}
	return c, nil
}

// Sieve returns the primes ≤ n in ascending order (sieve of Eratosthenes).
func Sieve(n int) []int {
	primes := []int{}
	if n < 2 {
		return primes
	}
	composite := make([]bool, n+1)
	for i := 2; i*i <= n; i++ {
		if !composite[i] {
			for j := i * i; j <= n; j += i {
				composite[j] = true
			}
		}
	}
	for i := 2; i <= n; i++ {
		if !composite[i] {
			primes = append(primes, i)
		}
	}
	return primes
}

// SegmentedSieve returns the primes in [lo, hi] in ascending order.
func SegmentedSieve(lo, hi int) []int {
	primes := []int{}
	if hi < lo || hi < 2 {
		return primes
	}
	base := Sieve(int(math.Ceil(math.Sqrt(float64(hi)))))
	composite := make([]bool, hi-lo+1)
	for _, p := range base {
		start := max(p*p, ceilDivInt(lo, p)*p)
		for j := start; j <= hi; j += p {
			composite[j-lo] = true
		}
	}
	for i, c := range composite {
		if !c && lo+i > 1 {
			primes = append(primes, lo+i)
		}
	}
	return primes
}

// ceilDivInt returns ⌈a / b⌉ for b > 0.
func ceilDivInt(a, b int) int {
	q := a / b
	if a%b != 0 && a > 0 {
		q++
	}
	return q
}

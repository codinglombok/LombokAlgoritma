// LombokAlgoritma — math tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"math"
	"math/big"
	"testing"
)

func TestGCDLCM(t *testing.T) {
	assertEqual(t, GCD(12, 18), uint64(6))
	assertEqual(t, GCD(-12, 0), uint64(12))
	assertEqual(t, GCD(0, 0), uint64(0))
	assertEqual(t, GCD(math.MinInt64, 0), uint64(1)<<63)
	assertEqual(t, must(LCM(-4, 6)), uint64(12))
	assertEqual(t, must(LCM(0, 6)), uint64(0))
	_, err := LCM(math.MaxInt64, math.MaxInt64-1)
	assertCode(t, err, CodeOverflow)
}

func TestExtendedGCDAndInverse(t *testing.T) {
	for _, c := range [][2]int64{{240, 46}, {-12, 18}, {17, 5}, {0, 7}, {7, 0}} {
		g, x, y := ExtendedGCD(c[0], c[1])
		if c[0]*x+c[1]*y != g {
			t.Errorf("egcd(%d,%d) = %d,%d,%d", c[0], c[1], g, x, y)
		}
	}
	assertEqual(t, must(ModInverse(-3, 11)), int64(7))
	_, err := ModInverse(6, 9)
	assertCode(t, err, CodeNoInverse)
	_, err = ModInverse(3, 0)
	assertCode(t, err, CodeOutOfRange)
}

func TestModPowCRT(t *testing.T) {
	assertEqual(t, must(ModPow(-2, 3, 5)), int64(2))
	assertEqual(t, must(ModPow(5, 3, 1)), int64(0))
	assertEqual(t, must(ModPow(123456789123, 987654321, 9223372036854775783)), int64(3224504524924993594))
	_, err := ModPow(2, 1, 0)
	assertCode(t, err, CodeOutOfRange)

	assertEqual(t, must(CRT([]int64{2, 3, 2}, []int64{3, 5, 7})), int64(23))
	assertEqual(t, must(CRT(nil, nil)), int64(0))
	_, err = CRT([]int64{1}, []int64{3, 5})
	assertCode(t, err, CodeInvalidInput)
	_, err = CRT([]int64{1, 1}, []int64{4, 6})
	assertCode(t, err, CodeNotCoprime)
	_, err = CRT([]int64{1}, []int64{0})
	assertCode(t, err, CodeOutOfRange)
	_, err = CRT([]int64{1, 2, 3}, []int64{9223372036854775783, 1000000007, 998244353})
	assertCode(t, err, CodeOverflow)
}

func TestPrimes(t *testing.T) {
	for _, p := range []int64{2, 3, 5, 7, 11, 7919, 1000000007, 9223372036854775783} {
		if !IsPrime(p) {
			t.Errorf("%d is prime", p)
		}
	}
	for _, c := range []int64{-7, 0, 1, 4, 9, 91, 561, 3215031751, 4759123141, math.MaxInt64} {
		if IsPrime(c) {
			t.Errorf("%d is not prime", c)
		}
	}
	assertEqual(t, must(NextPrime(-5)), int64(2))
	assertEqual(t, must(NextPrime(14)), int64(17))
	assertEqual(t, must(NextPrime(9223372036854775700)), int64(9223372036854775783))
	_, err := NextPrime(9223372036854775784)
	assertCode(t, err, CodeOverflow)
	assertEqual(t, Sieve(1), []int{})
	assertEqual(t, Sieve(20), []int{2, 3, 5, 7, 11, 13, 17, 19})
	assertEqual(t, SegmentedSieve(-10, 12), []int{2, 3, 5, 7, 11})
	assertEqual(t, SegmentedSieve(20, 10), []int{})
	assertEqual(t, SegmentedSieve(90, 110), []int{97, 101, 103, 107, 109})
}

func TestFactorize(t *testing.T) {
	assertEqual(t, Factorize(-360), []int64{2, 2, 2, 3, 3, 5})
	assertEqual(t, Factorize(1), []int64{})
	assertEqual(t, Factorize(1000000016000000063), []int64{1000000007, 1000000009})
	assertEqual(t, Factorize(1681*1681), []int64{41, 41, 41, 41})
	d := must(PollardRho(1000000016000000063))
	if d != 1000000007 && d != 1000000009 {
		t.Errorf("PollardRho = %d", d)
	}
	assertEqual(t, must(PollardRho(10)), int64(2))
	for _, n := range []int64{1, 3, 97} {
		_, err := PollardRho(n)
		assertCode(t, err, CodeInvalidInput)
	}
}

func TestKaratsuba(t *testing.T) {
	x, _ := new(big.Int).SetString("123456789012345678901234567890", 10)
	y, _ := new(big.Int).SetString("-987654321098765432109876543210", 10)
	assertEqual(t, Karatsuba(x, y).String(), new(big.Int).Mul(x, y).String())
	assertEqual(t, Karatsuba(big.NewInt(-12), big.NewInt(-12)).Int64(), int64(144))
}

func TestNTT(t *testing.T) {
	assertEqual(t, must(NTT([]int64{1, 2, 3, 4})), []int64{10, 173167434, 998244351, 825076915})
	_, err := NTT([]int64{1, 2, 3})
	assertCode(t, err, CodeInvalidInput)
	_, err = NTT(nil)
	assertCode(t, err, CodeInvalidInput)
	_, err = nttWith(make([]int64, 8), 13, 2) // 8 ∤ 12
	assertCode(t, err, CodeInvalidInput)
	assertEqual(t, must(PolyMulNTT([]int64{1, 2, 3}, []int64{4, 5})), []int64{4, 13, 22, 15})
	assertEqual(t, must(PolyMulNTT(nil, nil)), []int64{})
	_, err = PolyMulNTT(make([]int64, 1<<23), make([]int64, 2))
	assertCode(t, err, CodeInvalidInput)
}

func TestMatrices(t *testing.T) {
	a := Matrix{{1, 2}, {3, 4}}
	b := Matrix{{5, 6}, {7, 8}}
	want := Matrix{{19, 22}, {43, 50}}
	assertEqual(t, must(MatMul(a, b)), want)
	assertEqual(t, must(Strassen(a, b)), want)
	_, err := MatMul(Matrix{{1, 2}}, Matrix{{1, 2}})
	assertCode(t, err, CodeInvalidInput)
	_, err = MatMul(Matrix{{1, 2}}, Matrix{{1}, {2, 3}})
	assertCode(t, err, CodeInvalidInput)
	assertEqual(t, must(MatMul(Matrix{}, Matrix{})), Matrix{})
	_, err = Strassen(Matrix{{1, 2}}, Matrix{{1, 2}})
	assertCode(t, err, CodeInvalidInput)
	_, err = Strassen(Matrix{{1, 2}, {3}}, a)
	assertCode(t, err, CodeInvalidInput)
	assertEqual(t, must(Strassen(Matrix{}, Matrix{})), Matrix{})
	for _, n := range []int{3, 65, 128} {
		x, y := newMatrix(n, n), newMatrix(n, n)
		for i := 0; i < n; i++ {
			for j := 0; j < n; j++ {
				x[i][j] = float64((i*7+j*3)%11 - 5)
				y[i][j] = float64((i*5+j*2)%13 - 6)
			}
		}
		assertEqual(t, must(Strassen(x, y)), must(MatMul(x, y)))
	}
}

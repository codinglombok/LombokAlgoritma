// LombokAlgoritma — modular exponentiation and the Chinese remainder theorem (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"math/big"
	"math/bits"
)

// mulMod returns a·b mod m with a 128-bit intermediate (m ≥ 1).
func mulMod(a, b, m uint64) uint64 {
	hi, lo := bits.Mul64(a, b)
	return bits.Rem64(hi, lo, m)
}

// powMod returns base^exp mod m for m ≥ 1 by right-to-left square-and-multiply.
func powMod(base, exp, m uint64) uint64 {
	result := uint64(1) % m
	base %= m
	for exp > 0 {
		if exp&1 == 1 {
			result = mulMod(result, base, m)
		}
		exp >>= 1
		base = mulMod(base, base, m)
	}
	return result
}

// ModPow returns base^exp mod m in [0, m); a negative base is reduced into [0, m) first.
// m < 1 or exp < 0 yields OUT_OF_RANGE. Intermediates use 128 bits.
func ModPow(base, exp, m int64) (int64, error) {
	if m < 1 || exp < 0 {
		return 0, newErr(CodeOutOfRange, "ModPow: need m ≥ 1 and exp ≥ 0")
	}
	return int64(powMod(uint64(floorMod(base, m)), uint64(exp), uint64(m))), nil
}

// CRT returns the unique x in [0, M), M = Π mᵢ, with x ≡ rᵢ (mod mᵢ). Different lengths yield
// INVALID_INPUT, a zero modulus OUT_OF_RANGE, non-coprime moduli NOT_COPRIME and a result that
// does not fit in int64 OVERFLOW. Computed with math/big, following SPEC §10 step by step.
func CRT(remainders, moduli []int64) (int64, error) {
	if len(remainders) != len(moduli) {
		return 0, newErr(CodeInvalidInput, "CRT: remainders and moduli must have equal length")
	}
	bigM := big.NewInt(1)
	for _, m := range moduli {
		if m == 0 {
			return 0, newErr(CodeOutOfRange, "CRT: modulus must be non-zero")
		}
		bigM.Mul(bigM, big.NewInt(m))
	}
	x := new(big.Int)
	for i, m := range moduli {
		mi := big.NewInt(m)
		bigMi := new(big.Int).Quo(bigM, mi)
		g, inv, _ := bigExtGCD(new(big.Int).Rem(bigMi, mi), mi)
		if g.CmpAbs(big.NewInt(1)) != 0 {
			return 0, newErr(CodeNotCoprime, "CRT: moduli must be pairwise coprime")
		}
		invMi := bigFloorMod(inv, mi)
		ri := bigFloorMod(big.NewInt(remainders[i]), mi)
		t := new(big.Int).Mul(ri, bigMi)
		t.Rem(t, bigM)
		t.Mul(t, invMi)
		x.Add(x, t)
		x.Rem(x, bigM)
	}
	x = bigFloorMod(x, bigM)
	if !x.IsInt64() {
		return 0, newErr(CodeOverflow, "CRT: result exceeds int64")
	}
	return x.Int64(), nil
}

// bigFloorMod returns ((a rem m) + m) rem m, i.e. the reference's normalisation.
func bigFloorMod(a, m *big.Int) *big.Int {
	r := new(big.Int).Rem(a, m)
	r.Add(r, m)
	return r.Rem(r, m)
}

// bigExtGCD is ExtendedGCD over big.Int (truncated division): a·x + b·y = g.
func bigExtGCD(a, b *big.Int) (g, x, y *big.Int) {
	if b.Sign() == 0 {
		return new(big.Int).Set(a), big.NewInt(1), big.NewInt(0)
	}
	q, r := new(big.Int).QuoRem(a, b, new(big.Int))
	g, x1, y1 := bigExtGCD(b, r)
	y = new(big.Int).Mul(q, y1)
	y.Sub(x1, y)
	return g, y1, y
}

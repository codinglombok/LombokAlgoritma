// LombokAlgoritma — Karatsuba multiplication (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "math/big"

var bigThousand = big.NewInt(1000)

// Karatsuba returns x·y computed by Karatsuba's divide-and-conquer on decimal halves (only the
// value is normative). The arguments are not modified.
func Karatsuba(x, y *big.Int) *big.Int {
	if x.Sign() < 0 {
		return new(big.Int).Neg(Karatsuba(new(big.Int).Neg(x), y))
	}
	if y.Sign() < 0 {
		return new(big.Int).Neg(Karatsuba(x, new(big.Int).Neg(y)))
	}
	if x.Cmp(bigThousand) < 0 || y.Cmp(bigThousand) < 0 {
		return new(big.Int).Mul(x, y)
	}
	n := max(len(x.String()), len(y.String()))
	half := int64((n + 1) / 2)
	b := new(big.Int).Exp(big.NewInt(10), big.NewInt(half), nil)
	x1, x0 := new(big.Int).QuoRem(x, b, new(big.Int))
	y1, y0 := new(big.Int).QuoRem(y, b, new(big.Int))
	z0 := Karatsuba(x0, y0)
	z2 := Karatsuba(x1, y1)
	z1 := Karatsuba(new(big.Int).Add(x0, x1), new(big.Int).Add(y0, y1))
	z1.Sub(z1, z2)
	z1.Sub(z1, z0)
	r := new(big.Int).Mul(z2, b)
	r.Mul(r, b)
	r.Add(r, z1.Mul(z1, b))
	return r.Add(r, z0)
}

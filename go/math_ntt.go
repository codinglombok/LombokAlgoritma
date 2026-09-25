// LombokAlgoritma — number-theoretic transform and polynomial multiplication (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// NTT parameters: 998244353 = 119·2^23 + 1 with primitive root 3.
const (
	NTTMod  int64 = 998244353
	NTTRoot int64 = 3
)

// NTT returns the forward transform Aₖ = Σⱼ aⱼ·ωʲᵏ mod p (natural order), p = NTTMod,
// ω = 3^((p−1)/n). The length must be a power of two dividing p − 1, else INVALID_INPUT.
// Coefficients are expected in (−2^62, 2^62); they are reduced as the transform proceeds.
func NTT(a []int64) ([]int64, error) { return nttWith(a, NTTMod, NTTRoot) }

func nttWith(a []int64, mod, g int64) ([]int64, error) {
	n := len(a)
	if n == 0 || n&(n-1) != 0 {
		return nil, newErr(CodeInvalidInput, "NTT: length must be a power of two")
	}
	if (mod-1)%int64(n) != 0 {
		return nil, newErr(CodeInvalidInput, "NTT: length must divide mod − 1")
	}
	r := append([]int64(nil), a...)
	for i, j := 1, 0; i < n; i++ {
		bit := n >> 1
		for ; j&bit != 0; bit >>= 1 {
			j ^= bit
		}
		j ^= bit
		if i < j {
			r[i], r[j] = r[j], r[i]
		}
	}
	um := uint64(mod)
	for length := 2; length <= n; length <<= 1 {
		w := int64(powMod(uint64(g), uint64((mod-1)/int64(length)), um))
		half := length / 2
		for i := 0; i < n; i += length {
			wn := int64(1)
			for j := 0; j < half; j++ {
				u := r[i+j]
				v := r[i+j+half] * wn % mod
				r[i+j] = (u + v) % mod
				r[i+j+half] = (u - v + mod) % mod
				wn = wn * w % mod
			}
		}
	}
	return r, nil
}

// PolyMulNTT returns the coefficients of a·b mod NTTMod (length |a| + |b| − 1).
func PolyMulNTT(a, b []int64) ([]int64, error) {
	n := 1
	for n < len(a)+len(b) {
		n <<= 1
	}
	fa := make([]int64, n)
	fb := make([]int64, n)
	copy(fa, a)
	copy(fb, b)
	ta, err := NTT(fa)
	if err != nil {
		return nil, err
	}
	tb, _ := NTT(fb) // same length as fa: cannot fail when NTT(fa) succeeded
	for i := range ta {
		ta[i] = ta[i] * tb[i] % NTTMod
	}
	um := uint64(NTTMod)
	gInv := int64(powMod(uint64(NTTRoot), um-2, um))
	tc, _ := nttWith(ta, NTTMod, gInv)
	nInv := int64(powMod(uint64(n), um-2, um))
	for i := range tc {
		tc[i] = tc[i] * nInv % NTTMod
	}
	return tc[:max(0, len(a)+len(b)-1)], nil
}

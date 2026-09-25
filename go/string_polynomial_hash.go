// LombokAlgoritma — polynomial rolling hash over code points (SPEC §11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// Default parameters of PolynomialHash.
const (
	DefaultPolyHashBase int64 = 31
	DefaultPolyHashMod  int64 = 1_000_000_007
)

// PolynomialHash returns h in [0, mod) by Horner's rule over code points:
// h = ((h·base + (cp − 96)) mod m + m) mod m. The reference evaluates in float64, so
// (mod − 1)·|base| + 0x10FFFF must stay below 2^53 (exact in int64 here). mod < 1 yields
// OUT_OF_RANGE.
func PolynomialHash(s string, base, mod int64) (int64, error) {
	if mod < 1 {
		return 0, newErr(CodeOutOfRange, "PolynomialHash: mod must be ≥ 1")
	}
	var h int64
	for _, ch := range s {
		h = ((h*base+(int64(ch)-96))%mod + mod) % mod
	}
	return h, nil
}

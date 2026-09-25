// LombokAlgoritma — HyperLogLog cardinality estimator (SPEC §8.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"math"
	"math/bits"
)

// HyperLogLog estimates the number of distinct items with 2^b one-byte registers.
type HyperLogLog struct {
	registers []byte
	b         int
}

// NewHyperLogLog returns an estimator with precision b clamped to [4, 16] (m = 2^b registers).
func NewHyperLogLog(b int) *HyperLogLog {
	b = min(16, max(4, b))
	return &HyperLogLog{registers: make([]byte, 1<<b), b: b}
}

// Precision returns b.
func (h *HyperLogLog) Precision() int { return h.b }

// Add records item: x = fmix32(FNV-1a-32(UTF-8(item))), register index = top b bits,
// ρ = leading zeros of the remaining bits + 1 (32 − b + 1 when they are all zero).
func (h *HyperLogLog) Add(item string) {
	x := fmix32(FNV1a32([]byte(item)))
	j := x >> (32 - h.b)
	w := x << h.b
	rho := byte(32 - h.b + 1)
	if w != 0 {
		rho = byte(bits.LeadingZeros32(w) + 1)
	}
	if rho > h.registers[j] {
		h.registers[j] = rho
	}
}

// Count returns the rounded cardinality estimate: E = ((α·m)·m)/Z with Z = Σ 2^(−reg[i]);
// linear counting m·ln(m/V) when E ≤ 2.5·m and V registers are zero; the large-range correction
// −2^32·ln(1 − E/2^32) when E > 2^32/30. Rounded half up.
func (h *HyperLogLog) Count() int64 {
	m := float64(len(h.registers))
	var alpha float64
	switch len(h.registers) {
	case 16:
		alpha = 0.673
	case 32:
		alpha = 0.697
	case 64:
		alpha = 0.709
	default:
		alpha = 0.7213 / (1 + 1.079/m)
	}
	sum := 0.0
	zeros := 0
	for _, r := range h.registers {
		sum += math.Ldexp(1, -int(r))
		if r == 0 {
			zeros++
		}
	}
	estimate := float64(float64(alpha*m)*m) / sum
	if estimate <= 2.5*m {
		if zeros > 0 {
			estimate = m * math.Log(m/float64(zeros))
		}
	} else if estimate > (1<<32)/30.0 {
		estimate = -(1 << 32) * math.Log(1-estimate/(1<<32))
	}
	return int64(roundHalfUp(estimate))
}

// roundHalfUp is ECMAScript Math.round for finite x.
func roundHalfUp(x float64) float64 {
	f := math.Floor(x)
	if x-f >= 0.5 {
		return f + 1
	}
	return f
}

// Registers returns a copy of the 2^b registers in index order (SPEC §8.2).
func (h *HyperLogLog) Registers() []byte { return append([]byte(nil), h.registers...) }

// Merge returns the union estimator (register-wise maximum); a different precision yields
// INVALID_INPUT.
func (h *HyperLogLog) Merge(other *HyperLogLog) (*HyperLogLog, error) {
	if h.b != other.b {
		return nil, newErr(CodeInvalidInput, "HyperLogLog.Merge: different precision")
	}
	r := NewHyperLogLog(h.b)
	for i := range r.registers {
		r.registers[i] = max(h.registers[i], other.registers[i])
	}
	return r, nil
}

// LombokAlgoritma — deterministic PRNGs: SplitMix64, xoshiro256++, PCG32 (SPEC §5)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//
// These generators are NOT suitable for secrets (use crypto/rand).

package lombokalgoritma

import "math/bits"

// Default seeds (SPEC §5.2, §5.3).
const (
	DefaultXoshiroSeed    uint64 = 0x123456789abcdef0
	DefaultPcg32InitState uint64 = 0x853c49e6748fea9b
	DefaultPcg32InitSeq   uint64 = 0xda3e39cb94b95bdb
)

// SplitMix64 (Steele, Lea, Flood 2014) — used to expand a 64-bit seed into generator state.
type SplitMix64 struct {
	x uint64
}

// NewSplitMix64 returns a SplitMix64 whose state is seed.
func NewSplitMix64(seed uint64) *SplitMix64 { return &SplitMix64{x: seed} }

// Next returns the next 64-bit output.
func (s *SplitMix64) Next() uint64 {
	s.x += 0x9e3779b97f4a7c15
	z := s.x
	z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9
	z = (z ^ (z >> 27)) * 0x94d049bb133111eb
	return z ^ (z >> 31)
}

// Xoshiro256pp is xoshiro256++ (Blackman & Vigna), state seeded with four SplitMix64 outputs.
type Xoshiro256pp struct {
	s [4]uint64
}

// NewXoshiro256pp seeds a generator from seed (see DefaultXoshiroSeed).
func NewXoshiro256pp(seed uint64) *Xoshiro256pp {
	sm := NewSplitMix64(seed)
	g := &Xoshiro256pp{}
	for i := range g.s {
		g.s[i] = sm.Next()
	}
	return g
}

// Next returns the next 64-bit output.
func (g *Xoshiro256pp) Next() uint64 {
	s := &g.s
	result := bits.RotateLeft64(s[0]+s[3], 23) + s[0]
	t := s[1] << 17
	s[2] ^= s[0]
	s[3] ^= s[1]
	s[1] ^= s[2]
	s[0] ^= s[3]
	s[2] ^= t
	s[3] = bits.RotateLeft64(s[3], 45)
	return result
}

// NextFloat returns a float in [0, 1): (Next() >> 11) / 2^53 (exact).
func (g *Xoshiro256pp) NextFloat() float64 {
	return float64(g.Next()>>11) / (1 << 53)
}

// NextInt returns an unbiased integer in [0, n) by rejection sampling, 1 ≤ n ≤ 2^53 − 1.
// Any other n yields an OUT_OF_RANGE error.
func (g *Xoshiro256pp) NextInt(n int64) (int64, error) {
	if n < 1 || n > maxSafeInt {
		return 0, newErr(CodeOutOfRange, "NextInt: n must be in [1, 2^53)")
	}
	un := uint64(n)
	threshold := (-un) % un // 2^64 mod n
	for {
		r := g.Next()
		if r >= threshold {
			return int64(r % un), nil
		}
	}
}

// Pcg32 is PCG-XSH-RR 64/32 as in pcg-c's pcg32_srandom_r (O'Neill 2014).
type Pcg32 struct {
	state uint64
	inc   uint64
}

// NewPcg32 seeds a generator with initState and initSeq (see the DefaultPcg32* constants).
func NewPcg32(initState, initSeq uint64) *Pcg32 {
	p := &Pcg32{inc: initSeq<<1 | 1}
	p.step()
	p.state += initState
	p.step()
	return p
}

func (p *Pcg32) step() { p.state = p.state*6364136223846793005 + p.inc }

// Next returns the next 32-bit output.
func (p *Pcg32) Next() uint32 {
	old := p.state
	p.step()
	xs := uint32(((old >> 18) ^ old) >> 27)
	rot := int(old >> 59)
	return bits.RotateLeft32(xs, -rot)
}

// NextBounded returns an unbiased integer in [0, bound) (pcg32_boundedrand_r); bound = 0 yields
// an OUT_OF_RANGE error.
func (p *Pcg32) NextBounded(bound uint32) (uint32, error) {
	if bound == 0 {
		return 0, newErr(CodeOutOfRange, "NextBounded: bound must be in [1, 2^32)")
	}
	threshold := -bound % bound
	for {
		r := p.Next()
		if r >= threshold {
			return r % bound, nil
		}
	}
}

// NextFloat returns Next() / 2^32, a float in [0, 1) with 32 bits of precision.
func (p *Pcg32) NextFloat() float64 {
	return float64(p.Next()) / (1 << 32)
}

// maxSafeInt is 2^53 − 1 (ECMAScript Number.MAX_SAFE_INTEGER).
const maxSafeInt = 1<<53 - 1

// LombokAlgoritma — Bloom filter with Kirsch–Mitzenmacher double hashing (SPEC §8.1)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"math"
	"math/bits"
)

// BloomFilter is a space-efficient probabilistic set: no false negatives.
// Positions: h1 = FNV-1a-32(item), h2 = MurmurHash3_x86_32(item, 0x9747b28c) over the UTF-8
// bytes; pos_i = (h1 + i·h2) mod m for i = 0 … k−1; bit p is bit p mod 8 (LSB first) of byte ⌊p/8⌋.
type BloomFilter struct {
	bits []byte
	m    uint64
	k    int
}

const bloomMurmurSeed = 0x9747b28c

// NewBloomFilterWithParams returns a filter with exactly m bits (1 ≤ m < 2^32) and k hash
// functions (1 ≤ k ≤ 64); anything else yields OUT_OF_RANGE. This constructor is portable.
func NewBloomFilterWithParams(m int64, k int) (*BloomFilter, error) {
	if m < 1 || m >= 1<<32 || k < 1 || k > 64 {
		return nil, newErr(CodeOutOfRange, "BloomFilter: need 1 ≤ m < 2^32 and 1 ≤ k ≤ 64")
	}
	return &BloomFilter{bits: make([]byte, (m+7)/8), m: uint64(m), k: k}, nil
}

// NewBloomFilter sizes a filter for expectedItems at falsePositiveRate:
// m = ⌈−n·ln p / ln²2⌉, k = max(1, round(m/n·ln 2)). These use math.Log and are NOT normative
// across ports; use NewBloomFilterWithParams for portable filters.
func NewBloomFilter(expectedItems int, falsePositiveRate float64) (*BloomFilter, error) {
	if expectedItems < 1 || !(falsePositiveRate > 0 && falsePositiveRate < 1) {
		return nil, newErr(CodeOutOfRange, "BloomFilter: need expectedItems ≥ 1 and 0 < p < 1")
	}
	n := float64(expectedItems)
	m := math.Ceil(-n * math.Log(falsePositiveRate) / (math.Ln2 * math.Ln2))
	k := max(1, int(math.Floor(m/n*math.Ln2+0.5)))
	return NewBloomFilterWithParams(int64(m), min(k, 64))
}

func (f *BloomFilter) positions(item []byte, fn func(p uint64) bool) bool {
	h1 := uint64(FNV1a32(item))
	h2 := uint64(MurmurHash3(item, bloomMurmurSeed))
	for i := 0; i < f.k; i++ {
		if !fn((h1 + uint64(i)*h2) % f.m) {
			return false
		}
	}
	return true
}

// Add inserts item (its UTF-8 bytes).
func (f *BloomFilter) Add(item string) { f.AddBytes([]byte(item)) }

// AddBytes inserts a byte string.
func (f *BloomFilter) AddBytes(item []byte) {
	f.positions(item, func(p uint64) bool {
		f.bits[p>>3] |= 1 << (p & 7)
		return true
	})
}

// Has reports false when item is definitely absent and true when it is probably present.
func (f *BloomFilter) Has(item string) bool { return f.HasBytes([]byte(item)) }

// HasBytes is Has for a byte string.
func (f *BloomFilter) HasBytes(item []byte) bool {
	return f.positions(item, func(p uint64) bool { return f.bits[p>>3]>>(p&7)&1 == 1 })
}

// SetBits returns the number of set bits.
func (f *BloomFilter) SetBits() int {
	c := 0
	for _, b := range f.bits {
		c += bits.OnesCount8(b)
	}
	return c
}

// EstimatedFPR returns (setBits / m)^k.
func (f *BloomFilter) EstimatedFPR() float64 {
	return math.Pow(float64(f.SetBits())/float64(f.m), float64(f.k))
}

// Bytes returns a copy of the bit array (SPEC §8.1 layout).
func (f *BloomFilter) Bytes() []byte { return append([]byte(nil), f.bits...) }

// Size returns m, the number of bits.
func (f *BloomFilter) Size() uint64 { return f.m }

// HashCount returns k, the number of hash functions.
func (f *BloomFilter) HashCount() int { return f.k }

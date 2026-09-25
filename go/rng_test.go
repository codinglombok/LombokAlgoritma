// LombokAlgoritma — PRNG tests (reference values: splitmix64.c, xoshiro256plusplus.c, pcg-c demo)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "testing"

func TestSplitMix64Reference(t *testing.T) {
	r := NewSplitMix64(0)
	for _, want := range []uint64{0xe220a8397b1dcdaf, 0x6e789e6aa1b965f4, 0x06c45d188009454f} {
		if got := r.Next(); got != want {
			t.Errorf("got %016x want %016x", got, want)
		}
	}
}

func TestXoshiro256pp(t *testing.T) {
	r := NewXoshiro256pp(0)
	if got := r.Next(); got != 0x53175d61490b23df {
		t.Errorf("first output %016x", got)
	}
	f := NewXoshiro256pp(DefaultXoshiroSeed).NextFloat()
	if f < 0 || f >= 1 {
		t.Errorf("NextFloat %v outside [0,1)", f)
	}
	g := NewXoshiro256pp(1)
	for _, n := range []int64{1, 2, 7, maxSafeInt} {
		v := must(g.NextInt(n))
		if v < 0 || v >= n {
			t.Errorf("NextInt(%d) = %d", n, v)
		}
	}
	for _, n := range []int64{0, -1, maxSafeInt + 1} {
		_, err := g.NextInt(n)
		assertCode(t, err, CodeOutOfRange)
	}
}

func TestPcg32Demo(t *testing.T) {
	r := NewPcg32(42, 54)
	for _, want := range []uint32{0xa15c02b7, 0x7b47f409, 0xba1d3330} {
		if got := r.Next(); got != want {
			t.Errorf("got %08x want %08x", got, want)
		}
	}
	d := NewPcg32(DefaultPcg32InitState, DefaultPcg32InitSeq)
	if f := d.NextFloat(); f < 0 || f >= 1 {
		t.Errorf("NextFloat %v", f)
	}
	for _, b := range []uint32{1, 3, 1 << 31, 0xffffffff} {
		if v := must(d.NextBounded(b)); v >= b {
			t.Errorf("NextBounded(%d) = %d", b, v)
		}
	}
	_, err := d.NextBounded(0)
	assertCode(t, err, CodeOutOfRange)
}

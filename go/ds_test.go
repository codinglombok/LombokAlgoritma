// LombokAlgoritma — data structure tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"fmt"
	"math"
	"testing"
)

func TestBloomFilter(t *testing.T) {
	f := must(NewBloomFilter(1000, 0.01))
	if f.Size() < 9000 || f.HashCount() < 1 {
		t.Errorf("m=%d k=%d", f.Size(), f.HashCount())
	}
	for i := 0; i < 1000; i++ {
		f.Add(fmt.Sprint("item-", i))
	}
	for i := 0; i < 1000; i++ {
		if !f.Has(fmt.Sprint("item-", i)) {
			t.Fatal("false negative")
		}
	}
	if fpr := f.EstimatedFPR(); fpr <= 0 || fpr > 0.05 {
		t.Errorf("EstimatedFPR = %v", fpr)
	}
	g := must(NewBloomFilterWithParams(64, 3))
	g.AddBytes([]byte{1, 2, 3})
	if !g.HasBytes([]byte{1, 2, 3}) || g.SetBits() == 0 || len(g.Bytes()) != 8 {
		t.Error("bytes API")
	}
	for _, c := range []struct {
		m int64
		k int
	}{{0, 1}, {-1, 1}, {1 << 32, 1}, {8, 0}, {8, 65}} {
		_, err := NewBloomFilterWithParams(c.m, c.k)
		assertCode(t, err, CodeOutOfRange)
	}
	_, err := NewBloomFilter(0, 0.1)
	assertCode(t, err, CodeOutOfRange)
	_, err = NewBloomFilter(10, 1)
	assertCode(t, err, CodeOutOfRange)
}

func TestHyperLogLog(t *testing.T) {
	assertEqual(t, NewHyperLogLog(1).Precision(), 4)
	assertEqual(t, NewHyperLogLog(30).Precision(), 16)
	for _, b := range []int{5, 6, 12} {
		h := NewHyperLogLog(b)
		for i := 0; i < 20000; i++ {
			h.Add(fmt.Sprint("x", i))
		}
		if e := h.Count(); math.Abs(float64(e)-20000) > 20000*0.3 {
			t.Errorf("b=%d estimate %d", b, e)
		}
	}
	a, b := NewHyperLogLog(10), NewHyperLogLog(10)
	a.Add("x")
	b.Add("y")
	m := must(a.Merge(b))
	assertEqual(t, m.Count(), int64(2))
	_, err := a.Merge(NewHyperLogLog(11))
	assertCode(t, err, CodeInvalidInput)
	// saturated registers exercise the large-range correction
	sat := NewHyperLogLog(4)
	for i := range sat.registers {
		sat.registers[i] = 28
	}
	if sat.Count() <= 1<<32/30 {
		t.Error("large-range correction")
	}
	assertEqual(t, roundHalfUp(2.5), 3.0)
	assertEqual(t, roundHalfUp(2.4999), 2.0)
}

func TestDisjointSet(t *testing.T) {
	ds := NewDisjointSet(6)
	if !ds.Union(0, 1) || !ds.Union(2, 3) || !ds.Union(1, 3) || ds.Union(0, 2) {
		t.Error("union results")
	}
	ds.Union(4, 5)
	ds.Union(5, 0) // rank(4-root) < rank(0-root)
	assertEqual(t, ds.Count(), 1)
	if !ds.Connected(4, 2) {
		t.Error("connected")
	}
	assertEqual(t, NewDisjointSet(-3).Count(), 0)
}

func TestFenwickAndSegmentTree(t *testing.T) {
	vals := []int64{5, -2, 7, 0, 3}
	ft := NewFenwickTree(vals)
	assertEqual(t, ft.Len(), 5)
	assertEqual(t, ft.PrefixSum(3), int64(10))
	assertEqual(t, ft.PrefixSum(99), int64(13))
	assertEqual(t, ft.PrefixSum(0), int64(0))
	ft.Update(2, 10)
	ft.Update(0, 100) // ignored
	ft.Update(9, 100) // ignored
	assertEqual(t, ft.PointQuery(2), int64(8))
	assertEqual(t, ft.RangeSum(2, 4), int64(15))

	st := NewSegmentTree(vals)
	assertEqual(t, st.Query(0, 4), int64(13))
	st.Update(1, 3, 2)
	assertEqual(t, st.Query(1, 1), int64(0))
	assertEqual(t, st.Query(0, 4), int64(19))
	assertEqual(t, st.Query(3, 2), int64(0))
	empty := NewSegmentTree(nil)
	empty.Update(0, 0, 1)
	assertEqual(t, empty.Query(0, 0), int64(0))
}

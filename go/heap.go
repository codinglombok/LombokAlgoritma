// LombokAlgoritma — binary min-heap used by the graph algorithms and Huffman coding
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// minHeap is an array-backed binary min-heap ordered by less. Every caller uses a total
// lexicographic key (SPEC §9.0), so the pop order does not depend on the heap implementation.
type minHeap[T any] struct {
	items []T
	less  func(a, b T) bool
}

func newMinHeap[T any](less func(a, b T) bool) *minHeap[T] {
	return &minHeap[T]{less: less}
}

func (h *minHeap[T]) len() int { return len(h.items) }

func (h *minHeap[T]) push(x T) {
	a := append(h.items, x)
	i := len(a) - 1
	for i > 0 {
		p := (i - 1) >> 1
		if !h.less(a[i], a[p]) {
			break
		}
		a[i], a[p] = a[p], a[i]
		i = p
	}
	h.items = a
}

// pop removes and returns the minimum; ok is false when the heap is empty.
func (h *minHeap[T]) pop() (top T, ok bool) {
	a := h.items
	if len(a) == 0 {
		return top, false
	}
	top = a[0]
	last := len(a) - 1
	a[0] = a[last]
	a = a[:last]
	i := 0
	for {
		l := 2*i + 1
		r := l + 1
		m := i
		if l < len(a) && h.less(a[l], a[m]) {
			m = l
		}
		if r < len(a) && h.less(a[r], a[m]) {
			m = r
		}
		if m == i {
			break
		}
		a[i], a[m] = a[m], a[i]
		i = m
	}
	h.items = a
	return top, true
}

// tupleLess is lexicographic < on equal-length float tuples.
func tupleLess(a, b []float64) bool {
	for i := range a {
		if a[i] != b[i] {
			return a[i] < b[i]
		}
	}
	return false
}

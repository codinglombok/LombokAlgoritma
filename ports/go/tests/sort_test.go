// LombokAlgoritma — Go Sort Tests
// Apache-2.0 — @codinglombok
package tests

import (
	"reflect"
	"testing"
	la "github.com/codinglombok/lombokalgoritma/lombokalgoritma"
)

func TestTimsortEmpty(t *testing.T)    { assertEqual(t, la.Timsort([]int{}), []int{}) }
func TestTimsortSingle(t *testing.T)   { assertEqual(t, la.Timsort([]int{42}), []int{42}) }
func TestTimsortSorted(t *testing.T)   { assertEqual(t, la.Timsort([]int{1,2,3,4,5}), []int{1,2,3,4,5}) }
func TestTimsortReverse(t *testing.T)  { assertEqual(t, la.Timsort([]int{5,4,3,2,1}), []int{1,2,3,4,5}) }
func TestTimsortDupes(t *testing.T)    { assertEqual(t, la.Timsort([]int{3,1,2,1,3}), []int{1,1,2,3,3}) }
func TestTimsortNeg(t *testing.T)      { assertEqual(t, la.Timsort([]int{-3,-1,0,2,-2}), []int{-3,-2,-1,0,2}) }

func TestQuicksortBasic(t *testing.T)  { assertEqual(t, la.Quicksort([]int{5,3,1,4,2}), []int{1,2,3,4,5}) }
func TestMergesortBasic(t *testing.T)  { assertEqual(t, la.Mergesort([]int{5,3,1,4,2}), []int{1,2,3,4,5}) }
func TestRadixSortLSD(t *testing.T) {
	assertEqual(t,
		la.RadixSortLSD([]uint32{170,45,75,90,802,24,2,66}),
		[]uint32{2,24,45,66,75,90,170,802},
	)
}

func assertEqual[T any](t *testing.T, got, want T) {
	t.Helper()
	if !reflect.DeepEqual(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

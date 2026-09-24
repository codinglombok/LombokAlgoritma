// LombokAlgoritma — Go String Tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"reflect"
	"testing"
)

func TestKMPSearch(t *testing.T) {
	got := KMPSearch("abcabcabc", "abc")
	want := []int{0, 3, 6}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}
func TestKMPNoMatch(t *testing.T) {
	if KMPSearch("hello", "xyz") != nil {
		t.Error("expected nil")
	}
}
func TestLevenshtein(t *testing.T) {
	cases := []struct {
		a, b string
		want int
	}{
		{"", "", 0}, {"a", "", 1}, {"kitten", "sitting", 3}, {"hello", "hello", 0},
	}
	for _, c := range cases {
		if got := Levenshtein(c.a, c.b); got != c.want {
			t.Errorf("levenshtein(%q,%q) = %d, want %d", c.a, c.b, got, c.want)
		}
	}
}
func TestFNV1a32Deterministic(t *testing.T) {
	a := FNV1a32([]byte("hello"))
	b := FNV1a32([]byte("hello"))
	if a != b {
		t.Error("FNV1a32 not deterministic")
	}
}
func TestFNV1a32Different(t *testing.T) {
	if FNV1a32([]byte("hello")) == FNV1a32([]byte("world")) {
		t.Error("FNV1a32 collision on hello/world")
	}
}

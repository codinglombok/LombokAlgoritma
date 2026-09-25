// LombokAlgoritma — string algorithm tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"math"
	"testing"
)

func TestKMP(t *testing.T) {
	assertEqual(t, KMPSearch("abcabcabc", "abc"), []int{0, 3, 6})
	assertEqual(t, KMPSearch("😀a😀a", "😀a"), []int{0, 2})
	assertEqual(t, KMPSearch("hello", ""), []int{})
	assertEqual(t, KMPSearch("hello", "xyz"), []int{})
}

func TestEditDistances(t *testing.T) {
	for _, c := range []struct {
		a, b    string
		lev, dl int
	}{
		{"", "", 0, 0}, {"a", "", 1, 1}, {"", "ab", 2, 2}, {"kitten", "sitting", 3, 3},
		{"ca", "abc", 3, 2}, {"😀x", "x😀", 2, 1}, {"abcdef", "abc", 3, 3},
	} {
		if got := Levenshtein(c.a, c.b); got != c.lev {
			t.Errorf("Levenshtein(%q,%q) = %d, want %d", c.a, c.b, got, c.lev)
		}
		if got := DamerauLevenshtein(c.a, c.b); got != c.dl {
			t.Errorf("DamerauLevenshtein(%q,%q) = %d, want %d", c.a, c.b, got, c.dl)
		}
	}
}

func TestJaro(t *testing.T) {
	near := func(a, b float64) bool { return math.Abs(a-b) < 1e-12 }
	if !near(Jaro("MARTHA", "MARHTA"), 0.9444444444444445) || Jaro("", "") != 1 || Jaro("a", "") != 0 {
		t.Error("Jaro")
	}
	if !near(JaroWinkler("MARTHA", "MARHTA", DefaultJaroWinklerPrefixScale), 0.9611111111111111) {
		t.Error("JaroWinkler")
	}
	if Jaro("abc", "xyz") != 0 {
		t.Error("no matches")
	}
}

func TestAhoCorasick(t *testing.T) {
	ac := NewAhoCorasick()
	for _, p := range []string{"he", "she", "his", "hers", ""} {
		ac.AddPattern(p)
	}
	assertEqual(t, ac.Search("ahishers"), []AhoCorasickMatch{{"his", 1}, {"she", 3}, {"he", 4}, {"hers", 4}})
	ac.AddPattern("sh") // forces a rebuild
	assertEqual(t, len(ac.Search("ahishers")), 5)
	ac.Build()
	assertEqual(t, ac.Search("xyz"), []AhoCorasickMatch{})
}

func TestPolynomialHash(t *testing.T) {
	assertEqual(t, must(PolynomialHash("abc", DefaultPolyHashBase, DefaultPolyHashMod)), int64(1026))
	assertEqual(t, must(PolynomialHash("\"", 31, 7)), int64(1)) // (34 − 96) mod 7 normalised
	_, err := PolynomialHash("a", 31, 0)
	assertCode(t, err, CodeOutOfRange)
}

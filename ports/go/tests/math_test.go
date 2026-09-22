// LombokAlgoritma — Go Math Tests
// Apache-2.0 — @codinglombok
package tests

import (
	"math/big"
	"testing"
	la "github.com/codinglombok/lombokalgoritma/lombokalgoritma"
)

func TestSHA256Empty(t *testing.T) {
	got := la.SHA256Hex([]byte(""))
	want := "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
	if got != want { t.Errorf("got %s, want %s", got, want) }
}
func TestSHA256Deterministic(t *testing.T) {
	if la.SHA256Hex([]byte("test")) != la.SHA256Hex([]byte("test")) { t.Error("not deterministic") }
}
func TestGCD(t *testing.T) {
	if la.GCD(12, 8) != 4 { t.Error("gcd(12,8) should be 4") }
	if la.GCD(0, 5) != 5 { t.Error("gcd(0,5) should be 5") }
}
func TestLCM(t *testing.T) {
	if la.LCM(4, 6) != 12 { t.Error("lcm(4,6) should be 12") }
}
func TestModPow(t *testing.T) {
	got := la.ModPow(big.NewInt(2), big.NewInt(10), big.NewInt(1000))
	if got.Int64() != 24 { t.Errorf("modpow got %d, want 24", got.Int64()) }
}
func TestIsPrime(t *testing.T) {
	if !la.IsPrime(big.NewInt(97)) { t.Error("97 should be prime") }
	if la.IsPrime(big.NewInt(100)) { t.Error("100 should not be prime") }
}
func TestHKDF(t *testing.T) {
	okm := la.HKDF(make([]byte, 22), 42, nil, nil)
	if len(okm) != 42 { t.Errorf("hkdf length got %d, want 42", len(okm)) }
	okm2 := la.HKDF(make([]byte, 22), 42, nil, nil)
	for i, b := range okm {
		if b != okm2[i] { t.Error("hkdf not deterministic"); break }
	}
}

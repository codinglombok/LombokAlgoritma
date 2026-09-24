// LombokAlgoritma — Go Math Tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"encoding/hex"
	"math/big"
	"strings"
	"testing"
)

func TestSHA256Empty(t *testing.T) {
	got := SHA256Hex([]byte(""))
	want := "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
	if got != want {
		t.Errorf("got %s, want %s", got, want)
	}
}
func TestSHA256Deterministic(t *testing.T) {
	if SHA256Hex([]byte("test")) != SHA256Hex([]byte("test")) {
		t.Error("not deterministic")
	}
}
func TestGCD(t *testing.T) {
	if GCD(12, 8) != 4 {
		t.Error("gcd(12,8) should be 4")
	}
	if GCD(0, 5) != 5 {
		t.Error("gcd(0,5) should be 5")
	}
}
func TestLCM(t *testing.T) {
	if LCM(4, 6) != 12 {
		t.Error("lcm(4,6) should be 12")
	}
}
func TestModPow(t *testing.T) {
	got := ModPow(big.NewInt(2), big.NewInt(10), big.NewInt(1000))
	if got.Int64() != 24 {
		t.Errorf("modpow got %d, want 24", got.Int64())
	}
}
func TestIsPrime(t *testing.T) {
	if !IsPrime(big.NewInt(97)) {
		t.Error("97 should be prime")
	}
	if IsPrime(big.NewInt(100)) {
		t.Error("100 should not be prime")
	}
}
func TestHKDF(t *testing.T) {
	okm := HKDF(make([]byte, 22), 42, nil, nil)
	if len(okm) != 42 {
		t.Errorf("hkdf length got %d, want 42", len(okm))
	}
	okm2 := HKDF(make([]byte, 22), 42, nil, nil)
	for i, b := range okm {
		if b != okm2[i] {
			t.Error("hkdf not deterministic")
			break
		}
	}
}

func TestSHA256FIPS180_4(t *testing.T) {
	cases := []struct{ in, want string }{
		{"abc", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"},
		{"abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq", "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1"},
		{"abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu", "cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1"},
		{strings.Repeat("a", 1_000_000), "cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0"},
	}
	for _, c := range cases {
		if got := SHA256Hex([]byte(c.in)); got != c.want {
			t.Errorf("SHA256(len %d) = %s, want %s", len(c.in), got, c.want)
		}
	}
}

func TestHKDFRFC5869Case1(t *testing.T) {
	ikm, _ := hex.DecodeString("0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b")
	salt, _ := hex.DecodeString("000102030405060708090a0b0c")
	info, _ := hex.DecodeString("f0f1f2f3f4f5f6f7f8f9")
	want := "3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865"
	if got := hex.EncodeToString(HKDF(ikm, 42, salt, info)); got != want {
		t.Errorf("HKDF = %s, want %s", got, want)
	}
	defer func() {
		if recover() == nil {
			t.Error("HKDF with length > 255*32 must panic")
		}
	}()
	HKDF(ikm, 255*32+1, salt, info)
}

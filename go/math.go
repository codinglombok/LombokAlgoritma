// LombokAlgoritma — Go Math Module
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"math/big"
)

// SHA256 returns a 32-byte hash of data.
//
// Deprecated: moved to lombokencryptdecrypt; removed in v0.2.0.
func SHA256(data []byte) [32]byte {
	return sha256.Sum256(data)
}

// SHA256Hex returns the hex-encoded SHA-256 hash.
//
// Deprecated: moved to lombokencryptdecrypt; removed in v0.2.0.
func SHA256Hex(data []byte) string {
	h := sha256.Sum256(data)
	return hex.EncodeToString(h[:])
}

// HMACSHA256 returns HMAC-SHA-256 of data with key.
//
// Deprecated: moved to lombokencryptdecrypt; removed in v0.2.0.
func HMACSHA256(key, data []byte) []byte {
	mac := hmac.New(sha256.New, key)
	mac.Write(data)
	return mac.Sum(nil)
}

// HKDF — RFC 5869 extract-and-expand key derivation (SHA-256). It panics if
// length is negative or exceeds 255*32 bytes (RFC 5869 §2.3).
//
// Deprecated: moved to lombokencryptdecrypt; removed in v0.2.0.
func HKDF(ikm []byte, length int, salt, info []byte) []byte {
	if length < 0 || length > 255*sha256.Size {
		panic("lombokalgoritma: HKDF length out of range")
	}
	if salt == nil {
		salt = make([]byte, 32)
	}
	if info == nil {
		info = []byte{}
	}
	prk := HMACSHA256(salt, ikm)
	okm := make([]byte, 0, length)
	prev := []byte{}
	for i := 1; len(okm) < length; i++ {
		block := make([]byte, 0, len(prev)+len(info)+1)
		block = append(append(append(block, prev...), info...), byte(i))
		prev = HMACSHA256(prk, block)
		okm = append(okm, prev...)
	}
	return okm[:length]
}

// GCD returns the greatest common divisor of a and b.
func GCD(a, b uint64) uint64 {
	for b != 0 {
		a, b = b, a%b
	}
	return a
}

// LCM returns the least common multiple.
func LCM(a, b uint64) uint64 {
	if a == 0 || b == 0 {
		return 0
	}
	return a / GCD(a, b) * b
}

// ModPow computes base^exp mod m using big.Int for arbitrary precision.
func ModPow(base, exp, m *big.Int) *big.Int {
	return new(big.Int).Exp(base, exp, m)
}

// IsPrime reports whether n is prime using math/big ProbablyPrime(20)
// (20 Miller-Rabin rounds + Baillie-PSW; exact for n < 2^64).
func IsPrime(n *big.Int) bool {
	return n.ProbablyPrime(20)
}

// ModInverse returns a^(-1) mod m, or nil if it doesn't exist.
func ModInverse(a, m *big.Int) *big.Int {
	return new(big.Int).ModInverse(a, m)
}

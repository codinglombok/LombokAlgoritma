// Package lombokalgoritma — Go Math Module
// Apache-2.0 — @codinglombok
package lombokalgoritma

import (
	"crypto/sha256"
	"crypto/hmac"
	"encoding/hex"
	"math/big"
)

// SHA256 returns a 32-byte hash of data.
func SHA256(data []byte) [32]byte {
	return sha256.Sum256(data)
}

// SHA256Hex returns the hex-encoded SHA-256 hash.
func SHA256Hex(data []byte) string {
	h := sha256.Sum256(data)
	return hex.EncodeToString(h[:])
}

// HMACSHA256 returns HMAC-SHA-256 of data with key.
func HMACSHA256(key, data []byte) []byte {
	mac := hmac.New(sha256.New, key)
	mac.Write(data)
	return mac.Sum(nil)
}

// HKDF — RFC 5869 extract-and-expand key derivation.
func HKDF(ikm []byte, length int, salt, info []byte) []byte {
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
		block := append(append(prev, info...), byte(i))
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

// IsPrime uses Miller-Rabin primality test (deterministic for n < 3.3×10^24).
func IsPrime(n *big.Int) bool {
	return n.ProbablyPrime(20)
}

// ModInverse returns a^(-1) mod m, or nil if it doesn't exist.
func ModInverse(a, m *big.Int) *big.Int {
	return new(big.Int).ModInverse(a, m)
}

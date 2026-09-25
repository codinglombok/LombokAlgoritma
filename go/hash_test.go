// LombokAlgoritma — non-cryptographic hash tests (reference values from the official specs)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "testing"

func TestHashReferenceValues(t *testing.T) {
	assertEqual(t, FNV1a32([]byte("a")), uint32(0xe40c292c))
	assertEqual(t, FNV1a64([]byte("a")), uint64(0xaf63dc4c8601ec8c))
	assertEqual(t, MurmurHash3([]byte(""), 0), uint32(0))
	assertEqual(t, MurmurHash3([]byte("abc"), 0), uint32(0xb3dd93fa))
	assertEqual(t, MurmurHash3([]byte("ab"), 0), uint32(0x9bbfd75f))
	assertEqual(t, MurmurHash3([]byte("abcd"), 0x9747b28c), uint32(0xf0478627))
	assertEqual(t, XXHash32(nil, 0), uint32(0x02cc5d05))
	assertEqual(t, XXHash64(nil, 0), uint64(0xef46db3751d8e999))
	long := make([]byte, 100)
	for i := range long {
		long[i] = byte(i)
	}
	if XXHash32(long, 1) == XXHash32(long, 2) || XXHash64(long, 1) == XXHash64(long, 2) {
		t.Error("seed must matter")
	}
}

func TestSipHash24(t *testing.T) {
	key := make([]byte, 16)
	msg := make([]byte, 15)
	for i := range key {
		key[i] = byte(i)
	}
	for i := range msg {
		msg[i] = byte(i)
	}
	// SipHash paper, Appendix A: 64-bit output a129ca6149be45e5 (little-endian bytes)
	assertEqual(t, must(SipHash24(key, msg)), uint64(0xa129ca6149be45e5))
	_, err := SipHash24(key[:8], msg)
	assertCode(t, err, CodeInvalidInput)
}

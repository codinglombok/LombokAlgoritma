// LombokAlgoritma — SipHash-2-4 (Aumasson & Bernstein 2012), SPEC §12
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//
// SipHash is a keyed PRF for hash-table DoS resistance, NOT a protocol MAC. Cryptography lives in
// LombokEncryptDecrypt (ADR-016).

package lombokalgoritma

import (
	"encoding/binary"
	"math/bits"
)

// SipHash24 returns SipHash-2-4 of data under a 16-byte key (k0 = key[0:8], k1 = key[8:16],
// little-endian); the 8-byte little-endian output is returned as a uint64. A key that is not
// 16 bytes long yields INVALID_INPUT.
func SipHash24(key, data []byte) (uint64, error) {
	if len(key) != 16 {
		return 0, newErr(CodeInvalidInput, "SipHash24: key must be 16 bytes, got %d", len(key))
	}
	k0 := binary.LittleEndian.Uint64(key)
	k1 := binary.LittleEndian.Uint64(key[8:])
	v0 := k0 ^ 0x736f6d6570736575
	v1 := k1 ^ 0x646f72616e646f6d
	v2 := k0 ^ 0x6c7967656e657261
	v3 := k1 ^ 0x7465646279746573
	round := func() {
		v0 += v1
		v1 = bits.RotateLeft64(v1, 13) ^ v0
		v0 = bits.RotateLeft64(v0, 32)
		v2 += v3
		v3 = bits.RotateLeft64(v3, 16) ^ v2
		v0 += v3
		v3 = bits.RotateLeft64(v3, 21) ^ v0
		v2 += v1
		v1 = bits.RotateLeft64(v1, 17) ^ v2
		v2 = bits.RotateLeft64(v2, 32)
	}
	n := len(data)
	end := n - n%8
	for i := 0; i < end; i += 8 {
		w := binary.LittleEndian.Uint64(data[i:])
		v3 ^= w
		round()
		round()
		v0 ^= w
	}
	last := uint64(n&0xff) << 56
	for i := 0; i < n%8; i++ {
		last |= uint64(data[end+i]) << (8 * i)
	}
	v3 ^= last
	round()
	round()
	v0 ^= last
	v2 ^= 0xff
	round()
	round()
	round()
	round()
	return v0 ^ v1 ^ v2 ^ v3, nil
}

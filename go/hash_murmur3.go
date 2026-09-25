// LombokAlgoritma — MurmurHash3_x86_32 (Austin Appleby), SPEC §12
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"encoding/binary"
	"math/bits"
)

// MurmurHash3 returns MurmurHash3_x86_32 of data with a 32-bit seed.
func MurmurHash3(data []byte, seed uint32) uint32 {
	const c1, c2 = 0xcc9e2d51, 0x1b873593
	h := seed
	n := len(data)
	nblocks := n / 4
	for i := 0; i < nblocks; i++ {
		k := binary.LittleEndian.Uint32(data[4*i:])
		k *= c1
		k = bits.RotateLeft32(k, 15)
		k *= c2
		h ^= k
		h = bits.RotateLeft32(h, 13)
		h = h*5 + 0xe6546b64
	}
	tail := data[4*nblocks:]
	var k uint32
	switch len(tail) {
	case 3:
		k ^= uint32(tail[2]) << 16
		fallthrough
	case 2:
		k ^= uint32(tail[1]) << 8
		fallthrough
	case 1:
		k ^= uint32(tail[0])
		k *= c1
		k = bits.RotateLeft32(k, 15)
		k *= c2
		h ^= k
	}
	h ^= uint32(n)
	return fmix32(h)
}

// fmix32 is the MurmurHash3 32-bit finaliser.
func fmix32(h uint32) uint32 {
	h ^= h >> 16
	h *= 0x85ebca6b
	h ^= h >> 13
	h *= 0xc2b2ae35
	h ^= h >> 16
	return h
}

// LombokAlgoritma — xxHash32 (XXH32, github.com/Cyan4973/xxHash doc/xxhash_spec.md), SPEC §12
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"encoding/binary"
	"math/bits"
)

const (
	xxP32_1 uint32 = 0x9e3779b1
	xxP32_2 uint32 = 0x85ebca77
	xxP32_3 uint32 = 0xc2b2ae3d
	xxP32_4 uint32 = 0x27d4eb2f
	xxP32_5 uint32 = 0x165667b1
)

func xxh32Round(acc, lane uint32) uint32 {
	return bits.RotateLeft32(acc+lane*xxP32_2, 13) * xxP32_1
}

// XXHash32 returns XXH32 of data with a 32-bit seed.
func XXHash32(data []byte, seed uint32) uint32 {
	n := len(data)
	i := 0
	var h uint32
	if n >= 16 {
		v1 := seed + xxP32_1 + xxP32_2
		v2 := seed + xxP32_2
		v3 := seed
		v4 := seed - xxP32_1
		for ; i <= n-16; i += 16 {
			v1 = xxh32Round(v1, binary.LittleEndian.Uint32(data[i:]))
			v2 = xxh32Round(v2, binary.LittleEndian.Uint32(data[i+4:]))
			v3 = xxh32Round(v3, binary.LittleEndian.Uint32(data[i+8:]))
			v4 = xxh32Round(v4, binary.LittleEndian.Uint32(data[i+12:]))
		}
		h = bits.RotateLeft32(v1, 1) + bits.RotateLeft32(v2, 7) + bits.RotateLeft32(v3, 12) + bits.RotateLeft32(v4, 18)
	} else {
		h = seed + xxP32_5
	}
	h += uint32(n)
	for ; i+4 <= n; i += 4 {
		h += binary.LittleEndian.Uint32(data[i:]) * xxP32_3
		h = bits.RotateLeft32(h, 17) * xxP32_4
	}
	for ; i < n; i++ {
		h += uint32(data[i]) * xxP32_5
		h = bits.RotateLeft32(h, 11) * xxP32_1
	}
	h ^= h >> 15
	h *= xxP32_2
	h ^= h >> 13
	h *= xxP32_3
	h ^= h >> 16
	return h
}

// LombokAlgoritma — xxHash64 (XXH64, github.com/Cyan4973/xxHash doc/xxhash_spec.md), SPEC §12
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"encoding/binary"
	"math/bits"
)

const (
	xxP64_1 uint64 = 0x9e3779b185ebca87
	xxP64_2 uint64 = 0xc2b2ae3d27d4eb4f
	xxP64_3 uint64 = 0x165667b19e3779f9
	xxP64_4 uint64 = 0x85ebca77c2b2ae63
	xxP64_5 uint64 = 0x27d4eb2f165667c5
)

func xxh64Round(acc, lane uint64) uint64 {
	return bits.RotateLeft64(acc+lane*xxP64_2, 31) * xxP64_1
}

func xxh64MergeRound(acc, val uint64) uint64 {
	return (acc^xxh64Round(0, val))*xxP64_1 + xxP64_4
}

// XXHash64 returns XXH64 of data with a 64-bit seed.
func XXHash64(data []byte, seed uint64) uint64 {
	n := len(data)
	i := 0
	var h uint64
	if n >= 32 {
		v1 := seed + xxP64_1 + xxP64_2
		v2 := seed + xxP64_2
		v3 := seed
		v4 := seed - xxP64_1
		for ; i <= n-32; i += 32 {
			v1 = xxh64Round(v1, binary.LittleEndian.Uint64(data[i:]))
			v2 = xxh64Round(v2, binary.LittleEndian.Uint64(data[i+8:]))
			v3 = xxh64Round(v3, binary.LittleEndian.Uint64(data[i+16:]))
			v4 = xxh64Round(v4, binary.LittleEndian.Uint64(data[i+24:]))
		}
		h = bits.RotateLeft64(v1, 1) + bits.RotateLeft64(v2, 7) + bits.RotateLeft64(v3, 12) + bits.RotateLeft64(v4, 18)
		h = xxh64MergeRound(h, v1)
		h = xxh64MergeRound(h, v2)
		h = xxh64MergeRound(h, v3)
		h = xxh64MergeRound(h, v4)
	} else {
		h = seed + xxP64_5
	}
	h += uint64(n)
	for ; i+8 <= n; i += 8 {
		h ^= xxh64Round(0, binary.LittleEndian.Uint64(data[i:]))
		h = bits.RotateLeft64(h, 27)*xxP64_1 + xxP64_4
	}
	if i+4 <= n {
		h ^= uint64(binary.LittleEndian.Uint32(data[i:])) * xxP64_1
		h = bits.RotateLeft64(h, 23)*xxP64_2 + xxP64_3
		i += 4
	}
	for ; i < n; i++ {
		h ^= uint64(data[i]) * xxP64_5
		h = bits.RotateLeft64(h, 11) * xxP64_1
	}
	h ^= h >> 33
	h *= xxP64_2
	h ^= h >> 29
	h *= xxP64_3
	h ^= h >> 32
	return h
}

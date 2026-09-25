// LombokAlgoritma — FNV-1a 32/64-bit (Fowler–Noll–Vo, draft-eastlake-fnv), SPEC §12
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// FNV1a32 returns the 32-bit FNV-1a hash of data (hash a string as its UTF-8 bytes).
func FNV1a32(data []byte) uint32 {
	h := uint32(0x811c9dc5)
	for _, b := range data {
		h ^= uint32(b)
		h *= 0x01000193
	}
	return h
}

// FNV1a64 returns the 64-bit FNV-1a hash of data.
func FNV1a64(data []byte) uint64 {
	h := uint64(0xcbf29ce484222325)
	for _, b := range data {
		h ^= uint64(b)
		h *= 0x00000100000001b3
	}
	return h
}

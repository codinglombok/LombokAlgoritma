// LombokAlgoritma — byte run-length encoding (SPEC §13.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// RLEEncode encodes data as (count, value) byte pairs with 1 ≤ count ≤ 255 (longer runs split).
func RLEEncode(data []byte) []byte {
	out := []byte{}
	for i := 0; i < len(data); {
		v := data[i]
		run := 1
		for i+run < len(data) && data[i+run] == v && run < 255 {
			run++
		}
		out = append(out, byte(run), v)
		i += run
	}
	return out
}

// RLEDecode inverts RLEEncode; an odd length or a zero count yields INVALID_INPUT.
func RLEDecode(data []byte) ([]byte, error) {
	if len(data)%2 != 0 {
		return nil, newErr(CodeInvalidInput, "RLEDecode: input length must be even")
	}
	out := []byte{}
	for i := 0; i < len(data); i += 2 {
		run := int(data[i])
		if run == 0 {
			return nil, newErr(CodeInvalidInput, "RLEDecode: zero run length at %d", i)
		}
		for j := 0; j < run; j++ {
			out = append(out, data[i+1])
		}
	}
	return out, nil
}

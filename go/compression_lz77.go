// LombokAlgoritma — LZ77 with a ≤ 255-byte window (SPEC §13.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// DefaultLZ77Window is the default (and maximum) LZ77 window size.
const DefaultLZ77Window = 255

// LZ77Compress emits tokens 00 literal or 01 offset length (3 ≤ length ≤ 255,
// 1 ≤ offset ≤ window; matches may overlap the current position). Greedy longest match; among
// equally long matches the largest offset (earliest start) wins. window ∉ [1, 255] yields
// OUT_OF_RANGE.
func LZ77Compress(data []byte, window int) ([]byte, error) {
	if window < 1 || window > 255 {
		return nil, newErr(CodeOutOfRange, "LZ77Compress: window must be in [1, 255]")
	}
	out := []byte{}
	for i := 0; i < len(data); {
		bestLen, bestOff := 0, 0
		for j := max(0, i-window); j < i; j++ {
			l := 0
			for i+l < len(data) && data[j+l] == data[i+l] && l < 255 {
				l++
			}
			if l > bestLen {
				bestLen, bestOff = l, i-j
			}
		}
		if bestLen >= 3 {
			out = append(out, 1, byte(bestOff), byte(bestLen))
			i += bestLen
		} else {
			out = append(out, 0, data[i])
			i++
		}
	}
	return out, nil
}

// LZ77Decompress inverts LZ77Compress. A flag ∉ {0, 1}, a truncated token, offset 0 or an
// offset beyond the output yields INVALID_INPUT.
func LZ77Decompress(data []byte) ([]byte, error) {
	out := []byte{}
	for i := 0; i < len(data); {
		flag := data[i]
		i++
		switch flag {
		case 0:
			if i >= len(data) {
				return nil, newErr(CodeInvalidInput, "LZ77Decompress: truncated literal")
			}
			out = append(out, data[i])
			i++
		case 1:
			if i+1 >= len(data) {
				return nil, newErr(CodeInvalidInput, "LZ77Decompress: truncated match")
			}
			off, length := int(data[i]), int(data[i+1])
			i += 2
			if off == 0 || off > len(out) {
				return nil, newErr(CodeInvalidInput, "LZ77Decompress: bad offset %d", off)
			}
			start := len(out) - off
			for j := 0; j < length; j++ {
				out = append(out, out[start+j])
			}
		default:
			return nil, newErr(CodeInvalidInput, "LZ77Decompress: bad token flag %d", flag)
		}
	}
	return out, nil
}

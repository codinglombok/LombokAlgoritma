// LombokAlgoritma — compression tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"bytes"
	"testing"
)

func TestRLE(t *testing.T) {
	data := append(bytes.Repeat([]byte{7}, 300), 1, 2, 2)
	enc := RLEEncode(data)
	assertEqual(t, enc, []byte{255, 7, 45, 7, 1, 1, 2, 2})
	assertEqual(t, must(RLEDecode(enc)), data)
	_, err := RLEDecode([]byte{3})
	assertCode(t, err, CodeInvalidInput)
	_, err = RLEDecode([]byte{0, 65})
	assertCode(t, err, CodeInvalidInput)
}

func TestLZ77(t *testing.T) {
	data := []byte("abracadabra abracadabra abracadabra")
	for _, w := range []int{1, 4, 16, DefaultLZ77Window} {
		enc := must(LZ77Compress(data, w))
		assertEqual(t, must(LZ77Decompress(enc)), data)
	}
	for _, w := range []int{0, 256} {
		_, err := LZ77Compress(data, w)
		assertCode(t, err, CodeOutOfRange)
	}
	for _, bad := range [][]byte{{0}, {1, 1}, {1, 0, 3}, {0, 65, 1, 2, 3}, {2}} {
		_, err := LZ77Decompress(bad)
		assertCode(t, err, CodeInvalidInput)
	}
}

func TestHuffman(t *testing.T) {
	for _, data := range [][]byte{[]byte("abracadabra abracadabra"), []byte("AAA"), {0, 1, 2, 3, 4, 5, 6, 7}} {
		r := HuffmanEncode(data)
		assertEqual(t, must(HuffmanDecode(r.Encoded, r.BitLength, r.Tree)), data)
	}
	r := HuffmanEncode([]byte("AAA"))
	assertEqual(t, r.Codes, map[byte]string{'A': "0"})
	empty := HuffmanEncode(nil)
	assertEqual(t, empty.BitLength, 0)
	assertEqual(t, must(HuffmanDecode(nil, 0, empty.Tree)), []byte{})

	ab := HuffmanEncode([]byte("aab"))
	_, err := HuffmanDecode(ab.Encoded, 99, ab.Tree)
	assertCode(t, err, CodeInvalidInput)
	_, err = HuffmanDecode([]byte{0}, 1, nil)
	assertCode(t, err, CodeInvalidInput)
	three := HuffmanEncode([]byte("aaaabbc"))
	// a = "1", c = "00", b = "01": a single 0 bit is a truncated code
	_, err = HuffmanDecode([]byte{0x00}, 1, three.Tree)
	assertCode(t, err, CodeInvalidInput)
	broken := &HuffNode{Left: &HuffNode{IsLeaf: true, Symbol: 1}}
	_, err = HuffmanDecode([]byte{0x80}, 1, broken)
	assertCode(t, err, CodeInvalidInput)
}

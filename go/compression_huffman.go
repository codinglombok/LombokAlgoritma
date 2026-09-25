// LombokAlgoritma — static Huffman coding (SPEC §13.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// HuffNode is a Huffman tree node: a leaf has IsLeaf set and carries Symbol; an internal node
// has both children.
type HuffNode struct {
	Symbol      byte
	IsLeaf      bool
	Freq        int
	Left, Right *HuffNode
}

// HuffmanResult is the output of HuffmanEncode.
type HuffmanResult struct {
	// Encoded holds the code bits packed MSB-first; the last byte is zero-padded.
	Encoded []byte
	// BitLength is the number of meaningful bits in Encoded.
	BitLength int
	// Codes maps every symbol present to its code as a '0'/'1' string.
	Codes map[byte]string
	// Tree is the code tree (nil for empty input).
	Tree *HuffNode
}

type huffItem struct {
	freq, id int
	node     *HuffNode
}

// HuffmanEncode builds the normative Huffman code: leaves get ids 0, 1, … by ascending byte
// value, internal nodes the next ids in creation order; a min-heap keyed by (freq, id) pops left
// then right; left = '0', right = '1'; a single symbol gets code "0".
func HuffmanEncode(data []byte) HuffmanResult {
	codes := map[byte]string{}
	if len(data) == 0 {
		return HuffmanResult{Encoded: []byte{}, Codes: codes}
	}
	var freq [256]int
	for _, b := range data {
		freq[b]++
	}
	heap := newMinHeap(func(a, b huffItem) bool {
		return a.freq < b.freq || (a.freq == b.freq && a.id < b.id)
	})
	id := 0
	for s, f := range freq {
		if f > 0 {
			heap.push(huffItem{f, id, &HuffNode{Symbol: byte(s), IsLeaf: true, Freq: f}})
			id++
		}
	}
	for heap.len() > 1 {
		l, _ := heap.pop()
		r, _ := heap.pop()
		heap.push(huffItem{l.freq + r.freq, id, &HuffNode{Freq: l.freq + r.freq, Left: l.node, Right: r.node}})
		id++
	}
	root, _ := heap.pop()
	var walk func(n *HuffNode, code string)
	walk = func(n *HuffNode, code string) {
		if n.IsLeaf {
			if code == "" {
				code = "0"
			}
			codes[n.Symbol] = code
			return
		}
		walk(n.Left, code+"0")
		walk(n.Right, code+"1")
	}
	walk(root.node, "")
	bitLength := 0
	for _, b := range data {
		bitLength += len(codes[b])
	}
	encoded := make([]byte, (bitLength+7)/8)
	pos := 0
	for _, b := range data {
		for _, bit := range codes[b] {
			if bit == '1' {
				encoded[pos>>3] |= 1 << (7 - pos&7)
			}
			pos++
		}
	}
	return HuffmanResult{Encoded: encoded, BitLength: bitLength, Codes: codes, Tree: root.node}
}

// HuffmanDecode decodes bitLength bits of encoded with tree. bitLength beyond the input, an
// invalid code path or a truncated final code yields INVALID_INPUT.
func HuffmanDecode(encoded []byte, bitLength int, tree *HuffNode) ([]byte, error) {
	if bitLength < 0 || bitLength > len(encoded)*8 {
		return nil, newErr(CodeInvalidInput, "HuffmanDecode: bitLength exceeds input")
	}
	out := []byte{}
	if bitLength == 0 {
		return out, nil
	}
	if tree == nil {
		return nil, newErr(CodeInvalidInput, "HuffmanDecode: missing tree")
	}
	if tree.IsLeaf {
		for i := 0; i < bitLength; i++ {
			out = append(out, tree.Symbol)
		}
		return out, nil
	}
	node := tree
	for i := 0; i < bitLength; i++ {
		next := node.Left
		if encoded[i>>3]>>(7-i&7)&1 == 1 {
			next = node.Right
		}
		if next == nil {
			return nil, newErr(CodeInvalidInput, "HuffmanDecode: invalid code")
		}
		node = next
		if node.IsLeaf {
			out = append(out, node.Symbol)
			node = tree
		}
	}
	if node != tree {
		return nil, newErr(CodeInvalidInput, "HuffmanDecode: truncated code")
	}
	return out, nil
}

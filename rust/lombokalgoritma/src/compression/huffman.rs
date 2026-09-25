// LombokAlgoritma — static Huffman coding (SPEC §13.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::core::MinHeap;
use crate::{Error, Result};
use alloc::boxed::Box;
use alloc::string::String;
use alloc::vec;
use alloc::vec::Vec;

/// Huffman code tree.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum HuffNode {
    /// Tree of the empty input (no symbols).
    Empty,
    /// A symbol with its frequency.
    Leaf {
        /// Byte value.
        symbol: u8,
        /// Occurrences.
        freq: u64,
    },
    /// Internal node: `left` = bit 0, `right` = bit 1.
    Internal {
        /// `left.freq + right.freq`.
        freq: u64,
        /// Subtree for bit 0.
        left: Box<HuffNode>,
        /// Subtree for bit 1.
        right: Box<HuffNode>,
    },
}

/// Result of [`huffman_encode`].
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HuffmanResult {
    /// Code bits packed MSB-first; the last byte is zero-padded.
    pub encoded: Vec<u8>,
    /// Number of meaningful bits in `encoded`.
    pub bit_length: usize,
    /// `(byte, code)` of every symbol present, ascending by byte; codes are `'0'`/`'1'` strings.
    pub codes: Vec<(u8, String)>,
    /// The code tree (for [`huffman_decode`]).
    pub tree: HuffNode,
}

/// Static Huffman code, deterministic in every port: leaves get ids `0, 1, …` by ascending byte
/// value, internal nodes the next ids in creation order; a min-heap keyed by `(freq, id)` pops
/// `left` then `right`. Left = `0`, right = `1`; a single-symbol input uses code `"0"`.
pub fn huffman_encode(data: &[u8]) -> HuffmanResult {
    if data.is_empty() {
        return HuffmanResult {
            encoded: Vec::new(),
            bit_length: 0,
            codes: Vec::new(),
            tree: HuffNode::Empty,
        };
    }
    let mut freq = [0u64; 256];
    for &b in data {
        freq[usize::from(b)] += 1;
    }
    let mut heap = MinHeap::new(|a: &(u64, usize, HuffNode), b: &(u64, usize, HuffNode)| {
        (a.0, a.1) < (b.0, b.1)
    });
    let mut id = 0usize;
    for (s, &f) in freq.iter().enumerate() {
        if f > 0 {
            heap.push((
                f,
                id,
                HuffNode::Leaf {
                    symbol: s as u8,
                    freq: f,
                },
            ));
            id += 1;
        }
    }
    while heap.len() > 1 {
        let (Some((fl, _, left)), Some((fr, _, right))) = (heap.pop(), heap.pop()) else {
            break;
        };
        heap.push((
            fl + fr,
            id,
            HuffNode::Internal {
                freq: fl + fr,
                left: Box::new(left),
                right: Box::new(right),
            },
        ));
        id += 1;
    }
    let tree = heap.pop().map_or(HuffNode::Empty, |t| t.2);
    let mut table: Vec<Option<String>> = vec![None; 256];
    walk(&tree, &mut String::new(), &mut table);
    let bit_length: usize = data
        .iter()
        .map(|&b| table[usize::from(b)].as_ref().map_or(0, String::len))
        .sum();
    let mut encoded = vec![0u8; bit_length.div_ceil(8)];
    let mut pos = 0usize;
    for &b in data {
        if let Some(code) = &table[usize::from(b)] {
            for bit in code.bytes() {
                if bit == b'1' {
                    encoded[pos >> 3] |= 1 << (7 - (pos & 7));
                }
                pos += 1;
            }
        }
    }
    let codes = table
        .into_iter()
        .enumerate()
        .filter_map(|(s, c)| c.map(|c| (s as u8, c)))
        .collect();
    HuffmanResult {
        encoded,
        bit_length,
        codes,
        tree,
    }
}

fn walk(node: &HuffNode, prefix: &mut String, table: &mut [Option<String>]) {
    match node {
        HuffNode::Empty => {}
        HuffNode::Leaf { symbol, .. } => {
            table[usize::from(*symbol)] = Some(if prefix.is_empty() {
                String::from("0")
            } else {
                prefix.clone()
            });
        }
        HuffNode::Internal { left, right, .. } => {
            prefix.push('0');
            walk(left, prefix, table);
            prefix.pop();
            prefix.push('1');
            walk(right, prefix, table);
            prefix.pop();
        }
    }
}

/// Decode `bit_length` bits of `encoded` with `tree`.
///
/// # Errors
/// [`Error::InvalidInput`] when `bit_length` exceeds the input, a code is invalid, or the stream
/// ends inside a code.
pub fn huffman_decode(encoded: &[u8], bit_length: usize, tree: &HuffNode) -> Result<Vec<u8>> {
    if bit_length > encoded.len().saturating_mul(8) {
        return Err(Error::InvalidInput);
    }
    let mut out = Vec::new();
    if bit_length == 0 {
        return Ok(out);
    }
    match tree {
        HuffNode::Leaf { symbol, .. } => {
            out.resize(bit_length, *symbol);
            Ok(out)
        }
        HuffNode::Empty => Err(Error::InvalidInput),
        HuffNode::Internal { .. } => {
            let mut node = tree;
            for i in 0..bit_length {
                let bit = (encoded[i >> 3] >> (7 - (i & 7))) & 1;
                let HuffNode::Internal { left, right, .. } = node else {
                    return Err(Error::InvalidInput);
                };
                node = if bit == 1 { right } else { left };
                if let HuffNode::Leaf { symbol, .. } = node {
                    out.push(*symbol);
                    node = tree;
                }
            }
            if core::ptr::eq(node, tree) {
                Ok(out)
            } else {
                Err(Error::InvalidInput)
            }
        }
    }
}

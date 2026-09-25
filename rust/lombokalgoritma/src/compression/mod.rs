// LombokAlgoritma — lossless compression (SPEC §13.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Byte RLE, LZ77 and static Huffman coding. Decoders reject malformed streams with
//! [`crate::Error::InvalidInput`].
mod huffman;
mod lz77;
mod rle;

pub use huffman::{huffman_decode, huffman_encode, HuffNode, HuffmanResult};
pub use lz77::{lz77_compress, lz77_decompress, LZ77_MAX_WINDOW};
pub use rle::{rle_decode, rle_encode};

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Error;
    use alloc::string::String;
    use alloc::vec;
    use alloc::vec::Vec;

    fn sample() -> Vec<u8> {
        let mut v = b"abracadabra abracadabra".to_vec();
        v.extend(core::iter::repeat(7u8).take(600));
        v.extend((0..=255u8).cycle().take(700));
        v
    }

    #[test]
    fn rle() {
        assert!(rle_encode(&[]).is_empty());
        assert_eq!(rle_encode(b"AAAB"), [3, b'A', 1, b'B']);
        assert_eq!(rle_encode(&[0; 300]), [255, 0, 45, 0]);
        let s = sample();
        assert_eq!(rle_decode(&rle_encode(&s)), Ok(s));
        assert_eq!(rle_decode(&[3]), Err(Error::InvalidInput));
        assert_eq!(rle_decode(&[0, 0x41]), Err(Error::InvalidInput));
    }

    #[test]
    fn lz77() {
        assert_eq!(lz77_compress(&[], 255), Ok(vec![]));
        assert_eq!(lz77_compress(b"A", 255), Ok(vec![0, 0x41]));
        assert_eq!(lz77_compress(b"A", 0), Err(Error::OutOfRange));
        assert_eq!(lz77_compress(b"A", 256), Err(Error::OutOfRange));
        let s = sample();
        for w in [1usize, 3, 16, 255] {
            assert_eq!(
                lz77_decompress(&lz77_compress(&s, w).unwrap()),
                Ok(s.clone())
            );
        }
        assert_eq!(lz77_decompress(&[1, 1, 1]), Err(Error::InvalidInput));
        assert_eq!(lz77_decompress(&[2]), Err(Error::InvalidInput));
        assert_eq!(lz77_decompress(&[0]), Err(Error::InvalidInput));
        assert_eq!(lz77_decompress(&[0, 1, 1, 1]), Err(Error::InvalidInput));
        assert_eq!(lz77_decompress(&[0, 1, 1, 0, 3]), Err(Error::InvalidInput));
    }

    #[test]
    fn huffman() {
        let e = huffman_encode(&[]);
        assert_eq!(
            (e.bit_length, e.encoded.len(), e.tree.clone()),
            (0, 0, HuffNode::Empty)
        );
        assert_eq!(huffman_decode(&[], 0, &e.tree), Ok(vec![]));
        assert_eq!(huffman_decode(&[0], 1, &e.tree), Err(Error::InvalidInput));
        let one = huffman_encode(&[0x41]);
        assert_eq!(one.codes, vec![(0x41, String::from("0"))]);
        assert_eq!((one.bit_length, one.encoded.clone()), (1, vec![0]));
        assert_eq!(huffman_decode(&one.encoded, 1, &one.tree), Ok(vec![0x41]));
        let a = huffman_encode(b"abracadabra abracadabra");
        assert_eq!(a.bit_length, 52);
        assert_eq!(a.encoded, [0x6e, 0xb4, 0x6e, 0xa6, 0xeb, 0x46, 0xe0]);
        let codes: Vec<(u8, &str)> = a.codes.iter().map(|(b, c)| (*b, c.as_str())).collect();
        assert_eq!(
            codes,
            vec![
                (32, "1010"),
                (97, "0"),
                (98, "110"),
                (99, "1011"),
                (100, "100"),
                (114, "111")
            ]
        );
        let s = sample();
        let h = huffman_encode(&s);
        assert_eq!(huffman_decode(&h.encoded, h.bit_length, &h.tree), Ok(s));
        assert_eq!(
            huffman_decode(&h.encoded, h.encoded.len() * 8 + 1, &h.tree),
            Err(Error::InvalidInput)
        );
        // stream ends inside a code
        assert_eq!(
            huffman_decode(&a.encoded, 2, &a.tree),
            Err(Error::InvalidInput)
        );
        // invalid path: a Leaf reached through a non-internal node cannot happen with a valid tree,
        // but a tree whose child is Empty is rejected
        let broken = HuffNode::Internal {
            freq: 1,
            left: alloc::boxed::Box::new(HuffNode::Empty),
            right: alloc::boxed::Box::new(HuffNode::Leaf { symbol: 1, freq: 1 }),
        };
        assert_eq!(
            huffman_decode(&[0x00], 2, &broken),
            Err(Error::InvalidInput)
        );
    }
}

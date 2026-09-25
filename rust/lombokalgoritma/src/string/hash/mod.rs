// LombokAlgoritma — non-cryptographic hashes (SPEC §12)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Non-cryptographic hashes over bytes (hash a `&str` via `.as_bytes()`, i.e. UTF-8).
//! SHA-2, HMAC and HKDF were removed in v0.2.0 (ADR-016) → `lombokencryptdecrypt`.
mod fnv1a;
mod murmur3;
mod polynomial;
mod siphash;
mod xxhash32;
mod xxhash64;

pub use fnv1a::{fnv1a32, fnv1a64};
pub use murmur3::{fmix32, murmur3_32};
pub use polynomial::polynomial_hash;
pub use siphash::siphash24;
pub use xxhash32::xxhash32;
pub use xxhash64::xxhash64;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Error;
    const INPUTS: [&[u8]; 6] = [
        b"",
        b"a",
        b"abc",
        b"hello",
        b"abcdefghijklmnop",
        b"The quick brown fox jumps over the lazy dog",
    ];

    #[test]
    fn xxhash32_reference() {
        let s0 = [
            0x02cc_5d05,
            0x550d_7456,
            0x32d1_53ff,
            0xfb00_77f9,
            0x9d2d_8b62,
            0xe85e_a4de,
        ];
        let s1 = [
            0x0b2c_b792,
            0xf514_706f,
            0xaa3d_a8ff,
            0xfcff_fba9,
            0x7cfb_9556,
            0x234f_8471,
        ];
        for (i, inp) in INPUTS.iter().enumerate() {
            assert_eq!(xxhash32(inp, 0), s0[i]);
            assert_eq!(xxhash32(inp, 1), s1[i]);
        }
    }

    #[test]
    fn xxhash64_reference() {
        assert_eq!(xxhash64(b"", 0), 0xef46_db37_51d8_e999);
        assert_eq!(xxhash64(b"a", 0), 0xd24e_c4f1_a98c_6e5b);
        assert_eq!(xxhash64(b"abc", 0), 0x44bc_2cf5_ad77_0999);
        let long: alloc::vec::Vec<u8> = (0..=255u8).cycle().take(1000).collect();
        // all code paths: 32-byte stripes, 8-, 4- and 1-byte tails
        for n in [31usize, 32, 33, 36, 39, 40, 63, 64, 100, 1000] {
            assert_ne!(xxhash64(&long[..n], 0), xxhash64(&long[..n], 1));
        }
    }

    #[test]
    fn murmur3_reference() {
        let s0 = [
            0,
            0x3c25_69b2,
            0xb3dd_93fa,
            0x248b_fa47,
            0xe762_91ed,
            0x2e4f_f723,
        ];
        for (i, inp) in INPUTS.iter().enumerate() {
            assert_eq!(murmur3_32(inp, 0), s0[i]);
        }
        assert_eq!(murmur3_32(b"hello", 42), 0xe2db_d2e1);
    }

    #[test]
    fn fnv_reference() {
        assert_eq!(fnv1a32(b""), 0x811c_9dc5);
        assert_eq!(fnv1a32(b"a"), 0xe40c_292c);
        assert_eq!(fnv1a64(b""), 0xcbf2_9ce4_8422_2325);
        assert_eq!(fnv1a64(b"a"), 0xaf63_dc4c_8601_ec8c);
    }

    #[test]
    fn siphash_reference() {
        // SipHash paper, Appendix A: key 00..0f, message 00..0e → a129ca6149be45e5
        let key: alloc::vec::Vec<u8> = (0..16).collect();
        let msg: alloc::vec::Vec<u8> = (0..15).collect();
        assert_eq!(siphash24(&key, &msg), Ok(0xa129_ca61_49be_45e5));
        assert_eq!(siphash24(&key, b""), Ok(0x726f_db47_dd0e_0e31));
        assert_eq!(siphash24(&key[..15], b""), Err(Error::InvalidInput));
    }

    #[test]
    fn polynomial() {
        assert_eq!(polynomial_hash("", 31, 1_000_000_007), Ok(0));
        assert_eq!(polynomial_hash("a", 31, 1_000_000_007), Ok(1));
        assert_eq!(polynomial_hash("ab", 31, 1_000_000_007), Ok(33));
        assert_eq!(
            polynomial_hash("!", 31, 1_000_000_007),
            Ok(1_000_000_007 - 63)
        );
        assert_eq!(polynomial_hash("a", 31, 0), Err(Error::OutOfRange));
    }
}

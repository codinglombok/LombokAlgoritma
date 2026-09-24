//! Non-cryptographic string/byte hashes (bit-identical to the TypeScript reference).

/// FNV-1a, 32-bit.
pub fn fnv1a32(data: &[u8]) -> u32 {
    let mut h: u32 = 0x811c_9dc5;
    for &b in data {
        h ^= u32::from(b);
        h = h.wrapping_mul(0x0100_0193);
    }
    h
}

/// FNV-1a, 64-bit.
pub fn fnv1a64(data: &[u8]) -> u64 {
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;
    for &b in data {
        h ^= u64::from(b);
        h = h.wrapping_mul(0x0000_0100_0000_01b3);
    }
    h
}

/// `MurmurHash3_x86_32`.
pub fn murmur3_32(data: &[u8], seed: u32) -> u32 {
    const C1: u32 = 0xcc9e_2d51;
    const C2: u32 = 0x1b87_3593;
    let mut h = seed;
    let mut chunks = data.chunks_exact(4);
    for c in &mut chunks {
        let mut k = u32::from_le_bytes([c[0], c[1], c[2], c[3]]);
        k = k.wrapping_mul(C1).rotate_left(15).wrapping_mul(C2);
        h ^= k;
        h = h.rotate_left(13).wrapping_mul(5).wrapping_add(0xe654_6b64);
    }
    let tail = chunks.remainder();
    if !tail.is_empty() {
        let mut k = 0u32;
        for (i, &b) in tail.iter().enumerate() {
            k |= u32::from(b) << (8 * i);
        }
        h ^= k.wrapping_mul(C1).rotate_left(15).wrapping_mul(C2);
    }
    h ^= data.len() as u32;
    fmix32(h)
}

/// `MurmurHash3` 32-bit finalizer.
pub fn fmix32(mut h: u32) -> u32 {
    h ^= h >> 16;
    h = h.wrapping_mul(0x85eb_ca6b);
    h ^= h >> 13;
    h = h.wrapping_mul(0xc2b2_ae35);
    h ^ (h >> 16)
}

const P32_1: u32 = 0x9e37_79b1;
const P32_2: u32 = 0x85eb_ca77;
const P32_3: u32 = 0xc2b2_ae3d;
const P32_4: u32 = 0x27d4_eb2f;
const P32_5: u32 = 0x1656_67b1;

fn xxh32_round(acc: u32, lane: u32) -> u32 {
    acc.wrapping_add(lane.wrapping_mul(P32_2))
        .rotate_left(13)
        .wrapping_mul(P32_1)
}

fn le32(b: &[u8]) -> u32 {
    u32::from_le_bytes([b[0], b[1], b[2], b[3]])
}

/// xxHash32 (XXH32) per the reference specification.
pub fn xxhash32(data: &[u8], seed: u32) -> u32 {
    let n = data.len();
    let mut i = 0;
    let mut h = if n >= 16 {
        let mut v = [
            seed.wrapping_add(P32_1).wrapping_add(P32_2),
            seed.wrapping_add(P32_2),
            seed,
            seed.wrapping_sub(P32_1),
        ];
        while i + 16 <= n {
            for (lane, acc) in v.iter_mut().enumerate() {
                *acc = xxh32_round(*acc, le32(&data[i + 4 * lane..]));
            }
            i += 16;
        }
        v[0].rotate_left(1)
            .wrapping_add(v[1].rotate_left(7))
            .wrapping_add(v[2].rotate_left(12))
            .wrapping_add(v[3].rotate_left(18))
    } else {
        seed.wrapping_add(P32_5)
    };
    h = h.wrapping_add(n as u32);
    while i + 4 <= n {
        h = h
            .wrapping_add(le32(&data[i..]).wrapping_mul(P32_3))
            .rotate_left(17)
            .wrapping_mul(P32_4);
        i += 4;
    }
    while i < n {
        h = h
            .wrapping_add(u32::from(data[i]).wrapping_mul(P32_5))
            .rotate_left(11)
            .wrapping_mul(P32_1);
        i += 1;
    }
    h ^= h >> 15;
    h = h.wrapping_mul(P32_2);
    h ^= h >> 13;
    h = h.wrapping_mul(P32_3);
    h ^ (h >> 16)
}

#[cfg(test)]
mod tests {
    use super::*;
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
        assert_eq!(fnv1a64(b"a"), 0xaf63_dc4c_8601_ec8c);
    }
}

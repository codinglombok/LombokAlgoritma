// LombokAlgoritma — xxHash32 (SPEC §12)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

const P32_1: u32 = 0x9e37_79b1;
const P32_2: u32 = 0x85eb_ca77;
const P32_3: u32 = 0xc2b2_ae3d;
const P32_4: u32 = 0x27d4_eb2f;
const P32_5: u32 = 0x1656_67b1;

fn round(acc: u32, lane: u32) -> u32 {
    acc.wrapping_add(lane.wrapping_mul(P32_2))
        .rotate_left(13)
        .wrapping_mul(P32_1)
}

fn le32(b: &[u8]) -> u32 {
    u32::from_le_bytes([b[0], b[1], b[2], b[3]])
}

/// xxHash32 (XXH32) per the reference specification (`doc/xxhash_spec.md`).
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
                *acc = round(*acc, le32(&data[i + 4 * lane..]));
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

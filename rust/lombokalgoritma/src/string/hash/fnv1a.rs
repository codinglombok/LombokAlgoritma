// LombokAlgoritma — FNV-1a (SPEC §12)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

/// FNV-1a, 32-bit (offset `0x811c9dc5`, prime `0x01000193`).
pub fn fnv1a32(data: &[u8]) -> u32 {
    let mut h: u32 = 0x811c_9dc5;
    for &b in data {
        h ^= u32::from(b);
        h = h.wrapping_mul(0x0100_0193);
    }
    h
}

/// FNV-1a, 64-bit (offset `0xcbf29ce484222325`, prime `0x100000001b3`).
pub fn fnv1a64(data: &[u8]) -> u64 {
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;
    for &b in data {
        h ^= u64::from(b);
        h = h.wrapping_mul(0x0000_0100_0000_01b3);
    }
    h
}

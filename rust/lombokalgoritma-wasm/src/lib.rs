// LombokAlgoritma — WebAssembly bindings
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! `wasm-bindgen` exports of the `lombokalgoritma` crate. The core stays dependency-free.
#![no_std]

extern crate alloc;

use alloc::vec::Vec;
use lombokalgoritma as la;
use wasm_bindgen::prelude::*;

/// Crate version.
#[wasm_bindgen(js_name = version)]
pub fn version() -> alloc::string::String {
    alloc::string::String::from(env!("CARGO_PKG_VERSION"))
}

/// Stable sort of a `Uint32Array` copy; returns the sorted array.
#[wasm_bindgen(js_name = sortU32)]
pub fn sort_u32(mut data: Vec<u32>) -> Vec<u32> {
    la::sort::timsort(&mut data);
    data
}

/// Stable sort of a `Float64Array` copy using IEEE-754 total order (`-0 < +0`, NaN last).
#[wasm_bindgen(js_name = sortF64)]
pub fn sort_f64(mut data: Vec<f64>) -> Vec<f64> {
    la::sort::timsort_by(&mut data, f64::total_cmp);
    data
}

/// Binary search in an ascending `Int32Array`; returns the index or -1.
#[wasm_bindgen(js_name = binarySearchI32)]
pub fn binary_search_i32(data: &[i32], target: i32) -> i32 {
    la::search::binary_search(data, &target).map_or(-1, |i| i32::try_from(i).unwrap_or(-1))
}

/// xxHash32 of bytes.
#[wasm_bindgen(js_name = xxhash32)]
pub fn xxhash32(data: &[u8], seed: u32) -> u32 {
    la::string::xxhash32(data, seed)
}

/// `MurmurHash3_x86_32` of bytes.
#[wasm_bindgen(js_name = murmur3_32)]
pub fn murmur3_32(data: &[u8], seed: u32) -> u32 {
    la::string::murmur3_32(data, seed)
}

/// FNV-1a 32-bit of bytes.
#[wasm_bindgen(js_name = fnv1a32)]
pub fn fnv1a32(data: &[u8]) -> u32 {
    la::string::fnv1a32(data)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn native_smoke() {
        assert_eq!(sort_u32(alloc::vec![3, 1, 2]), alloc::vec![1, 2, 3]);
        let s = sort_f64(alloc::vec![2.0, f64::NAN, -0.0, 0.0, -1.0]);
        assert_eq!(s[0].to_bits(), (-1.0f64).to_bits());
        assert_eq!(s[1].to_bits(), (-0.0f64).to_bits());
        assert_eq!(s[2].to_bits(), 0.0f64.to_bits());
        assert!(s[4].is_nan());
        assert_eq!(binary_search_i32(&[1, 3, 5], 5), 2);
        assert_eq!(xxhash32(b"abc", 0), 0x32d1_53ff);
    }
}

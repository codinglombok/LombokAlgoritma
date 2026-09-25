// LombokAlgoritma — C ABI
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! C ABI over the `lombokalgoritma` crate. Every function is `extern "C"` and panic-free
//! for valid arguments; pointer arguments are checked for NULL. See `include/lombokalgoritma.h`.
#![allow(clippy::missing_safety_doc)] // documented per function below

use core::slice;
use lombokalgoritma as la;

/// Status code: success.
pub const LA_OK: i32 = 0;
/// Status code: a required pointer was NULL.
pub const LA_ERR_NULL: i32 = -1;

/// Null-terminated crate version string.
#[no_mangle]
pub extern "C" fn la_version() -> *const core::ffi::c_char {
    concat!(env!("CARGO_PKG_VERSION"), "\0").as_ptr().cast()
}

/// Sort `len` `u32` values in place (stable timsort).
///
/// # Safety
/// `data` must point to `len` writable, initialised `u32` values (or be NULL with `len == 0`).
#[no_mangle]
pub unsafe extern "C" fn la_sort_u32(data: *mut u32, len: usize) -> i32 {
    if len == 0 {
        return LA_OK;
    }
    if data.is_null() {
        return LA_ERR_NULL;
    }
    // SAFETY: caller guarantees `data[..len]` is valid and exclusively borrowed.
    let s = unsafe { slice::from_raw_parts_mut(data, len) };
    la::sort::timsort(s);
    LA_OK
}

/// Sort `len` `i64` values in place (stable timsort).
///
/// # Safety
/// `data` must point to `len` writable, initialised `i64` values (or be NULL with `len == 0`).
#[no_mangle]
pub unsafe extern "C" fn la_sort_i64(data: *mut i64, len: usize) -> i32 {
    if len == 0 {
        return LA_OK;
    }
    if data.is_null() {
        return LA_ERR_NULL;
    }
    // SAFETY: caller guarantees `data[..len]` is valid and exclusively borrowed.
    let s = unsafe { slice::from_raw_parts_mut(data, len) };
    la::sort::timsort(s);
    LA_OK
}

/// Binary search in an ascending `i64` array; returns the index or -1.
///
/// # Safety
/// `data` must point to `len` readable `i64` values (or be NULL with `len == 0`).
#[no_mangle]
pub unsafe extern "C" fn la_binary_search_i64(data: *const i64, len: usize, target: i64) -> isize {
    if len == 0 || data.is_null() {
        return -1;
    }
    // SAFETY: caller guarantees `data[..len]` is valid for reads.
    let s = unsafe { slice::from_raw_parts(data, len) };
    la::search::binary_search(s, &target).map_or(-1, |i| isize::try_from(i).unwrap_or(-1))
}

/// Greatest common divisor.
#[no_mangle]
pub extern "C" fn la_gcd_u64(a: u64, b: u64) -> u64 {
    la::math::gcd_u64(a, b)
}

/// `base^exp mod m` (exact for all `u64` moduli; `m == 0` returns 0).
#[no_mangle]
pub extern "C" fn la_mod_pow_u64(base: u64, exp: u64, m: u64) -> u64 {
    if m == 0 {
        return 0;
    }
    la::math::mod_pow_u64(base, exp, m)
}

/// Hash `len` bytes. `algo`: 0 = FNV-1a-32, 1 = MurmurHash3-32, 2 = xxHash32.
/// Returns 0 for unknown `algo`.
///
/// # Safety
/// `data` must point to `len` readable bytes (or be NULL with `len == 0`).
#[no_mangle]
pub unsafe extern "C" fn la_hash32(algo: u32, data: *const u8, len: usize, seed: u32) -> u32 {
    let bytes: &[u8] = if len == 0 || data.is_null() {
        &[]
    } else {
        // SAFETY: caller guarantees `data[..len]` is valid for reads.
        unsafe { slice::from_raw_parts(data, len) }
    };
    match algo {
        0 => la::string::fnv1a32(bytes),
        1 => la::string::murmur3_32(bytes, seed),
        2 => la::string::xxhash32(bytes, seed),
        _ => 0,
    }
}

/// Deterministic Miller–Rabin primality test (exact for every `u64`); returns 1 or 0.
#[no_mangle]
pub extern "C" fn la_is_prime_u64(n: u64) -> i32 {
    i32::from(la::math::is_prime(n))
}

/// Hash `len` bytes to 64 bits. `algo`: 0 = FNV-1a-64, 1 = xxHash64 (`seed`).
/// Returns 0 for unknown `algo`.
///
/// # Safety
/// `data` must point to `len` readable bytes (or be NULL with `len == 0`).
#[no_mangle]
pub unsafe extern "C" fn la_hash64(algo: u32, data: *const u8, len: usize, seed: u64) -> u64 {
    let bytes: &[u8] = if len == 0 || data.is_null() {
        &[]
    } else {
        // SAFETY: caller guarantees `data[..len]` is valid for reads.
        unsafe { slice::from_raw_parts(data, len) }
    };
    match algo {
        0 => la::string::fnv1a64(bytes),
        1 => la::string::xxhash64(bytes, seed),
        _ => 0,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn c_abi_roundtrip() {
        let mut v = [5u32, 1, 4, 1, 3];
        assert_eq!(unsafe { la_sort_u32(v.as_mut_ptr(), v.len()) }, LA_OK);
        assert_eq!(v, [1, 1, 3, 4, 5]);
        assert_eq!(
            unsafe { la_sort_u32(core::ptr::null_mut(), 3) },
            LA_ERR_NULL
        );
        let s = [-3i64, 0, 2, 9];
        assert_eq!(unsafe { la_binary_search_i64(s.as_ptr(), s.len(), 2) }, 2);
        assert_eq!(unsafe { la_binary_search_i64(s.as_ptr(), s.len(), 5) }, -1);
        assert_eq!(la_gcd_u64(12, 18), 6);
        assert_eq!(la_mod_pow_u64(2, 10, 1000), 24);
        assert_eq!(la_mod_pow_u64(2, 10, 0), 0);
        assert_eq!(unsafe { la_hash32(2, b"abc".as_ptr(), 3, 0) }, 0x32d1_53ff);
        assert_eq!(unsafe { la_hash32(0, b"a".as_ptr(), 1, 0) }, 0xe40c_292c);
        assert_eq!(
            unsafe { la_hash32(1, b"hello".as_ptr(), 5, 42) },
            0xe2db_d2e1
        );
        assert_eq!(unsafe { la_hash32(9, core::ptr::null(), 0, 0) }, 0);
        assert_eq!(
            unsafe { la_hash64(0, b"a".as_ptr(), 1, 0) },
            0xaf63_dc4c_8601_ec8c
        );
        assert_eq!(
            unsafe { la_hash64(1, core::ptr::null(), 0, 0) },
            0xef46_db37_51d8_e999
        );
        assert_eq!(unsafe { la_hash64(7, core::ptr::null(), 0, 0) }, 0);
        assert_eq!(la_is_prime_u64(1_000_000_007), 1);
        assert_eq!(la_is_prime_u64(561), 0);
        let mut w = [3i64, -1, 2];
        assert_eq!(unsafe { la_sort_i64(w.as_mut_ptr(), w.len()) }, LA_OK);
        assert_eq!(w, [-1, 2, 3]);
        assert_eq!(unsafe { la_sort_i64(core::ptr::null_mut(), 0) }, LA_OK);
        assert_eq!(
            unsafe { la_sort_i64(core::ptr::null_mut(), 1) },
            LA_ERR_NULL
        );
        assert_eq!(unsafe { la_sort_u32(core::ptr::null_mut(), 0) }, LA_OK);
        assert_eq!(unsafe { la_binary_search_i64(core::ptr::null(), 0, 1) }, -1);
        let ver = unsafe { core::ffi::CStr::from_ptr(la_version()) };
        assert_eq!(ver.to_str().unwrap(), env!("CARGO_PKG_VERSION"));
    }
}

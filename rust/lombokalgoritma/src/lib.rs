// LombokAlgoritma — Rust port
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Deterministic algorithm library of the Lombok Ecosystem (cluster 00.02, tier L0).
//!
//! The crate is `#![no_std]` and only needs `alloc`; the default `std` feature links `std`.
//! All algorithms are pure and zero-dependency.
#![cfg_attr(not(feature = "std"), no_std)]

extern crate alloc;

pub mod core;
pub mod math;
pub mod search;
pub mod sort;
pub mod string;

/// Crate version (from Cargo metadata).
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

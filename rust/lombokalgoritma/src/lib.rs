// LombokAlgoritma — Rust port
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Deterministic, zero-dependency algorithm library of the Lombok Ecosystem (cluster 00.02, tier L0).
//!
//! Every algorithm follows the normative behaviour of `docs/SPEC_LombokAlgoritma_v0.2.0.md` and
//! produces byte-identical results to the TypeScript reference for the shared vectors.
//!
//! The crate is `#![no_std]` and only needs `alloc`; the default `std` feature links `std` (it is
//! used for hardware `sqrt`/`ln` and the `std::error::Error` impl). Without `std`, `sqrt` is a
//! bit-exact software implementation, so results are identical on every target.
//!
//! Fallible functions return [`Result`] with an [`Error`] whose [`Error::code`] is one of the
//! canonical codes of SPEC §2 (`"INVALID_INPUT"`, `"OUT_OF_RANGE"`, …). Invalid input never panics.
//!
//! Cryptography (SHA-256, HMAC, HKDF) was removed in v0.2.0 (ADR-016) and lives in
//! `lombokencryptdecrypt`.
#![cfg_attr(not(feature = "std"), no_std)]

extern crate alloc;

pub mod compression;
pub mod core;
pub mod datastructure;
mod error;
pub mod geometry;
pub mod graph;
pub mod math;
pub mod ml;
mod num;
pub mod rng;
pub mod search;
pub mod sort;
pub mod string;

pub use error::{Error, Result};

/// Crate version (from Cargo metadata).
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

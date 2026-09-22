// LombokAlgoritma — Rust Port
// Apache-2.0 — @codinglombok
#![cfg_attr(feature = "no_std", no_std)]
#![deny(warnings)]

#[cfg(feature = "no_std")]
extern crate alloc;

pub mod core;
pub mod sort;
pub mod search;
pub mod math;
pub mod string;
pub mod datastructure;
pub mod ml;

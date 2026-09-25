// LombokAlgoritma — core helpers
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Core helpers: branch-free bit operations and the binary min-heap shared by the graph and
//! compression algorithms. The error type is [`crate::Error`].
pub mod bit;
pub mod heap;
pub use bit::*;
pub use heap::{tuple_less, MinHeap};

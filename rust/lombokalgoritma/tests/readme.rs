// LombokAlgoritma — README snippets kept compiling
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! The Rust snippets from README.md, kept compiling.
use lombokalgoritma::{
    graph::{dijkstra, Graph},
    math::mod_pow,
    search::binary_search,
    sort::timsort_by,
    string::xxhash32,
    Error,
};

#[test]
fn readme_quick_start() -> Result<(), Error> {
    let g = Graph::from_triples(3, &[(0, 1, 1.0), (1, 2, 2.0), (0, 2, 5.0)]);
    assert_eq!(dijkstra(&g, 0)?, vec![0.0, 1.0, 3.0]);
    assert_eq!(mod_pow(2, -1, 5), Err(Error::OutOfRange));
    assert_eq!(Error::OutOfRange.code(), "OUT_OF_RANGE");

    let mut v = vec!["banana", "fig", "apple", "kiwi"];
    timsort_by(&mut v, |a, b| a.len().cmp(&b.len()));
    assert_eq!(v, ["fig", "kiwi", "apple", "banana"]);
    assert_eq!(binary_search(&[1, 3, 5, 7], &5), Some(2));
    assert_eq!(xxhash32(b"abc", 0), 0x32d1_53ff);
    Ok(())
}

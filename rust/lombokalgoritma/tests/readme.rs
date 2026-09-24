//! The Rust snippet from README.md, kept compiling.
use lombokalgoritma::{search::binary_search, sort::timsort_by, string::xxhash32};

#[test]
fn readme_quick_start() {
    let mut v = vec!["banana", "fig", "apple", "kiwi"];
    timsort_by(&mut v, |a, b| a.len().cmp(&b.len()));
    assert_eq!(v, ["fig", "kiwi", "apple", "banana"]);
    assert_eq!(binary_search(&[1, 3, 5, 7], &5), Some(2));
    assert_eq!(xxhash32(b"abc", 0), 0x32d1_53ff);
}

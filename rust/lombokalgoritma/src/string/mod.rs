// LombokAlgoritma — string algorithms (SPEC §11) and non-cryptographic hashes (SPEC §12)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! String algorithms over Unicode **code points** (lengths and offsets are code-point counts),
//! plus the byte hashes of [`hash`] (re-exported here).
mod aho_corasick;
pub mod hash;
mod jaro;
mod kmp;
mod levenshtein;

pub use aho_corasick::{AhoCorasick, AhoCorasickMatch};
pub use hash::{
    fmix32, fnv1a32, fnv1a64, murmur3_32, polynomial_hash, siphash24, xxhash32, xxhash64,
};
pub use jaro::{jaro, jaro_winkler};
pub use kmp::{kmp_find, kmp_search};
pub use levenshtein::{damerau_levenshtein, levenshtein};

#[cfg(test)]
mod tests {
    use super::*;
    use alloc::string::String;
    use alloc::vec;
    use alloc::vec::Vec;

    #[test]
    fn kmp() {
        assert_eq!(kmp_search("abcabc", "abc"), [0, 3]);
        assert_eq!(kmp_search("aaaa", "aa"), [0, 1, 2]);
        assert_eq!(kmp_search("abc", ""), Vec::<usize>::new());
        assert_eq!(kmp_search("😀a😀a", "😀a"), [0, 2]);
        assert_eq!(kmp_search("abababab", "abab"), [0, 2, 4]);
        assert_eq!(kmp_find("xyz", "z"), Some(2));
        assert_eq!(kmp_find("xyz", "q"), None);
    }

    #[test]
    fn edit_distances() {
        assert_eq!(levenshtein("", ""), 0);
        assert_eq!(levenshtein("a", ""), 1);
        assert_eq!(levenshtein("", "abc"), 3);
        assert_eq!(levenshtein("kitten", "sitting"), 3);
        assert_eq!(levenshtein("sitting", "kitten"), 3);
        assert_eq!(levenshtein("😀", "😁"), 1);
        assert_eq!(damerau_levenshtein("", "ab"), 2);
        assert_eq!(damerau_levenshtein("ab", ""), 2);
        assert_eq!(damerau_levenshtein("ca", "abc"), 2);
        assert_eq!(damerau_levenshtein("ab", "ba"), 1);
        assert_eq!(damerau_levenshtein("kitten", "sitting"), 3);
    }

    #[test]
    fn jaro_family() {
        assert_eq!(jaro("", ""), 1.0);
        assert_eq!(jaro("a", ""), 0.0);
        assert_eq!(jaro("a", "b"), 0.0);
        assert_eq!(jaro("abc", "xyz"), 0.0);
        assert!((jaro("MARTHA", "MARHTA") - 0.944_444_444_444_444_5).abs() < 1e-15);
        assert!((jaro_winkler("MARTHA", "MARHTA", 0.1) - 0.961_111_111_111_111_1).abs() < 1e-15);
        assert_eq!(jaro_winkler("same", "same", 0.1), 1.0);
    }

    #[test]
    fn aho() {
        let mut ac = AhoCorasick::new();
        for p in ["he", "she", "his", "hers", ""] {
            ac.add_pattern(p);
        }
        let got: Vec<(String, usize)> = ac
            .search("ahishers")
            .into_iter()
            .map(|m| (m.pattern, m.index))
            .collect();
        let want = vec![("his", 1), ("she", 3), ("he", 4), ("hers", 4)];
        assert_eq!(
            got,
            want.into_iter()
                .map(|(p, i)| (String::from(p), i))
                .collect::<Vec<_>>()
        );
        let mut ac = AhoCorasick::with_patterns(["b😀", "😀"]);
        let got: Vec<usize> = ac.search("ab😀😀").iter().map(|m| m.index).collect();
        assert_eq!(got, [1, 2, 3]);
        ac.add_pattern("a");
        assert_eq!(ac.search("a").len(), 1);
        assert!(AhoCorasick::default().search("abc").is_empty());
    }
}

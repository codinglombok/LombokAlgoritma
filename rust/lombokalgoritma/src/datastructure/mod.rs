// LombokAlgoritma — data structures (SPEC §8)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Probabilistic sets/counters (Bloom filter, HyperLogLog) and classic structures (disjoint set,
//! Fenwick tree, lazy segment tree).
mod bloom_filter;
mod disjoint_set;
mod fenwick_tree;
mod hyperloglog;
mod segment_tree;

pub use bloom_filter::BloomFilter;
pub use disjoint_set::DisjointSet;
pub use fenwick_tree::FenwickTree;
pub use hyperloglog::HyperLogLog;
pub use segment_tree::SegmentTree;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Error;
    use alloc::format;
    use alloc::vec::Vec;

    #[test]
    fn bloom() {
        assert_eq!(BloomFilter::with_params(0, 1), Err(Error::OutOfRange));
        assert_eq!(BloomFilter::with_params(1 << 32, 1), Err(Error::OutOfRange));
        assert_eq!(BloomFilter::with_params(8, 0), Err(Error::OutOfRange));
        assert_eq!(BloomFilter::with_params(8, 65), Err(Error::OutOfRange));
        let mut f = BloomFilter::with_params(64, 3).unwrap();
        assert_eq!((f.size(), f.hash_count(), f.as_bytes().len()), (64, 3, 8));
        for i in 0..5 {
            f.add(&format!("item-{i}"));
        }
        for i in 0..5 {
            assert!(f.has(&format!("item-{i}")));
        }
        assert!(f.set_bits() <= 15 && f.set_bits() > 0);
        assert_eq!(f.to_bytes(), f.as_bytes());
        assert!(f.estimated_fpr() > 0.0 && f.estimated_fpr() < 1.0);
        f.add(b"bytes".as_slice());
        assert!(f.has(b"bytes".as_slice()));

        let g = BloomFilter::new(1000, 0.01).unwrap();
        assert_eq!((g.size(), g.hash_count()), (9586, 7));
        assert_eq!(BloomFilter::new(0, 0.01), Err(Error::OutOfRange));
        assert_eq!(BloomFilter::new(10, 1.0), Err(Error::OutOfRange));
        assert_eq!(BloomFilter::new(10, f64::NAN), Err(Error::OutOfRange));
        assert_eq!(BloomFilter::new(u64::MAX, 1e-300), Err(Error::OutOfRange));
    }

    #[test]
    fn hyperloglog() {
        let mut h = HyperLogLog::new(1);
        assert_eq!(h.precision(), 4);
        assert_eq!(HyperLogLog::new(40).precision(), 16);
        assert_eq!(HyperLogLog::default().precision(), 14);
        assert_eq!(h.count(), 0.0);
        for i in 0..10 {
            h.add(&format!("x{i}"));
        }
        assert_eq!(h.count(), 11.0);
        assert_eq!(h.registers().len(), 16);
        assert_eq!(h.registers_bytes(), h.registers());
        let mut a = HyperLogLog::new(12);
        let mut b = HyperLogLog::new(12);
        for i in 0..3000 {
            a.add(&format!("a{i}"));
        }
        for i in 0..5000 {
            b.add(&format!("a{i}"));
        }
        assert_eq!(a.merge(&b).unwrap().count(), 5025.0);
        assert_eq!(a.merge(&HyperLogLog::new(5)), Err(Error::InvalidInput));
        // m = 32 and m = 64 alphas
        for b in [5u32, 6] {
            let mut h = HyperLogLog::new(b);
            for i in 0..1000 {
                h.add(&format!("y{i}"));
            }
            assert!(h.count() > 500.0 && h.count() < 2000.0);
        }
        // large-range correction branch
        let mut full = HyperLogLog::new(4);
        full.registers_mut().fill(25);
        assert!(full.count() > 4_294_967_296.0 / 30.0);
        // no zero register, small estimate: linear counting is skipped
        let mut ones = HyperLogLog::new(4);
        ones.registers_mut().fill(1);
        assert_eq!(ones.count(), 22.0);
    }

    #[test]
    fn disjoint_set() {
        let mut ds = DisjointSet::new(3);
        assert_eq!((ds.len(), ds.is_empty(), ds.count()), (3, false, 3));
        assert_eq!(ds.union(0, 1), Ok(true));
        assert_eq!(ds.union(1, 2), Ok(true));
        assert_eq!(ds.find(2), Ok(0));
        assert_eq!(ds.union(0, 2), Ok(false));
        assert_eq!(ds.connected(0, 2), Ok(true));
        assert_eq!(ds.count(), 1);
        assert_eq!(ds.find(3), Err(Error::OutOfBounds));
        assert_eq!(ds.union(0, 9), Err(Error::OutOfBounds));
        let mut ds = DisjointSet::new(4);
        ds.union(0, 1).unwrap();
        ds.union(2, 3).unwrap();
        ds.union(3, 0).unwrap(); // equal ranks: root 2 absorbs root 0
        ds.union(1, 3).unwrap();
        assert_eq!(ds.find(1), Ok(2));
        let mut small = DisjointSet::new(3);
        small.union(0, 1).unwrap();
        small.union(2, 0).unwrap(); // rank[2] < rank[0]
        assert_eq!(small.find(2), Ok(0));
        assert!(DisjointSet::new(0).is_empty());
    }

    #[test]
    fn fenwick() {
        let mut t = FenwickTree::from_slice(&[5, 8, 3, -1]);
        assert_eq!((t.len(), t.is_empty()), (4, false));
        assert_eq!(t.prefix_sum(0), Ok(0));
        assert_eq!(t.prefix_sum(4), Ok(15));
        assert_eq!(t.range_sum(2, 3), Ok(11));
        assert_eq!(t.range_sum(0, 2), Ok(13));
        assert_eq!(t.update(2, -8), Ok(()));
        assert_eq!(t.point_query(2), Ok(0));
        assert_eq!(t.update(0, 1), Err(Error::OutOfBounds));
        assert_eq!(t.update(5, 1), Err(Error::OutOfBounds));
        assert_eq!(t.prefix_sum(5), Err(Error::OutOfBounds));
        assert!(FenwickTree::new(0).is_empty());
    }

    #[test]
    fn segment_tree() {
        let base = [-4i64, 6, 5, -6, 8, 1, 4, -7, 7, 8, -3, -3, 10];
        let mut st = SegmentTree::new(&base);
        let mut naive: Vec<i64> = base.to_vec();
        assert_eq!((st.len(), st.is_empty()), (13, false));
        let ops = [
            (0, 12, 3),
            (2, 5, -2),
            (7, 7, 9),
            (4, 11, 1),
            (12, 12, -5),
            (0, 0, 4),
        ];
        for (l, r, v) in ops {
            st.update(l, r, v);
            for x in &mut naive[l..=r] {
                *x += v;
            }
            for a in 0..base.len() {
                for b in a..base.len() {
                    assert_eq!(st.query(a, b), naive[a..=b].iter().sum::<i64>());
                }
            }
        }
        assert_eq!(st.query(5, 100), naive[5..].iter().sum::<i64>());
        assert_eq!(st.query(3, 2), 0);
        let mut empty = SegmentTree::new(&[]);
        assert!(empty.is_empty());
        empty.update(0, 3, 1);
        assert_eq!(empty.query(0, 3), 0);
    }
}

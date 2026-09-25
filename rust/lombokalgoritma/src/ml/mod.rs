// LombokAlgoritma — machine-learning primitives (SPEC §13.1)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Vector similarity/distance and seeded k-means.
mod kmeans;
mod similarity;

pub use kmeans::{kmeans, KMeansOptions, KMeansResult};
pub use similarity::{
    batch_cosine, cosine_similarity, dot_product, jaccard_similarity, l1_distance, l2_distance,
    l2_norm, normalize, pearson, ScoredIndex,
};

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Error;
    use alloc::vec;
    use alloc::vec::Vec;

    #[test]
    fn vectors() {
        let (a, b) = ([1.0, 2.0, 3.0], [4.0, 5.0, 6.0]);
        assert_eq!(dot_product(&a, &b), Ok(32.0));
        assert_eq!(dot_product(&a, &[1.0]), Err(Error::InvalidInput));
        assert_eq!(l2_norm(&a), 3.741_657_386_773_941_3);
        assert_eq!(cosine_similarity(&a, &b), Ok(0.974_631_846_197_076_2));
        assert_eq!(cosine_similarity(&[0.0, 0.0, 0.0], &b), Ok(0.0));
        assert_eq!(cosine_similarity(&a, &[1.0]), Err(Error::InvalidInput));
        assert_eq!(l2_distance(&a, &b), Ok(5.196_152_422_706_632));
        assert_eq!(l2_distance(&a, &[]), Err(Error::InvalidInput));
        assert_eq!(l1_distance(&a, &b), Ok(9.0));
        assert_eq!(l1_distance(&a, &[]), Err(Error::InvalidInput));
        assert_eq!(normalize(&[0.0, 0.0]), vec![0.0, 0.0]);
        assert_eq!(normalize(&[3.0, 4.0]), vec![0.6, 0.8]);
        assert_eq!(pearson(&a, &b), Ok(1.0));
        assert_eq!(pearson(&[0.0, 0.0, 0.0], &b), Ok(0.0));
        assert_eq!(pearson(&a, &[1.0]), Err(Error::InvalidInput));
        assert_eq!(pearson(&[], &[]), Ok(0.0));
        assert!((pearson(&a, &[3.0, 1.0, 2.0]).unwrap() + 0.5).abs() < 1e-12);
    }

    #[test]
    fn sets_and_batches() {
        assert_eq!(jaccard_similarity(&["a", "b", "c"], &["b", "c", "d"]), 0.5);
        assert_eq!(jaccard_similarity::<&str>(&[], &[]), 1.0);
        assert_eq!(jaccard_similarity(&["a", "a"], &["b"]), 0.0);
        let cands = vec![
            vec![1.0, 0.0],
            vec![0.0, 1.0],
            vec![1.0, 1.0],
            vec![0.0, 0.0],
            vec![2.0, 0.0],
            vec![-1.0, 0.0],
        ];
        let got: Vec<(usize, f64)> = batch_cosine(&[1.0, 0.0], &cands)
            .unwrap()
            .iter()
            .map(|s| (s.index, s.score))
            .collect();
        assert_eq!(
            got,
            vec![
                (0, 1.0),
                (4, 1.0),
                (2, 0.707_106_781_186_547_5),
                (1, 0.0),
                (3, 0.0),
                (5, -1.0)
            ]
        );
        assert_eq!(batch_cosine(&[1.0], &cands), Err(Error::InvalidInput));
    }

    #[test]
    fn clustering() {
        let mut pts: Vec<Vec<f64>> = Vec::new();
        for i in 0..10 {
            let f = f64::from(i) * 0.1;
            pts.push(vec![f, f]);
            pts.push(vec![10.0 + f, 10.0 - f]);
        }
        let r = kmeans(&pts, 2, KMeansOptions::default()).unwrap();
        assert_eq!(r.centroids.len(), 2);
        assert_ne!(r.labels[0], r.labels[1]);
        assert!(r
            .labels
            .chunks(2)
            .all(|c| c[0] == r.labels[0] && c[1] == r.labels[1]));
        assert!(r.iterations >= 1 && r.iterations <= 300);
        assert!(r.inertia > 0.0);
        let one = kmeans(
            &pts,
            20,
            KMeansOptions {
                seed: 7,
                ..KMeansOptions::default()
            },
        )
        .unwrap();
        assert!(one.inertia < 1e-9);
        let zero = kmeans(
            &pts,
            2,
            KMeansOptions {
                max_iter: 0,
                ..KMeansOptions::default()
            },
        );
        assert_eq!(zero.unwrap().iterations, 0);
        assert_eq!(
            kmeans(&[], 1, KMeansOptions::default()),
            Err(Error::EmptyInput)
        );
        assert_eq!(
            kmeans(&pts, 0, KMeansOptions::default()),
            Err(Error::OutOfRange)
        );
        assert_eq!(
            kmeans(&pts, 21, KMeansOptions::default()),
            Err(Error::OutOfRange)
        );
        let ragged = vec![vec![1.0], vec![1.0, 2.0]];
        assert_eq!(
            kmeans(&ragged, 1, KMeansOptions::default()),
            Err(Error::InvalidInput)
        );
        // identical points: every D(i) = 0 (total = 0, the first point is picked)
        let same = vec![vec![1.0, 1.0]; 4];
        let r = kmeans(&same, 3, KMeansOptions::default()).unwrap();
        assert_eq!(r.inertia, 0.0);
    }
}

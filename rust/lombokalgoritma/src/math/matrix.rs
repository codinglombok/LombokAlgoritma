// LombokAlgoritma — matrix multiplication (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use crate::{Error, Result};
use alloc::vec;
use alloc::vec::Vec;

/// Row-major dense matrix.
pub type Matrix = Vec<Vec<f64>>;

/// Naive product of an `n×k` and a `k×m` matrix: `C[i][j] = Σ_l A[i][l]·B[l][j]` (l ascending,
/// starting from 0). O(n·m·k).
///
/// # Errors
/// [`Error::InvalidInput`] when the inner dimensions differ or `b` is ragged.
pub fn mat_mul(a: &[Vec<f64>], b: &[Vec<f64>]) -> Result<Matrix> {
    let n = a.len();
    let k = b.len();
    let m = b.first().map_or(0, Vec::len);
    if a.iter().any(|r| r.len() != k) || b.iter().any(|r| r.len() != m) {
        return Err(Error::InvalidInput);
    }
    let mut c = vec![vec![0.0; m]; n];
    for i in 0..n {
        for j in 0..m {
            let mut s = 0.0;
            for l in 0..k {
                s += a[i][l] * b[l][j];
            }
            c[i][j] = s;
        }
    }
    Ok(c)
}

fn add(a: &[Vec<f64>], b: &[Vec<f64>]) -> Matrix {
    a.iter()
        .zip(b)
        .map(|(x, y)| x.iter().zip(y).map(|(p, q)| p + q).collect())
        .collect()
}

fn sub(a: &[Vec<f64>], b: &[Vec<f64>]) -> Matrix {
    a.iter()
        .zip(b)
        .map(|(x, y)| x.iter().zip(y).map(|(p, q)| p - q).collect())
        .collect()
}

fn split(m: &[Vec<f64>], h: usize) -> [Matrix; 4] {
    let q = |rows: &[Vec<f64>], lo: usize, hi: usize| -> Matrix {
        rows.iter().map(|r| r[lo..hi].to_vec()).collect()
    };
    let n = m.len();
    [
        q(&m[..h], 0, h),
        q(&m[..h], h, n),
        q(&m[h..], 0, h),
        q(&m[h..], h, n),
    ]
}

fn strassen(a: &[Vec<f64>], b: &[Vec<f64>]) -> Matrix {
    let n = a.len();
    if n <= 64 {
        // square power-of-two input: shapes always agree
        return mat_mul(a, b).unwrap_or_default();
    }
    let h = n >> 1;
    let [a11, a12, a21, a22] = split(a, h);
    let [b11, b12, b21, b22] = split(b, h);
    let m1 = strassen(&add(&a11, &a22), &add(&b11, &b22));
    let m2 = strassen(&add(&a21, &a22), &b11);
    let m3 = strassen(&a11, &sub(&b12, &b22));
    let m4 = strassen(&a22, &sub(&b21, &b11));
    let m5 = strassen(&add(&a11, &a12), &b22);
    let m6 = strassen(&sub(&a21, &a11), &add(&b11, &b12));
    let m7 = strassen(&sub(&a12, &a22), &add(&b21, &b22));
    let c11 = add(&sub(&add(&m1, &m4), &m5), &m7);
    let c12 = add(&m3, &m5);
    let c21 = add(&m2, &m4);
    let c22 = add(&sub(&add(&m1, &m3), &m2), &m6);
    let mut c = vec![vec![0.0; n]; n];
    for i in 0..h {
        for j in 0..h {
            c[i][j] = c11[i][j];
            c[i][j + h] = c12[i][j];
            c[i + h][j] = c21[i][j];
            c[i + h][j + h] = c22[i][j];
        }
    }
    c
}

/// Strassen product of two square `n×n` matrices, zero-padded to the next power of two
/// (blocks of size ≤ 64 use [`mat_mul`]). O(n^2.807).
///
/// # Errors
/// [`Error::InvalidInput`] unless `a` and `b` are both `n×n`.
pub fn strassen_mul(a: &[Vec<f64>], b: &[Vec<f64>]) -> Result<Matrix> {
    let n = a.len();
    let square = |m: &[Vec<f64>]| m.len() == n && m.iter().all(|r| r.len() == n);
    if !square(a) || !square(b) {
        return Err(Error::InvalidInput);
    }
    if n == 0 {
        return Ok(Vec::new());
    }
    let p = n.next_power_of_two();
    if p == n {
        return Ok(strassen(a, b));
    }
    let pad = |m: &[Vec<f64>]| -> Matrix {
        (0..p)
            .map(|i| {
                (0..p)
                    .map(|j| if i < n && j < n { m[i][j] } else { 0.0 })
                    .collect()
            })
            .collect()
    };
    let mut c = strassen(&pad(a), &pad(b));
    c.truncate(n);
    for row in &mut c {
        row.truncate(n);
    }
    Ok(c)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn gen(n: usize, seed: u64) -> Matrix {
        let mut s = seed;
        (0..n)
            .map(|_| {
                (0..n)
                    .map(|_| {
                        s = s.wrapping_mul(6_364_136_223_846_793_005).wrapping_add(1);
                        ((s >> 40) % 19) as f64 - 9.0
                    })
                    .collect()
            })
            .collect()
    }

    #[test]
    fn products() {
        let a = vec![vec![1.0, 2.0], vec![3.0, 4.0]];
        let b = vec![vec![5.0, 6.0], vec![7.0, 8.0]];
        let want = vec![vec![19.0, 22.0], vec![43.0, 50.0]];
        assert_eq!(mat_mul(&a, &b), Ok(want.clone()));
        assert_eq!(strassen_mul(&a, &b), Ok(want));
        assert_eq!(
            mat_mul(&[vec![1.0, 2.0]], &[vec![1.0, 2.0]]),
            Err(Error::InvalidInput)
        );
        assert_eq!(mat_mul(&[], &[]), Ok(vec![]));
        assert_eq!(strassen_mul(&[], &[]), Ok(vec![]));
        assert_eq!(strassen_mul(&a, &[vec![1.0]]), Err(Error::InvalidInput));
        for n in [3usize, 65, 128, 130] {
            let (x, y) = (gen(n, 1), gen(n, 2));
            assert_eq!(strassen_mul(&x, &y), mat_mul(&x, &y), "n={n}");
        }
    }
}

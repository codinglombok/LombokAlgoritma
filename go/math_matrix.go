// LombokAlgoritma — matrix product: naive and Strassen (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

// Matrix is a dense row-major matrix.
type Matrix = [][]float64

func newMatrix(rows, cols int) Matrix {
	m := make(Matrix, rows)
	for i := range m {
		m[i] = make([]float64, cols)
	}
	return m
}

// MatMul returns the n×m product of an n×k matrix a and a k×m matrix b:
// Cᵢⱼ = Σₗ Aᵢₗ·Bₗⱼ (l ascending, starting from 0). Mismatched inner dimensions (or a ragged b)
// yield INVALID_INPUT.
func MatMul(a, b Matrix) (Matrix, error) {
	n, k := len(a), len(b)
	m := 0
	if k > 0 {
		m = len(b[0])
	}
	for _, row := range a {
		if len(row) != k {
			return nil, newErr(CodeInvalidInput, "MatMul: inner dimensions differ")
		}
	}
	for _, row := range b {
		if len(row) != m {
			return nil, newErr(CodeInvalidInput, "MatMul: ragged matrix")
		}
	}
	return matMulUnchecked(a, b, n, k, m), nil
}

func matMulUnchecked(a, b Matrix, n, k, m int) Matrix {
	c := newMatrix(n, m)
	for i := 0; i < n; i++ {
		for j := 0; j < m; j++ {
			s := 0.0
			for l := 0; l < k; l++ {
				s += a[i][l] * b[l][j]
			}
			c[i][j] = s
		}
	}
	return c
}

func matAdd(a, b Matrix) Matrix {
	c := newMatrix(len(a), len(a))
	for i := range a {
		for j := range a[i] {
			c[i][j] = a[i][j] + b[i][j]
		}
	}
	return c
}

func matSub(a, b Matrix) Matrix {
	c := newMatrix(len(a), len(a))
	for i := range a {
		for j := range a[i] {
			c[i][j] = a[i][j] - b[i][j]
		}
	}
	return c
}

// quadrants splits the square matrix m (size 2h) into its four h×h blocks.
func quadrants(m Matrix, h int) (m11, m12, m21, m22 Matrix) {
	m11, m12, m21, m22 = newMatrix(h, h), newMatrix(h, h), newMatrix(h, h), newMatrix(h, h)
	for i := 0; i < h; i++ {
		copy(m11[i], m[i][:h])
		copy(m12[i], m[i][h:])
		copy(m21[i], m[i+h][:h])
		copy(m22[i], m[i+h][h:])
	}
	return
}

func strassenRec(a, b Matrix) Matrix {
	n := len(a)
	if n <= 64 {
		return matMulUnchecked(a, b, n, n, n)
	}
	h := n >> 1
	a11, a12, a21, a22 := quadrants(a, h)
	b11, b12, b21, b22 := quadrants(b, h)
	m1 := strassenRec(matAdd(a11, a22), matAdd(b11, b22))
	m2 := strassenRec(matAdd(a21, a22), b11)
	m3 := strassenRec(a11, matSub(b12, b22))
	m4 := strassenRec(a22, matSub(b21, b11))
	m5 := strassenRec(matAdd(a11, a12), b22)
	m6 := strassenRec(matSub(a21, a11), matAdd(b11, b12))
	m7 := strassenRec(matSub(a12, a22), matAdd(b21, b22))
	c11 := matAdd(matSub(matAdd(m1, m4), m5), m7)
	c12 := matAdd(m3, m5)
	c21 := matAdd(m2, m4)
	c22 := matAdd(matSub(matAdd(m1, m3), m2), m6)
	c := newMatrix(n, n)
	for i := 0; i < h; i++ {
		copy(c[i][:h], c11[i])
		copy(c[i][h:], c12[i])
		copy(c[i+h][:h], c21[i])
		copy(c[i+h][h:], c22[i])
	}
	return c
}

// Strassen returns a·b for square n×n matrices (else INVALID_INPUT) with Strassen's algorithm
// (naive product below 64×64). Sizes that are not a power of two are zero-padded and the result
// is cropped.
func Strassen(a, b Matrix) (Matrix, error) {
	n := len(a)
	square := func(m Matrix) bool {
		if len(m) != n {
			return false
		}
		for _, r := range m {
			if len(r) != n {
				return false
			}
		}
		return true
	}
	if !square(a) || !square(b) {
		return nil, newErr(CodeInvalidInput, "Strassen: a and b must both be n×n")
	}
	if n == 0 {
		return Matrix{}, nil
	}
	p := 1
	for p < n {
		p <<= 1
	}
	if p == n {
		return strassenRec(a, b), nil
	}
	pad := func(m Matrix) Matrix {
		out := newMatrix(p, p)
		for i := 0; i < n; i++ {
			copy(out[i], m[i])
		}
		return out
	}
	full := strassenRec(pad(a), pad(b))
	c := full[:n]
	for i := range c {
		c[i] = c[i][:n]
	}
	return c, nil
}

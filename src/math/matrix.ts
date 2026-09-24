// LombokAlgoritma — Matrix Operations
// Apache-2.0 — @codinglombok
// Naive multiply O(n³) and Strassen O(n^2.807)

export type Matrix = number[][];

export function matCreate(rows: number, cols: number, fill = 0): Matrix {
  return Array.from({ length: rows }, () => new Array<number>(cols).fill(fill));
}

/**
 * Naive O(n·m·k) product of an n×k and a k×m matrix.
 * @throws RangeError when the inner dimensions differ
 */
export function matMul(A: Matrix, B: Matrix): Matrix {
  const n = A.length;
  const k = B.length;
  const m = B[0]?.length ?? 0;
  if (A.some((r) => r.length !== k)) throw new RangeError('matMul: inner dimensions differ');
  const C = matCreate(n, m);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) for (let l = 0; l < k; l++) C[i]![j]! += A[i]![l]! * B[l]![j]!;
  return C;
}

export function matAdd(A: Matrix, B: Matrix): Matrix {
  return A.map((row, i) => row.map((v, j) => v + B[i]![j]!));
}

export function matSub(A: Matrix, B: Matrix): Matrix {
  return A.map((row, i) => row.map((v, j) => v - B[i]![j]!));
}

function strassen(A: Matrix, B: Matrix): Matrix {
  const n = A.length;
  if (n <= 64) return matMul(A, B);
  const h = n >> 1;
  const [a11, a12, a21, a22] = split(A, h);
  const [b11, b12, b21, b22] = split(B, h);
  const m1 = strassen(matAdd(a11, a22), matAdd(b11, b22));
  const m2 = strassen(matAdd(a21, a22), b11);
  const m3 = strassen(a11, matSub(b12, b22));
  const m4 = strassen(a22, matSub(b21, b11));
  const m5 = strassen(matAdd(a11, a12), b22);
  const m6 = strassen(matSub(a21, a11), matAdd(b11, b12));
  const m7 = strassen(matSub(a12, a22), matAdd(b21, b22));
  const c11 = matAdd(matSub(matAdd(m1, m4), m5), m7);
  const c12 = matAdd(m3, m5);
  const c21 = matAdd(m2, m4);
  const c22 = matAdd(matSub(matAdd(m1, m3), m2), m6);
  return join(c11, c12, c21, c22, h);
}

function split(M: Matrix, h: number): [Matrix, Matrix, Matrix, Matrix] {
  return [
    M.slice(0, h).map((r) => r.slice(0, h)),
    M.slice(0, h).map((r) => r.slice(h)),
    M.slice(h).map((r) => r.slice(0, h)),
    M.slice(h).map((r) => r.slice(h)),
  ];
}

function join(c11: Matrix, c12: Matrix, c21: Matrix, c22: Matrix, h: number): Matrix {
  const n = 2 * h;
  const C = matCreate(n, n);
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < h; j++) {
      C[i]![j] = c11[i]![j]!;
      C[i]![j + h] = c12[i]![j]!;
    }
  }
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < h; j++) {
      C[i + h]![j] = c21[i]![j]!;
      C[i + h]![j + h] = c22[i]![j]!;
    }
  }
  return C;
}

/**
 * Strassen matrix multiplication O(n^2.807) for square n×n matrices.
 *
 * Inputs whose size is not a power of two are zero-padded to the next power of two and the
 * result is cropped (v0.1.0 split odd sizes > 64 into unequal quadrants and returned garbage).
 *
 * @throws RangeError when A or B is not n×n
 */
export function strassenMul(A: Matrix, B: Matrix): Matrix {
  const n = A.length;
  const square = (M: Matrix): boolean => M.length === n && M.every((r) => r.length === n);
  if (!square(A) || !square(B)) throw new RangeError('strassenMul: A and B must both be n×n');
  if (n === 0) return [];
  let p = 1;
  while (p < n) p <<= 1;
  if (p === n) return strassen(A, B);
  const pad = (M: Matrix): Matrix =>
    Array.from({ length: p }, (_, i) =>
      Array.from({ length: p }, (_, j) => (i < n && j < n ? (M[i]?.[j] ?? 0) : 0)),
    );
  return strassen(pad(A), pad(B))
    .slice(0, n)
    .map((r) => r.slice(0, n));
}

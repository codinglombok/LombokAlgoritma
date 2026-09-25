// LombokAlgoritma — Karatsuba Multiplication
// Apache-2.0 — @codinglombok
// DIPAKAI: LombokEncryptDecrypt (RSA big-integer operations)
// O(n^1.585) — faster than naive O(n^2) for large integers

/** Karatsuba multiplication for bigint */
export function karatsuba(x: bigint, y: bigint): bigint {
  if (x < 0n) return -karatsuba(-x, y);
  if (y < 0n) return -karatsuba(x, -y);
  // Base case
  if (x < 1000n || y < 1000n) return x * y;
  // Split: x = x1 * B + x0, y = y1 * B + y0
  const n = Math.max(x.toString().length, y.toString().length);
  const half = BigInt(Math.ceil(n / 2));
  const B = 10n ** half;
  const x1 = x / B;
  const x0 = x % B;
  const y1 = y / B;
  const y0 = y % B;
  const z0 = karatsuba(x0, y0);
  const z2 = karatsuba(x1, y1);
  const z1 = karatsuba(x0 + x1, y0 + y1) - z2 - z0;
  return z2 * B * B + z1 * B + z0;
}

// LombokAlgoritma — Numeric Utilities
// Apache-2.0 — @codinglombok

/** Clamp a number to [min, max] */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Check if two floats are approximately equal */
export function approxEq(a: number, b: number, epsilon = 1e-9): boolean {
  return Math.abs(a - b) <= epsilon;
}

/** Absolute difference */
export function absDiff(a: number, b: number): number {
  return Math.abs(a - b);
}

/** Determine if a number is a power of two */
export function isPow2(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/** Integer square root (floor) */
export function isqrt(n: number): number {
  if (n < 0) throw new RangeError('isqrt: negative input');
  if (n === 0) return 0;
  let x = Math.floor(Math.sqrt(n));
  // Newton correction for float precision
  while (x * x > n) x--;
  while ((x + 1) * (x + 1) <= n) x++;
  return x;
}

/** Ceiling division: ceil(a / b) for positive integers */
export function ceilDiv(a: number, b: number): number {
  if (b === 0) throw new RangeError('Division by zero');
  return Math.floor((a + b - 1) / b);
}

/** Round up to multiple of align */
export function alignUp(n: number, align: number): number {
  return ceilDiv(n, align) * align;
}

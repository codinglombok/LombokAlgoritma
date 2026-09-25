// LombokAlgoritma — Safe Integer Arithmetic
// Apache-2.0 — @codinglombok
// Zero-tolerance for silent integer overflow

import { OverflowError } from './errors.js';

const I32_MAX = 2147483647;
const I32_MIN = -2147483648;

/** Safe add — throws on overflow for 32-bit signed */
export function addI32(a: number, b: number): number {
  const result = a + b;
  if (result > I32_MAX || result < I32_MIN) throw new OverflowError('addI32', result);
  return result | 0;
}

/** Saturating add — clamps instead of throwing */
export function satAddI32(a: number, b: number): number {
  const result = a + b;
  if (result > I32_MAX) return I32_MAX;
  if (result < I32_MIN) return I32_MIN;
  return result | 0;
}

/** Safe multiply for JS safe integers */
export function mulSafe(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  const result = a * b;
  if (!Number.isSafeInteger(result)) throw new OverflowError('mulSafe', result);
  return result;
}

/** Checked unsigned 32-bit add */
export function addU32(a: number, b: number): number {
  const result = ((a >>> 0) + (b >>> 0)) >>> 0;
  if (result < a >>> 0) throw new OverflowError('addU32', result);
  return result;
}

/** Wrapping add — wrap-around semantics (for hash functions etc.) */
export function wrapAddU32(a: number, b: number): number {
  return ((a >>> 0) + (b >>> 0)) >>> 0;
}

/** Wrapping multiply U32 */
export function wrapMulU32(a: number, b: number): number {
  // Split into 16-bit halves to avoid precision loss
  const ah = (a >>> 16) & 0xffff;
  const al = a & 0xffff;
  const bh = (b >>> 16) & 0xffff;
  const bl = b & 0xffff;
  const lo = al * bl;
  const mid = (al * bh + ah * bl) & 0xffff;
  return (lo + (mid << 16)) >>> 0;
}

/** Safe integer check */
export function assertSafeInt(n: number, name = 'value'): void {
  if (!Number.isSafeInteger(n)) throw new OverflowError(name, n);
}

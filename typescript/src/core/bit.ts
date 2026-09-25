// LombokAlgoritma — Bit Manipulation Utilities
// Apache-2.0 — @codinglombok
// Used by: LombokSimHash (Hamming distance), constant-time crypto ops

import { InvalidInputError } from './errors.js';
/** Population count (number of 1-bits in a 32-bit integer) */
export function popcount32(n: number): number {
  // Kernighan-based via de Bruijn — branch-free
  let x = n >>> 0;
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >>> 24;
}

/** Count leading zeros in a 32-bit unsigned integer */
export function clz32(n: number): number {
  if (n === 0) return 32;
  return Math.clz32(n);
}

/** Count trailing zeros */
export function ctz32(n: number): number {
  if (n === 0) return 32;
  return popcount32(~n & (n - 1));
}

/** Hamming distance between two 32-bit words */
export function hammingDistance32(a: number, b: number): number {
  return popcount32(a ^ b);
}

/** Hamming distance between two Uint8Arrays (constant-time safe) */
export function hammingDistanceBytes(a: Uint8Array, b: Uint8Array): number {
  if (a.length !== b.length) throw new InvalidInputError('Length mismatch');
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    dist += popcount32((a[i] ?? 0) ^ (b[i] ?? 0));
  }
  return dist;
}

/** Next power of two (>= n) */
export function nextPow2(n: number): number {
  if (n <= 1) return 1;
  let x = n - 1;
  x |= x >> 1;
  x |= x >> 2;
  x |= x >> 4;
  x |= x >> 8;
  x |= x >> 16;
  return (x + 1) >>> 0;
}

/** Rotate left 32-bit */
export function rotl32(n: number, k: number): number {
  return ((n << k) | (n >>> (32 - k))) >>> 0;
}

/** Rotate right 32-bit */
export function rotr32(n: number, k: number): number {
  return ((n >>> k) | (n << (32 - k))) >>> 0;
}

/** Constant-time select: returns a if cond===1, b if cond===0 (branchless) */
export function ctSelect32(cond: number, a: number, b: number): number {
  // cond MUST be 0 or 1
  const mask = -cond | 0; // 0xFFFFFFFF if cond=1, 0x00000000 if cond=0
  return ((mask & a) | (~mask & b)) >>> 0;
}

/** Constant-time comparison: returns 1 if a===b, 0 otherwise */
export function ctEqual(a: Uint8Array, b: Uint8Array): number {
  if (a.length !== b.length) return 0;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  // diff === 0 iff equal; -diff >>> 31 = 1 if diff!=0, 0 if diff=0
  // We want 1 if equal:
  return (1 - ((-diff >>> 31) | (diff >>> 31))) >>> 0;
}

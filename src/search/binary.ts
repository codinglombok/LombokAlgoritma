// LombokAlgoritma — Binary Search & Variants
// Apache-2.0 — @codinglombok
// O(log n) time, O(1) space. Array must be sorted.

import type { CompareFn } from '../core/types.js';
import { defaultCompareFn } from '../core/types.js';

/** Standard binary search. Returns index or -1. */
export function binarySearch<T>(
  arr: T[],
  target: T,
  cmp: CompareFn<T> = defaultCompareFn as CompareFn<T>,
): number {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const c = cmp(arr[mid] as T, target);
    if (c === 0) return mid;
    if (c < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

/** Lower bound — first index where arr[i] >= target */
export function lowerBound<T>(
  arr: T[],
  target: T,
  cmp: CompareFn<T> = defaultCompareFn as CompareFn<T>,
): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (cmp(arr[mid] as T, target) < 0) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Upper bound — first index where arr[i] > target */
export function upperBound<T>(
  arr: T[],
  target: T,
  cmp: CompareFn<T> = defaultCompareFn as CompareFn<T>,
): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (cmp(arr[mid] as T, target) <= 0) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Interpolation search for uniformly distributed integer arrays. O(log log n) avg. */
export function interpolationSearch(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi && target >= (arr[lo] as number) && target <= (arr[hi] as number)) {
    if (lo === hi) return (arr[lo] as number) === target ? lo : -1;
    const range = (arr[hi] as number) - (arr[lo] as number);
    if (range === 0) return (arr[lo] as number) === target ? lo : -1;
    const pos = lo + Math.floor(((hi - lo) * (target - (arr[lo] as number))) / range);
    if ((arr[pos] as number) === target) return pos;
    if ((arr[pos] as number) < target) lo = pos + 1;
    else hi = pos - 1;
  }
  return -1;
}

/** Exponential search — finds range then binary searches. O(log n). */
export function exponentialSearch<T>(
  arr: T[],
  target: T,
  cmp: CompareFn<T> = defaultCompareFn as CompareFn<T>,
): number {
  if (arr.length === 0) return -1;
  if (cmp(arr[0] as T, target) === 0) return 0;
  let bound = 1;
  while (bound < arr.length && cmp(arr[bound] as T, target) < 0) bound *= 2;
  const lo = Math.floor(bound / 2);
  const hi = Math.min(bound, arr.length - 1);
  const sub = arr.slice(lo, hi + 1);
  const idx = binarySearch(sub, target, cmp);
  return idx === -1 ? -1 : lo + idx;
}

/** Jump search. O(sqrt(n)). Optimal block size = sqrt(n). */
export function jumpSearch<T>(
  arr: T[],
  target: T,
  cmp: CompareFn<T> = defaultCompareFn as CompareFn<T>,
): number {
  const n = arr.length;
  const step = Math.max(1, Math.floor(Math.sqrt(n)));
  let prev = 0;
  let curr = step;
  while (curr < n && cmp(arr[curr] as T, target) < 0) {
    prev = curr;
    curr += step;
  }
  // The block is [prev, curr] inclusive: arr[curr] may itself equal target.
  for (let i = prev; i <= Math.min(curr, n - 1); i++) {
    if (cmp(arr[i] as T, target) === 0) return i;
  }
  return -1;
}

/** Fibonacci search. O(log n). Cache-friendly for large sorted arrays. */
export function fibonacciSearch<T>(
  arr: T[],
  target: T,
  cmp: CompareFn<T> = defaultCompareFn as CompareFn<T>,
): number {
  const n = arr.length;
  let fibMm2 = 0;
  let fibMm1 = 1;
  let fibM = 1;
  while (fibM < n) {
    fibMm2 = fibMm1;
    fibMm1 = fibM;
    fibM = fibMm1 + fibMm2;
  }
  let offset = -1;
  while (fibM > 1) {
    const i = Math.min(offset + fibMm2, n - 1);
    const c = cmp(arr[i] as T, target);
    if (c < 0) {
      fibM = fibMm1;
      fibMm1 = fibMm2;
      fibMm2 = fibM - fibMm1;
      offset = i;
    } else if (c > 0) {
      fibM = fibMm2;
      fibMm1 -= fibMm2;
      fibMm2 = fibM - fibMm1;
    } else return i;
  }
  if (fibMm1 && offset + 1 < n && cmp(arr[offset + 1] as T, target) === 0) return offset + 1;
  return -1;
}

/** Linear search — baseline, O(n) */
export function linearSearch<T>(
  arr: T[],
  target: T,
  eq: (a: T, b: T) => boolean = (a, b) => a === b,
): number {
  for (let i = 0; i < arr.length; i++) {
    if (eq(arr[i] as T, target)) return i;
  }
  return -1;
}

/** Ternary search for unimodal function. Returns x that maximizes/minimizes f(x). */
export function ternarySearch(
  lo: number,
  hi: number,
  f: (x: number) => number,
  { maximize = true, epsilon = 1e-9 }: { maximize?: boolean; epsilon?: number } = {},
): number {
  while (hi - lo > epsilon) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    if (maximize ? f(m1) < f(m2) : f(m1) > f(m2)) lo = m1;
    else hi = m2;
  }
  return (lo + hi) / 2;
}

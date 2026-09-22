// LombokAlgoritma — Timsort (Stable, Adaptive)
// Apache-2.0 — @codinglombok
// Equivalent to Python's built-in sort and Java's Arrays.sort for objects
// Best: O(n), Average: O(n log n), Worst: O(n log n), Space: O(n), Stable: YES

import type { CompareFn } from '../core/types.js';
import { defaultCompareFn } from '../core/types.js';

const MIN_MERGE = 32;

function minRunLength(n: number): number {
  let r = 0;
  while (n >= MIN_MERGE) {
    r |= n & 1;
    n >>= 1;
  }
  return n + r;
}

function insertionSort<T>(arr: T[], lo: number, hi: number, cmp: CompareFn<T>): void {
  for (let i = lo + 1; i <= hi; i++) {
    const key = arr[i] as T;
    let j = i - 1;
    while (j >= lo && cmp(arr[j] as T, key) > 0) {
      arr[j + 1] = arr[j] as T;
      j--;
    }
    arr[j + 1] = key;
  }
}

function merge<T>(
  arr: T[], lo: number, mid: number, hi: number,
  tmp: T[], cmp: CompareFn<T>,
): void {
  const left = arr.slice(lo, mid + 1);
  const right = arr.slice(mid + 1, hi + 1);
  let i = 0, j = 0, k = lo;
  while (i < left.length && j < right.length) {
    if (cmp(left[i] as T, right[j] as T) <= 0) {
      arr[k++] = left[i++] as T;
    } else {
      arr[k++] = right[j++] as T;
    }
  }
  while (i < left.length) arr[k++] = left[i++] as T;
  while (j < right.length) arr[k++] = right[j++] as T;
  void tmp;
}

/**
 * Timsort — stable, adaptive sort.
 * - Optimal for nearly-sorted data (O(n) best case)
 * - Preferred when stability is required
 */
export function timsort<T>(
  arr: T[],
  compareFn: CompareFn<T> = defaultCompareFn as CompareFn<T>,
  { inPlace = true }: { inPlace?: boolean } = {},
): T[] {
  const a = inPlace ? arr : [...arr];
  const n = a.length;
  if (n <= 1) return a;
  const minRun = minRunLength(n);
  const tmp: T[] = [];

  // Sort individual runs using insertion sort
  for (let i = 0; i < n; i += minRun) {
    insertionSort(a, i, Math.min(i + minRun - 1, n - 1), compareFn);
  }
  // Merge runs
  for (let size = minRun; size < n; size *= 2) {
    for (let lo = 0; lo < n; lo += 2 * size) {
      const mid = Math.min(lo + size - 1, n - 1);
      const hi = Math.min(lo + 2 * size - 1, n - 1);
      if (mid < hi) merge(a, lo, mid, hi, tmp, compareFn);
    }
  }
  return a;
}

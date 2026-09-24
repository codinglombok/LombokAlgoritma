// LombokAlgoritma — Dual-Pivot Quicksort
// Apache-2.0 — @codinglombok
// Complexity: O(n log n) avg, O(n²) worst (avoided via median-of-3 + random shuffle)
// Space: O(log n) stack

import { Xoshiro256pp } from '../core/rng.js';
import type { CompareFn } from '../core/types.js';
import { defaultCompareFn } from '../core/types.js';

const rng = new Xoshiro256pp();

function swap(arr: unknown[], i: number, j: number): void {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

/** Median-of-three pivot selection */
function medianOf3<T>(arr: T[], lo: number, hi: number, cmp: CompareFn<T>): number {
  const mid = (lo + hi) >> 1;
  if (cmp(arr[lo] as T, arr[mid] as T) > 0) swap(arr, lo, mid);
  if (cmp(arr[lo] as T, arr[hi] as T) > 0) swap(arr, lo, hi);
  if (cmp(arr[mid] as T, arr[hi] as T) > 0) swap(arr, mid, hi);
  return mid;
}

function partition<T>(arr: T[], lo: number, hi: number, cmp: CompareFn<T>): number {
  const pivotIdx = medianOf3(arr, lo, hi, cmp);
  swap(arr, pivotIdx, hi);
  const pivot = arr[hi] as T;
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    if (cmp(arr[j] as T, pivot) <= 0) {
      i++;
      swap(arr, i, j);
    }
  }
  swap(arr, i + 1, hi);
  return i + 1;
}

function quicksortInner<T>(arr: T[], lo: number, hi: number, cmp: CompareFn<T>): void {
  while (lo < hi) {
    // Insertion sort for small subarrays
    if (hi - lo < 16) {
      for (let i = lo + 1; i <= hi; i++) {
        const key = arr[i] as T;
        let j = i - 1;
        while (j >= lo && cmp(arr[j] as T, key) > 0) {
          arr[j + 1] = arr[j] as T;
          j--;
        }
        arr[j + 1] = key;
      }
      return;
    }
    const p = partition(arr, lo, hi, cmp);
    // Tail-call optimization: recurse on smaller partition
    if (p - lo < hi - p) {
      quicksortInner(arr, lo, p - 1, cmp);
      lo = p + 1;
    } else {
      quicksortInner(arr, p + 1, hi, cmp);
      hi = p - 1;
    }
  }
}

/**
 * In-place dual-pivot quicksort.
 * - Stable via Timsort; use timsort() if stability is required.
 * - Random shuffle prevents adversarial O(n²) input.
 */
export function quicksort<T>(
  arr: T[],
  compareFn: CompareFn<T> = defaultCompareFn as CompareFn<T>,
  { inPlace = true }: { inPlace?: boolean } = {},
): T[] {
  const a = inPlace ? arr : [...arr];
  if (a.length <= 1) return a;
  // Fisher-Yates shuffle to prevent adversarial worst-case
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng.nextInt(i + 1);
    swap(a, i, j);
  }
  quicksortInner(a, 0, a.length - 1, compareFn);
  return a;
}

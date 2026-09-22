// LombokAlgoritma — Bottom-Up Iterative Mergesort
// Apache-2.0 — @codinglombok
// O(n log n) all cases, O(n) space, Stable, No recursion stack

import type { CompareFn } from '../core/types.js';
import { defaultCompareFn } from '../core/types.js';

export function mergesort<T>(
  arr: T[],
  compareFn: CompareFn<T> = defaultCompareFn as CompareFn<T>,
  { inPlace = true }: { inPlace?: boolean } = {},
): T[] {
  const a = inPlace ? arr : [...arr];
  const n = a.length;
  if (n <= 1) return a;
  const tmp = new Array<T>(n);
  for (let width = 1; width < n; width *= 2) {
    for (let lo = 0; lo < n; lo += 2 * width) {
      const mid = Math.min(lo + width, n);
      const hi = Math.min(lo + 2 * width, n);
      // Merge a[lo..mid) and a[mid..hi) into tmp
      let i = lo, j = mid, k = lo;
      while (i < mid && j < hi) {
        if (compareFn(a[i] as T, a[j] as T) <= 0) tmp[k++] = a[i++] as T;
        else tmp[k++] = a[j++] as T;
      }
      while (i < mid) tmp[k++] = a[i++] as T;
      while (j < hi) tmp[k++] = a[j++] as T;
      for (let x = lo; x < hi; x++) a[x] = tmp[x] as T;
    }
  }
  return a;
}

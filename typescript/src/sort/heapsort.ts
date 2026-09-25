// LombokAlgoritma — Heapsort (In-place)
// Apache-2.0 — @codinglombok
// O(n log n) all cases, O(1) space, Not stable

import type { CompareFn } from '../core/types.js';
import { defaultCompareFn } from '../core/types.js';

function siftDown<T>(arr: T[], root: number, end: number, cmp: CompareFn<T>): void {
  for (;;) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;
    if (left < end && cmp(arr[left] as T, arr[largest] as T) > 0) largest = left;
    if (right < end && cmp(arr[right] as T, arr[largest] as T) > 0) largest = right;
    if (largest === root) break;
    [arr[root], arr[largest]] = [arr[largest] as T, arr[root] as T];
    root = largest;
  }
}

export function heapsort<T>(
  arr: T[],
  compareFn: CompareFn<T> = defaultCompareFn as CompareFn<T>,
  { inPlace = true }: { inPlace?: boolean } = {},
): T[] {
  const a = inPlace ? arr : [...arr];
  const n = a.length;
  if (n <= 1) return a;
  // Build max-heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(a, i, n, compareFn);
  // Extract elements
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end] as T, a[0] as T];
    siftDown(a, 0, end, compareFn);
  }
  return a;
}

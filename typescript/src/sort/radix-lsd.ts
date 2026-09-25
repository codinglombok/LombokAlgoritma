// LombokAlgoritma — LSD Radix Sort
// Apache-2.0 — @codinglombok
// O(nk) time, O(n+k) space, Stable. Best for integers.

/** LSD Radix sort for integer arrays */
export function radixSortLSD(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const a = [...arr];
  const maxVal = Math.max(...a);
  const minVal = Math.min(...a);
  // Handle negatives by shifting
  const shift = minVal < 0 ? -minVal : 0;
  for (let i = 0; i < a.length; i++) a[i] = (a[i] as number) + shift;
  const max = maxVal + shift;
  // Process each digit
  let exp = 1;
  const out = new Array<number>(a.length);
  while (Math.floor(max / exp) > 0) {
    const count = new Array<number>(10).fill(0);
    for (const v of a) {
      const d = Math.floor(v / exp) % 10;
      count[d] = (count[d] ?? 0) + 1;
    }
    for (let i = 1; i < 10; i++) (count[i] as number) += count[i - 1] as number;
    for (let i = a.length - 1; i >= 0; i--) {
      const digit = Math.floor((a[i] as number) / exp) % 10;
      const pos = (count[digit] as number) - 1;
      count[digit] = pos;
      out[pos] = a[i] as number;
    }
    for (let i = 0; i < a.length; i++) a[i] = out[i] as number;
    exp *= 10;
  }
  // Remove shift
  for (let i = 0; i < a.length; i++) (a[i] as number) -= shift;
  return a;
}

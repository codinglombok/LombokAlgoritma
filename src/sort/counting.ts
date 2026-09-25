// LombokAlgoritma — Counting Sort
// Apache-2.0 — @codinglombok
// O(n+k) time/space. For integers in small range [0, k].

export function countingSort(arr: number[], maxVal?: number): number[] {
  if (arr.length <= 1) return [...arr];
  const k = maxVal ?? Math.max(...arr);
  const count = new Array<number>(k + 1).fill(0);
  for (const v of arr) {
    if (!Number.isInteger(v) || v < 0 || v > k) {
      throw new RangeError(`countingSort: value ${v} outside integer range [0, ${k}]`);
    }
    count[v] = (count[v] ?? 0) + 1;
  }
  const out: number[] = [];
  for (let i = 0; i <= k; i++) {
    for (let j = 0; j < (count[i] as number); j++) out.push(i);
  }
  return out;
}

// LombokAlgoritma — Counting Sort
// Apache-2.0 — @codinglombok
// O(n+k) time/space. For integers in small range [0, k].

export function countingSort(arr: number[], maxVal?: number): number[] {
  if (arr.length <= 1) return [...arr];
  const k = maxVal ?? Math.max(...arr);
  const count = new Array<number>(k + 1).fill(0);
  for (const v of arr) count[v]++;
  const out: number[] = [];
  for (let i = 0; i <= k; i++) {
    for (let j = 0; j < (count[i] as number); j++) out.push(i);
  }
  return out;
}

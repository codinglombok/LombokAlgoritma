// LombokAlgoritma — Knuth–Morris–Pratt string search
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
// O(n + m) time, O(m) space. Text and pattern are sequences of Unicode code points and the returned
// indices are code-point offsets (SPEC §5.1).

/** KMP failure function (longest proper prefix that is also a suffix). */
function buildFailure(pattern: readonly string[]): number[] {
  const m = pattern.length;
  const f = new Array<number>(m).fill(0);
  let k = 0;
  for (let i = 1; i < m; i++) {
    while (k > 0 && pattern[k] !== pattern[i]) k = f[k - 1] as number;
    if (pattern[k] === pattern[i]) k++;
    f[i] = k;
  }
  return f;
}

/** All (possibly overlapping) starting code-point indices of `pattern` in `text`; `[]` for an empty pattern. */
export function kmpSearch(text: string, pattern: string): number[] {
  const p = Array.from(pattern);
  if (p.length === 0) return [];
  const t = Array.from(text);
  const f = buildFailure(p);
  const results: number[] = [];
  let k = 0;
  for (let i = 0; i < t.length; i++) {
    while (k > 0 && p[k] !== t[i]) k = f[k - 1] as number;
    if (p[k] === t[i]) k++;
    if (k === p.length) {
      results.push(i - k + 1);
      k = f[k - 1] as number;
    }
  }
  return results;
}

/** First match index, or −1. */
export function kmpFind(text: string, pattern: string): number {
  return kmpSearch(text, pattern)[0] ?? -1;
}

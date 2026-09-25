// LombokAlgoritma — Levenshtein, Damerau–Levenshtein, Jaro, Jaro–Winkler
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
// Used by: LombokTableSheet (fuzzy formula), LombokFuzzer (corpus dedup)
//
// All functions operate on Unicode code points (SPEC §5.1): "😀" has length 1, not 2 UTF-16 units.
// v0.1.x compared UTF-16 code units, so a single astral character counted as two edits.

const cps = (s: string): string[] => Array.from(s);

/** Levenshtein distance (Wagner-Fischer) — O(mn) time, O(min(m,n)) space */
export function levenshtein(sa: string, sb: string): number {
  if (sa === sb) return 0;
  let a = cps(sa);
  let b = cps(sb);
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  // Use shorter string as column
  if (a.length > b.length) [a, b] = [b, a];
  let prev = Array.from({ length: a.length + 1 }, (_, i) => i);
  let curr = new Array<number>(a.length + 1);
  for (let j = 1; j <= b.length; j++) {
    curr[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        (curr[i - 1] as number) + 1,
        (prev[i] as number) + 1,
        (prev[i - 1] as number) + cost,
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[a.length] as number;
}

/** Damerau-Levenshtein (allows transpositions) */
export function damerauLevenshtein(sa: string, sb: string): number {
  const a = cps(sa);
  const b = cps(sb);
  const m = a.length,
    n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  // (m + 2) × (n + 2) table, row-major
  const w = n + 2;
  const d = new Array<number>((m + 2) * w).fill(0);
  const at = (i: number, j: number): number => d[i * w + j] as number;
  const set = (i: number, j: number, v: number): void => {
    d[i * w + j] = v;
  };
  const maxDist = m + n;
  set(0, 0, maxDist);
  for (let i = 0; i <= m; i++) {
    set(i + 1, 0, maxDist);
    set(i + 1, 1, i);
  }
  for (let j = 0; j <= n; j++) {
    set(0, j + 1, maxDist);
    set(1, j + 1, j);
  }
  const da = new Map<string, number>();
  for (let i = 1; i <= m; i++) {
    let db = 0;
    for (let j = 1; j <= n; j++) {
      const i1 = da.get(b[j - 1] as string) ?? 0;
      const j1 = db;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      if (cost === 0) db = j;
      set(
        i + 1,
        j + 1,
        Math.min(
          at(i, j) + cost,
          at(i + 1, j) + 1,
          at(i, j + 1) + 1,
          at(i1, j1) + (i - i1 - 1) + 1 + (j - j1 - 1),
        ),
      );
    }
    da.set(a[i - 1] as string, i);
  }
  return at(m + 1, n + 1);
}

/** Jaro similarity [0, 1] */
export function jaro(sa: string, sb: string): number {
  if (sa === sb) return 1;
  const a = cps(sa);
  const b = cps(sb);
  const matchDist = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  if (matchDist < 0) return 0;
  const aMatched = new Uint8Array(a.length);
  const bMatched = new Uint8Array(b.length);
  let matches = 0,
    transpositions = 0;
  for (let i = 0; i < a.length; i++) {
    const lo = Math.max(0, i - matchDist);
    const hi = Math.min(i + matchDist + 1, b.length);
    for (let j = lo; j < hi; j++) {
      if (bMatched[j] === 1 || a[i] !== b[j]) continue;
      aMatched[i] = 1;
      bMatched[j] = 1;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (aMatched[i] !== 1) continue;
    while (bMatched[k] !== 1) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  return (matches / a.length + matches / b.length + (matches - transpositions / 2) / matches) / 3;
}

/** Jaro-Winkler (boosts common prefix) */
export function jaroWinkler(sa: string, sb: string, p = 0.1): number {
  const j = jaro(sa, sb);
  const a = cps(sa);
  const b = cps(sb);
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(a.length, b.length)); i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }
  return j + prefix * p * (1 - j);
}

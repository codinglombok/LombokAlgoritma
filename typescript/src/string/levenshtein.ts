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
      curr[i] = Math.min(curr[i - 1]! + 1, prev[i]! + 1, prev[i - 1]! + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[a.length]!;
}

/** Damerau-Levenshtein (allows transpositions) */
export function damerauLevenshtein(sa: string, sb: string): number {
  const a = cps(sa);
  const b = cps(sb);
  const m = a.length,
    n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const d: number[][] = Array.from({ length: m + 2 }, () => new Array<number>(n + 2).fill(0));
  const maxDist = m + n;
  d[0]![0] = maxDist;
  for (let i = 0; i <= m; i++) {
    d[i + 1]![0] = maxDist;
    d[i + 1]![1] = i;
  }
  for (let j = 0; j <= n; j++) {
    d[0]![j + 1] = maxDist;
    d[1]![j + 1] = j;
  }
  const da = new Map<string, number>();
  for (let i = 1; i <= m; i++) {
    let db = 0;
    for (let j = 1; j <= n; j++) {
      const i1 = da.get(b[j - 1]!) ?? 0,
        j1 = db;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      if (!cost) db = j;
      d[i + 1]![j + 1] = Math.min(
        d[i]![j]! + cost,
        d[i + 1]![j]! + 1,
        d[i]![j + 1]! + 1,
        d[i1]![j1]! + (i - i1 - 1) + 1 + (j - j1 - 1),
      );
    }
    da.set(a[i - 1]!, i);
  }
  return d[m + 1]![n + 1]!;
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

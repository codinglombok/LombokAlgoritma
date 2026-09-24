// LombokAlgoritma — Knuth-Morris-Pratt String Search
// Apache-2.0 — @codinglombok
// O(n+m) time, O(m) space — optimal single-pattern search

/** Build KMP failure function (partial match table) */
function buildFailure(pattern: string): number[] {
  const m = pattern.length;
  const f = new Array<number>(m).fill(0);
  let k = 0;
  for (let i = 1; i < m; i++) {
    while (k > 0 && pattern[k] !== pattern[i]) k = f[k - 1]!;
    if (pattern[k] === pattern[i]) k++;
    f[i] = k;
  }
  return f;
}

/** KMP search: returns all starting indices of pattern in text */
export function kmpSearch(text: string, pattern: string): number[] {
  if (pattern.length === 0) return [];
  const f = buildFailure(pattern);
  const results: number[] = [];
  let k = 0;
  for (let i = 0; i < text.length; i++) {
    while (k > 0 && pattern[k] !== text[i]) k = f[k - 1]!;
    if (pattern[k] === text[i]) k++;
    if (k === pattern.length) {
      results.push(i - k + 1);
      k = f[k - 1]!;
    }
  }
  return results;
}

/** KMP first match only */
export function kmpFind(text: string, pattern: string): number {
  const results = kmpSearch(text, pattern);
  return results[0] ?? -1;
}

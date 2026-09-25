// LombokAlgoritma — Maximum bipartite matching (Hopcroft–Karp)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

import { OutOfRangeError } from '../core/errors.js';
/** Result of {@link bipartiteMatching}. */
export interface MatchingResult {
  /** Number of matched pairs (normative, SPEC §6.14). */
  size: number;
  /** `matchLeft[u]` = matched right vertex of left vertex `u`, or −1. */
  matchLeft: number[];
  /** `matchRight[v]` = matched left vertex of right vertex `v`, or −1. */
  matchRight: number[];
}

/**
 * Maximum matching of the bipartite graph with left vertices `0 … nLeft − 1`, right vertices
 * `0 … nRight − 1` and `pairs` = `[left, right]` edges. Hopcroft–Karp, O(E·√V).
 * The matching *size* is normative; which maximum matching is returned is not.
 *
 * @throws RangeError for an edge outside the vertex ranges
 */
export function bipartiteMatching(
  nLeft: number,
  nRight: number,
  pairs: ReadonlyArray<readonly [number, number]>,
): MatchingResult {
  const adj: number[][] = Array.from({ length: nLeft }, () => []);
  for (const [u, v] of pairs) {
    if (
      !(Number.isInteger(u) && Number.isInteger(v) && u >= 0 && u < nLeft && v >= 0 && v < nRight)
    ) {
      throw new OutOfRangeError(`bipartiteMatching: edge [${u}, ${v}] out of range`);
    }
    (adj[u] as number[]).push(v);
  }
  const matchLeft = new Array<number>(nLeft).fill(-1);
  const matchRight = new Array<number>(nRight).fill(-1);
  const dist = new Array<number>(nLeft).fill(0);
  const INF = Number.POSITIVE_INFINITY;

  const bfs = (): boolean => {
    const q: number[] = [];
    for (let u = 0; u < nLeft; u++) {
      if (matchLeft[u] === -1) {
        dist[u] = 0;
        q.push(u);
      } else dist[u] = INF;
    }
    let found = false;
    for (let h = 0; h < q.length; h++) {
      const u = q[h] as number;
      for (const v of adj[u] ?? []) {
        const w = matchRight[v] as number;
        if (w === -1) found = true;
        else if (dist[w] === INF) {
          dist[w] = (dist[u] as number) + 1;
          q.push(w);
        }
      }
    }
    return found;
  };

  // iterative DFS along the layered graph
  const it = new Array<number>(nLeft).fill(0);
  const tryAugment = (root: number): boolean => {
    const stack = [root];
    const via: number[] = []; // right vertex chosen at each level
    while (stack.length > 0) {
      const u = stack[stack.length - 1] as number;
      const nb = adj[u] ?? [];
      let pushed = false;
      while ((it[u] as number) < nb.length) {
        const v = nb[it[u] as number] as number;
        it[u] = (it[u] as number) + 1;
        const w = matchRight[v] as number;
        if (w === -1) {
          via.push(v);
          for (let k = stack.length - 1; k >= 0; k--) {
            const lu = stack[k] as number;
            const rv = via[k] as number;
            matchLeft[lu] = rv;
            matchRight[rv] = lu;
          }
          return true;
        }
        if (dist[w] === (dist[u] as number) + 1) {
          via.push(v);
          stack.push(w);
          pushed = true;
          break;
        }
      }
      if (pushed) continue;
      dist[u] = INF;
      stack.pop();
      via.pop();
    }
    return false;
  };

  let size = 0;
  while (bfs()) {
    it.fill(0);
    for (let u = 0; u < nLeft; u++) if (matchLeft[u] === -1 && tryAugment(u)) size++;
  }
  return { size, matchLeft, matchRight };
}

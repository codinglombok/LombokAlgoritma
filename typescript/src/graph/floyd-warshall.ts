// LombokAlgoritma — Floyd–Warshall all-pairs shortest paths
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { type Graph, validateGraph } from './types.js';

/**
 * All-pairs distances, `Infinity` when unreachable. Parallel edges keep the minimum weight.
 * Loop order k → i → j with a strict `<` update. O(V³). SPEC §6.7.
 */
export function floydWarshall(g: Graph): number[][] {
  validateGraph(g);
  const n = g.nodes;
  const dist = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => (i === j ? 0 : Number.POSITIVE_INFINITY)),
  );
  for (const e of g.edges) {
    if (
      !Number.isSafeInteger(e.from) ||
      !Number.isSafeInteger(e.to) ||
      e.from < 0 ||
      e.from >= n ||
      e.to < 0 ||
      e.to >= n
    ) {
      continue;
    }
    const row = dist[e.from] as number[];
    row[e.to] = Math.min(row[e.to] as number, e.weight);
  }
  for (let k = 0; k < n; k++) {
    const dk = dist[k] as number[];
    for (let i = 0; i < n; i++) {
      const di = dist[i] as number[];
      const dik = di[k] as number;
      if (dik === Number.POSITIVE_INFINITY) continue;
      for (let j = 0; j < n; j++) {
        const cand = dik + (dk[j] as number);
        if (cand < (di[j] as number)) di[j] = cand;
      }
    }
  }
  return dist;
}

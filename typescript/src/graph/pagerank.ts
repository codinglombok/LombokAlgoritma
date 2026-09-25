// LombokAlgoritma — PageRank (power iteration)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { OutOfRangeError } from '../core/errors.js';
import { type Graph, validateGraph } from './types.js';

/**
 * PageRank by a fixed number of power iterations, starting from 1/n. Mass of dangling nodes
 * (out-degree 0) is redistributed uniformly, so the ranks sum to 1 (v0.1.x dropped it).
 * Per iteration (SPEC §6.11, evaluation order is normative):
 *   dangling = Σ rank[u] for out-degree(u) = 0, u ascending
 *   base     = (1 − d) / n + (d · dangling) / n
 *   next[v]  = base;  for u ascending, for each edge u→v in edge-list order:
 *              next[v] += (d · rank[u]) / outDegree[u]
 */
export function pageRank(
  g: Graph,
  { damping = 0.85, iterations = 50 }: { damping?: number; iterations?: number } = {},
): number[] {
  validateGraph(g);
  const n = g.nodes;
  if (n === 0) return [];
  if (!(damping >= 0 && damping <= 1))
    throw new OutOfRangeError('pageRank: damping must be in [0, 1]');
  const outDegree = new Array<number>(n).fill(0);
  const outs: number[][] = Array.from({ length: n }, () => []);
  for (const e of g.edges) {
    outDegree[e.from] = (outDegree[e.from] as number) + 1;
    (outs[e.from] as number[]).push(e.to);
  }
  let rank = new Array<number>(n).fill(1 / n);
  for (let it = 0; it < iterations; it++) {
    let dangling = 0;
    for (let u = 0; u < n; u++) if (outDegree[u] === 0) dangling += rank[u] as number;
    const base = (1 - damping) / n + (damping * dangling) / n;
    const next = new Array<number>(n).fill(base);
    for (let u = 0; u < n; u++) {
      const deg = outDegree[u] as number;
      if (deg === 0) continue;
      const contrib = (damping * (rank[u] as number)) / deg;
      for (const v of outs[u] ?? []) next[v] = (next[v] as number) + contrib;
    }
    rank = next;
  }
  return rank;
}

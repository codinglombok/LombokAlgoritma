// LombokAlgoritma — Bellman–Ford single-source shortest paths (negative weights allowed)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { type Graph, assertNode, validateGraph } from './types.js';

/** Result of {@link bellmanFord}. */
export interface BellmanFordResult {
  /** Distance from the source (`Infinity` when unreachable). */
  distances: number[];
  /** `true` when a negative cycle is reachable from the source (distances are then not final). */
  hasNegativeCycle: boolean;
}

/**
 * Relaxes every edge in edge-list order for up to V − 1 rounds (stopping early when a round
 * changes nothing), then performs one detection round. O(V·E). SPEC §6.6.
 */
export function bellmanFord(g: Graph, source: number): BellmanFordResult {
  validateGraph(g);
  assertNode(g, source, 'source');
  const dist = new Array<number>(g.nodes).fill(Number.POSITIVE_INFINITY);
  dist[source] = 0;
  for (let round = 1; round < g.nodes; round++) {
    let changed = false;
    for (const e of g.edges) {
      const du = dist[e.from] as number;
      if (du !== Number.POSITIVE_INFINITY && du + e.weight < (dist[e.to] as number)) {
        dist[e.to] = du + e.weight;
        changed = true;
      }
    }
    if (!changed) break;
  }
  let hasNegativeCycle = false;
  for (const e of g.edges) {
    const du = dist[e.from] as number;
    if (du !== Number.POSITIVE_INFINITY && du + e.weight < (dist[e.to] as number)) {
      hasNegativeCycle = true;
      break;
    }
  }
  return { distances: dist, hasNegativeCycle };
}

// LombokAlgoritma — Breadth-first search
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { type Graph, assertNode, buildAdjList } from './types.js';

/**
 * Hop distance from `source` to every node (−1 when unreachable). O(V + E).
 * Neighbours are visited in edge-list order (SPEC §6.2).
 */
export function bfs(g: Graph, source: number): number[] {
  const adj = buildAdjList(g);
  assertNode(g, source, 'source');
  const dist = new Array<number>(g.nodes).fill(-1);
  dist[source] = 0;
  const queue = [source];
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head] as number;
    for (const { to } of adj[u] ?? []) {
      if (dist[to] === -1) {
        dist[to] = (dist[u] as number) + 1;
        queue.push(to);
      }
    }
  }
  return dist;
}

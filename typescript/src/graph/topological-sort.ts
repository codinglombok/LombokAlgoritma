// LombokAlgoritma — Topological sort (Kahn)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { type Graph, buildAdjList } from './types.js';

/**
 * Kahn's algorithm with a FIFO queue seeded with the zero-in-degree nodes in ascending order;
 * neighbours are released in edge-list order. Returns `[]` when the graph has a cycle.
 * O(V + E). SPEC §6.8.
 */
export function topologicalSort(g: Graph): number[] {
  const adj = buildAdjList(g);
  const indegree = new Array<number>(g.nodes).fill(0);
  for (const e of g.edges) indegree[e.to] = (indegree[e.to] as number) + 1;
  const queue: number[] = [];
  for (let i = 0; i < g.nodes; i++) if (indegree[i] === 0) queue.push(i);
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head] as number;
    for (const { to } of adj[u] ?? []) {
      indegree[to] = (indegree[to] as number) - 1;
      if (indegree[to] === 0) queue.push(to);
    }
  }
  return queue.length === g.nodes ? queue : [];
}

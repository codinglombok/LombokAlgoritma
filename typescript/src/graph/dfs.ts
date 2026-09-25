// LombokAlgoritma — Depth-first search
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { type Graph, assertNode, buildAdjList } from './types.js';

/**
 * Pre-order of an iterative DFS from `source`: pop a node, skip it if visited, otherwise emit it and
 * push its unvisited neighbours in *reverse* edge-list order (so they are explored in edge-list
 * order). O(V + E). SPEC §6.3.
 */
export function dfs(g: Graph, source: number): number[] {
  const adj = buildAdjList(g);
  assertNode(g, source, 'source');
  const visited = new Uint8Array(g.nodes);
  const order: number[] = [];
  const stack = [source];
  while (stack.length > 0) {
    const u = stack.pop() as number;
    if (visited[u] === 1) continue;
    visited[u] = 1;
    order.push(u);
    const out = adj[u] ?? [];
    for (let i = out.length - 1; i >= 0; i--) {
      const to = (out[i] as { to: number }).to;
      if (visited[to] === 0) stack.push(to);
    }
  }
  return order;
}

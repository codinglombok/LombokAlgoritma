// LombokAlgoritma — Dijkstra single-source shortest paths
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { NegativeWeightError } from '../core/errors.js';
import { MinHeap, tupleLess } from '../core/heap.js';
import { type Graph, assertNode, buildAdjList } from './types.js';

/**
 * Shortest distance from `source` to every node (`Infinity` when unreachable).
 * Binary heap keyed by `[distance, node]`, O((V + E) log V). SPEC §6.4.
 *
 * v0.1.x re-sorted the whole frontier on every pop (O(V² log V)).
 *
 * @throws RangeError on a negative edge weight
 */
export function dijkstra(g: Graph, source: number): number[] {
  const adj = buildAdjList(g);
  assertNode(g, source, 'source');
  if (g.edges.some((e) => e.weight < 0)) throw new NegativeWeightError('dijkstra');
  const dist = new Array<number>(g.nodes).fill(Number.POSITIVE_INFINITY);
  dist[source] = 0;
  const heap = new MinHeap<[number, number]>(tupleLess);
  heap.push([0, source]);
  for (let top = heap.pop(); top !== undefined; top = heap.pop()) {
    const [d, u] = top;
    if (d > (dist[u] as number)) continue;
    for (const { to, weight } of adj[u] ?? []) {
      const nd = d + weight;
      if (nd < (dist[to] as number)) {
        dist[to] = nd;
        heap.push([nd, to]);
      }
    }
  }
  return dist;
}

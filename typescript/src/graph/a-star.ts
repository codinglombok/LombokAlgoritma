// LombokAlgoritma — A* search
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { NegativeWeightError } from '../core/errors.js';
import { MinHeap, tupleLess } from '../core/heap.js';
import { type Graph, assertNode, buildAdjList } from './types.js';

/**
 * A* from `source` to `target` with an admissible `heuristic` (default 0 ⇒ Dijkstra).
 * Frontier keyed by `[g + h, node]`; stale entries are skipped; a node's predecessor is updated
 * only on a strict improvement. Returns the path (source … target) and its cost, or
 * `{ path: [], cost: Infinity }` when unreachable. SPEC §6.5.
 *
 * @throws RangeError on a negative edge weight
 */
export function aStar(
  g: Graph,
  source: number,
  target: number,
  heuristic: (node: number) => number = () => 0,
): { path: number[]; cost: number } {
  const adj = buildAdjList(g);
  assertNode(g, source, 'source');
  assertNode(g, target, 'target');
  if (g.edges.some((e) => e.weight < 0)) throw new NegativeWeightError('aStar');
  const gScore = new Array<number>(g.nodes).fill(Number.POSITIVE_INFINITY);
  const prev = new Array<number>(g.nodes).fill(-1);
  gScore[source] = 0;
  const heap = new MinHeap<[number, number]>(tupleLess);
  heap.push([heuristic(source), source]);
  for (let top = heap.pop(); top !== undefined; top = heap.pop()) {
    const [f, u] = top;
    const gu = gScore[u] as number;
    if (f > gu + heuristic(u)) continue; // stale entry
    if (u === target) {
      const path = [target];
      for (let cur = prev[target] as number; cur !== -1; cur = prev[cur] as number) path.push(cur);
      return { path: path.reverse(), cost: gu };
    }
    for (const { to, weight } of adj[u] ?? []) {
      const ng = gu + weight;
      if (ng < (gScore[to] as number)) {
        gScore[to] = ng;
        prev[to] = u;
        heap.push([ng + heuristic(to), to]);
      }
    }
  }
  return { path: [], cost: Number.POSITIVE_INFINITY };
}

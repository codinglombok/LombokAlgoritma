// LombokAlgoritma — Maximum flow (Dinic)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { InvalidInputError, NegativeWeightError } from '../core/errors.js';
import { type Graph, assertNode, validateGraph } from './types.js';

/**
 * Value of a maximum `source → sink` flow; edge weights are capacities (parallel edges add up).
 * Dinic's algorithm: BFS level graph + blocking flow by DFS with current-arc pointers.
 * O(V²·E). Only the flow *value* is normative (SPEC §6.13); it is exact for integer capacities
 * below 2^53.
 *
 * @throws RangeError on a negative capacity or source = sink
 */
export function dinic(g: Graph, source: number, sink: number): number {
  validateGraph(g);
  assertNode(g, source, 'source');
  assertNode(g, sink, 'sink');
  if (source === sink) throw new InvalidInputError('dinic: source and sink must differ');
  const n = g.nodes;
  // residual graph as parallel arrays; edge i and i ^ 1 are a forward/backward pair
  const to: number[] = [];
  const cap: number[] = [];
  const head: number[][] = Array.from({ length: n }, () => []);
  for (const e of g.edges) {
    if (e.weight < 0) throw new NegativeWeightError('dinic');
    (head[e.from] as number[]).push(to.length);
    to.push(e.to);
    cap.push(e.weight);
    (head[e.to] as number[]).push(to.length);
    to.push(e.from);
    cap.push(0);
  }
  const level = new Array<number>(n);
  const it = new Array<number>(n);
  const bfs = (): boolean => {
    level.fill(-1);
    level[source] = 0;
    const q = [source];
    for (let h = 0; h < q.length; h++) {
      const u = q[h] as number;
      for (const id of head[u] ?? []) {
        const v = to[id] as number;
        if ((cap[id] as number) > 0 && level[v] === -1) {
          level[v] = (level[u] as number) + 1;
          q.push(v);
        }
      }
    }
    return level[sink] !== -1;
  };
  // iterative blocking-flow DFS (augment one path at a time)
  const augment = (): number => {
    const path: number[] = []; // edge ids
    let u = source;
    for (;;) {
      if (u === sink) {
        let f = Number.POSITIVE_INFINITY;
        for (const id of path) f = Math.min(f, cap[id] as number);
        for (const id of path) {
          cap[id] = (cap[id] as number) - f;
          cap[id ^ 1] = (cap[id ^ 1] as number) + f;
        }
        return f;
      }
      const edges = head[u] as number[];
      let advanced = false;
      while ((it[u] as number) < edges.length) {
        const id = edges[it[u] as number] as number;
        const v = to[id] as number;
        if ((cap[id] as number) > 0 && level[v] === (level[u] as number) + 1) {
          path.push(id);
          u = v;
          advanced = true;
          break;
        }
        it[u] = (it[u] as number) + 1;
      }
      if (advanced) continue;
      if (u === source) return 0;
      level[u] = -1; // dead end: prune
      const back = path.pop() as number;
      u = to[back ^ 1] as number;
      it[u] = (it[u] as number) + 1;
    }
  };
  let flow = 0;
  while (bfs()) {
    it.fill(0);
    for (let f = augment(); f > 0; f = augment()) flow += f;
  }
  return flow;
}

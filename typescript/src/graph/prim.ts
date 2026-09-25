// LombokAlgoritma — Prim minimum spanning forest
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { MinHeap, tupleLess } from '../core/heap.js';
import { type Edge, type Graph, validateGraph } from './types.js';

/**
 * Minimum spanning forest of the graph read as undirected (lazy Prim). Trees are grown from the
 * lowest-numbered unvisited node; the frontier is a binary heap keyed by
 * `[weight, to, from, edgeIndex]`. Each chosen edge is returned oriented tree → new node, in the
 * order taken. O(E log E). SPEC §6.10.
 */
export function prim(g: Graph): Edge[] {
  validateGraph(g);
  const n = g.nodes;
  const adj: Array<Array<[number, number, number]>> = Array.from({ length: n }, () => []);
  g.edges.forEach((e, i) => {
    (adj[e.from] as Array<[number, number, number]>).push([e.to, e.weight, i]);
    if (e.from !== e.to) (adj[e.to] as Array<[number, number, number]>).push([e.from, e.weight, i]);
  });
  const inTree = new Uint8Array(n);
  const out: Edge[] = [];
  const heap = new MinHeap<[number, number, number, number]>(tupleLess);
  const visit = (u: number): void => {
    inTree[u] = 1;
    for (const [to, w, i] of adj[u] ?? []) if (inTree[to] === 0) heap.push([w, to, u, i]);
  };
  for (let root = 0; root < n; root++) {
    if (inTree[root] === 1) continue;
    visit(root);
    for (let top = heap.pop(); top !== undefined; top = heap.pop()) {
      const [w, to, from] = top;
      if (inTree[to] === 1) continue;
      out.push({ from, to, weight: w });
      visit(to);
    }
  }
  return out;
}

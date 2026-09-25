// LombokAlgoritma — Kruskal minimum spanning forest
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { DisjointSet } from '../datastructure/disjoint-set.js';
import { type Edge, type Graph, validateGraph } from './types.js';

/**
 * Minimum spanning forest of the graph read as undirected. Edges are considered in a *stable*
 * ascending order of weight (ties keep edge-list order); an edge is taken when it joins two
 * components. Returns the chosen edges in the order taken. O(E log E). SPEC §6.9.
 */
export function kruskal(g: Graph): Edge[] {
  validateGraph(g);
  const order = g.edges.map((e, i) => ({ e, i }));
  order.sort((a, b) => a.e.weight - b.e.weight || a.i - b.i);
  const ds = new DisjointSet(g.nodes);
  const mst: Edge[] = [];
  for (const { e } of order) if (ds.union(e.from, e.to)) mst.push(e);
  return mst;
}

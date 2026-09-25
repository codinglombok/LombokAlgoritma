// LombokAlgoritma — Graph types and adjacency list
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

import { InvalidInputError, OutOfRangeError } from '../core/errors.js';
/** Directed edge `from → to` with a numeric weight. */
export interface Edge {
  from: number;
  to: number;
  weight: number;
}

/**
 * Directed multigraph on nodes `0 … nodes − 1`. Undirected algorithms (Kruskal, Prim, bipartite
 * matching) read each edge as undirected. Edge order is significant: SPEC §6 defines every
 * traversal in terms of the edge list order.
 */
export interface Graph {
  nodes: number;
  edges: Edge[];
}

/** Outgoing neighbours of every node, in edge-list order. */
export type AdjList = Array<Array<{ to: number; weight: number }>>;

/** @throws RangeError for a node count that is not a non-negative integer or an edge out of range */
export function validateGraph(g: Graph): void {
  if (!Number.isInteger(g.nodes) || g.nodes < 0) {
    throw new InvalidInputError('graph: nodes must be a non-negative integer');
  }
  for (const e of g.edges) {
    if (
      !Number.isInteger(e.from) ||
      !Number.isInteger(e.to) ||
      e.from < 0 ||
      e.to < 0 ||
      e.from >= g.nodes ||
      e.to >= g.nodes
    ) {
      throw new OutOfRangeError(`graph: edge ${e.from}→${e.to} outside [0, ${g.nodes})`);
    }
  }
}

/** Build the outgoing adjacency list (edge-list order preserved). */
export function buildAdjList(g: Graph): AdjList {
  validateGraph(g);
  const adj: AdjList = Array.from({ length: g.nodes }, () => []);
  for (const e of g.edges)
    (adj[e.from] as Array<{ to: number; weight: number }>).push({ to: e.to, weight: e.weight });
  return adj;
}

/** Throw unless `v` is a node of `g`. */
export function assertNode(g: Graph, v: number, name = 'node'): void {
  if (!Number.isInteger(v) || v < 0 || v >= g.nodes) {
    throw new OutOfRangeError(`graph: ${name} ${v} outside [0, ${g.nodes})`);
  }
}

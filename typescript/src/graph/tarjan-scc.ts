// LombokAlgoritma — Strongly connected components (Tarjan)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { type Graph, buildAdjList } from './types.js';

/**
 * Strongly connected components by Tarjan's algorithm, implemented iteratively (no recursion
 * limit) but visiting exactly like the recursive version: roots in ascending order, neighbours in
 * edge-list order. Components are returned in the order Tarjan completes them (a reverse
 * topological order of the condensation); the nodes of each component are sorted ascending.
 * O(V + E). SPEC §6.12.
 */
export function tarjanScc(g: Graph): number[][] {
  const adj = buildAdjList(g);
  const n = g.nodes;
  const index = new Array<number>(n).fill(-1);
  const low = new Array<number>(n).fill(0);
  const onStack = new Uint8Array(n);
  const stack: number[] = [];
  const out: number[][] = [];
  let counter = 0;
  for (let root = 0; root < n; root++) {
    if (index[root] !== -1) continue;
    const call: Array<[number, number]> = [[root, 0]]; // [node, next edge position]
    index[root] = low[root] = counter++;
    stack.push(root);
    onStack[root] = 1;
    while (call.length > 0) {
      const frame = call[call.length - 1] as [number, number];
      const [v, pos] = frame;
      const edges = adj[v] ?? [];
      if (pos < edges.length) {
        frame[1] = pos + 1;
        const w = (edges[pos] as { to: number }).to;
        if (index[w] === -1) {
          index[w] = low[w] = counter++;
          stack.push(w);
          onStack[w] = 1;
          call.push([w, 0]);
        } else if (onStack[w] === 1) {
          low[v] = Math.min(low[v] as number, index[w] as number);
        }
        continue;
      }
      call.pop();
      if (call.length > 0) {
        const parent = (call[call.length - 1] as [number, number])[0];
        low[parent] = Math.min(low[parent] as number, low[v] as number);
      }
      if (low[v] === index[v]) {
        const comp: number[] = [];
        for (;;) {
          const w = stack.pop() as number;
          onStack[w] = 0;
          comp.push(w);
          if (w === v) break;
        }
        out.push(comp.sort((a, b) => a - b));
      }
    }
  }
  return out;
}

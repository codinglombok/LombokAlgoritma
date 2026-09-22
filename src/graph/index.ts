// LombokAlgoritma — Graph Module
// Apache-2.0 — @codinglombok
// Full implementations: see src/graph/{algorithm}.ts per architecture_repo.md

export interface Graph {
  nodes: number;
  edges: Array<{ from: number; to: number; weight: number }>;
}

export interface AdjList {
  [node: number]: Array<{ to: number; weight: number }>;
}

export function buildAdjList(g: Graph): AdjList {
  const adj: AdjList = {};
  for (let i = 0; i < g.nodes; i++) adj[i] = [];
  for (const e of g.edges) {
    adj[e.from]!.push({ to: e.to, weight: e.weight });
  }
  return adj;
}

/** Dijkstra shortest path — O((V+E) log V) via min-heap */
export function dijkstra(g: Graph, source: number): number[] {
  const adj = buildAdjList(g);
  const dist = new Array<number>(g.nodes).fill(Infinity);
  dist[source] = 0;
  // Min-heap: [distance, node]
  const heap: [number, number][] = [[0, source]];
  while (heap.length > 0) {
    heap.sort((a, b) => a[0] - b[0]);
    const [d, u] = heap.shift()!;
    if (d > dist[u]!) continue;
    for (const { to, weight } of adj[u]!) {
      const nd = dist[u]! + weight;
      if (nd < dist[to]!) { dist[to] = nd; heap.push([nd, to]); }
    }
  }
  return dist;
}

/** BFS — O(V+E). Returns shortest hop count from source. */
export function bfs(g: Graph, source: number): number[] {
  const adj = buildAdjList(g);
  const dist = new Array<number>(g.nodes).fill(-1);
  dist[source] = 0;
  const queue = [source];
  while (queue.length > 0) {
    const u = queue.shift()!;
    for (const { to } of adj[u]!) {
      if (dist[to] === -1) { dist[to] = dist[u]! + 1; queue.push(to); }
    }
  }
  return dist;
}

/** DFS — O(V+E). Returns discovery order. */
export function dfs(g: Graph, source: number): number[] {
  const adj = buildAdjList(g);
  const visited = new Set<number>();
  const order: number[] = [];
  const stack = [source];
  while (stack.length > 0) {
    const u = stack.pop()!;
    if (visited.has(u)) continue;
    visited.add(u); order.push(u);
    for (const { to } of adj[u]!.slice().reverse()) {
      if (!visited.has(to)) stack.push(to);
    }
  }
  return order;
}

/** Floyd-Warshall all-pairs shortest path — O(V³) */
export function floydWarshall(g: Graph): number[][] {
  const n = g.nodes;
  const dist = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => i === j ? 0 : Infinity)
  );
  for (const e of g.edges) dist[e.from]![e.to] = Math.min(dist[e.from]![e.to]!, e.weight);
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (dist[i]![k]! + dist[k]![j]! < dist[i]![j]!)
          dist[i]![j] = dist[i]![k]! + dist[k]![j]!;
  return dist;
}

/** Topological sort (Kahn's BFS-based) — O(V+E). Returns order or empty if cycle. */
export function topologicalSort(g: Graph): number[] {
  const indegree = new Array<number>(g.nodes).fill(0);
  const adj = buildAdjList(g);
  for (const e of g.edges) indegree[e.to]!++;
  const queue = indegree.reduce<number[]>((q, d, i) => { if (d === 0) q.push(i); return q; }, []);
  const order: number[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!; order.push(u);
    for (const { to } of adj[u]!) {
      indegree[to]!--;
      if (indegree[to] === 0) queue.push(to);
    }
  }
  return order.length === g.nodes ? order : []; // empty = cycle detected
}

/** Kruskal's MST — O(E log E) */
export function kruskal(g: Graph): Array<{ from: number; to: number; weight: number }> {
  const edges = [...g.edges].sort((a, b) => a.weight - b.weight);
  const parent = Array.from({ length: g.nodes }, (_, i) => i);
  const rank = new Array<number>(g.nodes).fill(0);
  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]!);
    return parent[x]!;
  }
  function union(x: number, y: number): boolean {
    const rx = find(x), ry = find(y);
    if (rx === ry) return false;
    if (rank[rx]! < rank[ry]!) parent[rx] = ry;
    else if (rank[rx]! > rank[ry]!) parent[ry] = rx;
    else { parent[ry] = rx; rank[rx]!++; }
    return true;
  }
  const mst: typeof edges = [];
  for (const e of edges) { if (union(e.from, e.to)) mst.push(e); }
  return mst;
}

/** PageRank — power iteration, O(k(V+E)) */
export function pageRank(
  g: Graph,
  { damping = 0.85, iterations = 50 }: { damping?: number; iterations?: number } = {}
): number[] {
  const n = g.nodes, adj = buildAdjList(g);
  const outDegree = new Array<number>(n).fill(0);
  for (const e of g.edges) outDegree[e.from]!++;
  let rank = new Array<number>(n).fill(1 / n);
  for (let iter = 0; iter < iterations; iter++) {
    const newRank = new Array<number>(n).fill((1 - damping) / n);
    for (let u = 0; u < n; u++) {
      if (outDegree[u] === 0) continue;
      const contrib = damping * rank[u]! / outDegree[u]!;
      for (const { to } of adj[u]!) newRank[to]! += contrib;
    }
    rank = newRank;
  }
  return rank;
}

/** A* pathfinding — O(E log V) with admissible heuristic */
export function aStar(
  g: Graph,
  source: number,
  target: number,
  heuristic: (node: number) => number = () => 0
): { path: number[]; cost: number } {
  const adj = buildAdjList(g);
  const gScore = new Array<number>(g.nodes).fill(Infinity);
  gScore[source] = 0;
  const fScore = new Array<number>(g.nodes).fill(Infinity);
  fScore[source] = heuristic(source);
  const came = new Map<number, number>();
  const open: Array<[number, number]> = [[fScore[source]!, source]];
  while (open.length > 0) {
    open.sort((a, b) => a[0] - b[0]);
    const [, u] = open.shift()!;
    if (u === target) {
      const path: number[] = [target];
      let cur = target;
      while (came.has(cur)) { cur = came.get(cur)!; path.unshift(cur); }
      return { path, cost: gScore[target]! };
    }
    for (const { to, weight } of adj[u]!) {
      const ng = gScore[u]! + weight;
      if (ng < gScore[to]!) {
        came.set(to, u);
        gScore[to] = ng;
        fScore[to] = ng + heuristic(to);
        open.push([fScore[to]!, to]);
      }
    }
  }
  return { path: [], cost: Infinity };
}

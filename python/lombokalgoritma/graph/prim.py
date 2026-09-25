# LombokAlgoritma — Prim minimum spanning forest, lazy (SPEC §9.9)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

import heapq

from .types import Edge, Graph, validate_graph


def prim(g: Graph) -> list[Edge]:
    """Minimum spanning forest (edges read undirected) grown from the lowest unvisited node.

    Heap keyed ``(weight, to, from, edge_index)``; edges are returned tree → new node.
    """
    validate_graph(g)
    n = int(g.nodes)
    adj: list[list[tuple[int, float, int]]] = [[] for _ in range(n)]
    for i, (u, v, w) in enumerate(g.edges):
        adj[u].append((v, w, i))
        if u != v:
            adj[v].append((u, w, i))
    in_tree = [False] * n
    out: list[Edge] = []
    heap: list[tuple[float, int, int, int]] = []

    def visit(u: int) -> None:
        in_tree[u] = True
        for v, w, i in adj[u]:
            if not in_tree[v]:
                heapq.heappush(heap, (w, v, u, i))

    for root in range(n):
        if in_tree[root]:
            continue
        visit(root)
        while heap:
            w, v, u, _ = heapq.heappop(heap)
            if in_tree[v]:
                continue
            out.append(Edge(u, v, w))
            visit(v)
    return out

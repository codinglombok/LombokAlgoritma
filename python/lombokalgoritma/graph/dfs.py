# LombokAlgoritma — depth-first search (SPEC §9.2)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from .types import Graph, assert_node, build_adj_list


def dfs(g: Graph, source: int) -> list[int]:
    """Iterative pre-order from ``source``; unvisited neighbours pushed in reverse edge order."""
    adj = build_adj_list(g)
    assert_node(g, source, "source")
    visited = [False] * len(adj)
    order: list[int] = []
    stack = [source]
    while stack:
        u = stack.pop()
        if visited[u]:
            continue
        visited[u] = True
        order.append(u)
        for v, _ in reversed(adj[u]):
            if not visited[v]:
                stack.append(v)
    return order

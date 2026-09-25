# LombokAlgoritma — breadth-first search (SPEC §9.1)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from .types import Graph, assert_node, build_adj_list


def bfs(g: Graph, source: int) -> list[int]:
    """Hop distance from ``source`` to every node (−1 when unreachable). O(V + E)."""
    adj = build_adj_list(g)
    assert_node(g, source, "source")
    dist = [-1] * len(adj)
    dist[source] = 0
    queue = [source]
    head = 0
    while head < len(queue):
        u = queue[head]
        head += 1
        for v, _ in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                queue.append(v)
    return dist

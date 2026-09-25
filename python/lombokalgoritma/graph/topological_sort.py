# LombokAlgoritma — topological sort, Kahn (SPEC §9.7)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from .types import Graph, build_adj_list


def topological_sort(g: Graph) -> list[int]:
    """Kahn with a FIFO queue seeded by zero in-degree nodes ascending; ``[]`` on a cycle."""
    adj = build_adj_list(g)
    n = len(adj)
    indegree = [0] * n
    for _, v, _ in g.edges:
        indegree[v] += 1
    queue = [i for i in range(n) if indegree[i] == 0]
    head = 0
    while head < len(queue):
        u = queue[head]
        head += 1
        for v, _ in adj[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                queue.append(v)
    return queue if len(queue) == n else []

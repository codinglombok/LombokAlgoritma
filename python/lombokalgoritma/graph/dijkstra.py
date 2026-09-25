# LombokAlgoritma — Dijkstra single-source shortest paths (SPEC §9.3)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

import heapq
import math

from ..errors import NegativeWeightError
from .types import Graph, assert_node, build_adj_list


def dijkstra(g: Graph, source: int) -> list[float]:
    """Shortest distances from ``source`` (``inf`` when unreachable); heap keyed ``(d, node)``.

    Raises:
        NegativeWeightError: any edge weight is negative.
    """
    adj = build_adj_list(g)
    assert_node(g, source, "source")
    if any(w < 0 for _, _, w in g.edges):
        raise NegativeWeightError("dijkstra")
    dist: list[float] = [math.inf] * len(adj)
    dist[source] = 0
    heap: list[tuple[float, int]] = [(0, source)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(heap, (nd, v))
    return dist

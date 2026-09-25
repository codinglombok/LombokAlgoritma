# LombokAlgoritma — Bellman–Ford (SPEC §9.5)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

import math
from typing import NamedTuple

from .types import Graph, assert_node, validate_graph


class BellmanFordResult(NamedTuple):
    """Distances (``inf`` when unreachable) and whether a reachable negative cycle exists."""

    distances: list[float]
    has_negative_cycle: bool


def bellman_ford(g: Graph, source: int) -> BellmanFordResult:
    """Up to V − 1 rounds relaxing edges in list order (early exit), then one detection round."""
    validate_graph(g)
    assert_node(g, source, "source")
    dist: list[float] = [math.inf] * int(g.nodes)
    dist[source] = 0
    for _ in range(1, int(g.nodes)):
        changed = False
        for u, v, w in g.edges:
            du = dist[u]
            if du != math.inf and du + w < dist[v]:
                dist[v] = du + w
                changed = True
        if not changed:
            break
    neg = any(dist[u] != math.inf and dist[u] + w < dist[v] for u, v, w in g.edges)
    return BellmanFordResult(dist, neg)

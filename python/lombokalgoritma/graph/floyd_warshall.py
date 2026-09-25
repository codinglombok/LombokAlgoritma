# LombokAlgoritma — Floyd–Warshall all-pairs shortest paths (SPEC §9.6)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

import math

from .types import Graph, validate_graph


def floyd_warshall(g: Graph) -> list[list[float]]:
    """All-pairs distances (``inf`` when unreachable); parallel edges keep the minimum."""
    validate_graph(g)
    n = int(g.nodes)
    dist: list[list[float]] = [[0 if i == j else math.inf for j in range(n)] for i in range(n)]
    for u, v, w in g.edges:
        dist[u][v] = min(dist[u][v], w)
    for k in range(n):
        dk = dist[k]
        for i in range(n):
            di = dist[i]
            dik = di[k]
            if dik == math.inf:
                continue
            for j in range(n):
                cand = dik + dk[j]
                if cand < di[j]:
                    di[j] = cand
    return dist

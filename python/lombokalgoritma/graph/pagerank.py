# LombokAlgoritma — PageRank, power iteration (SPEC §9.13)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from ..errors import OutOfRangeError
from .types import Graph, validate_graph


def pagerank(g: Graph, damping: float = 0.85, iterations: int = 50) -> list[float]:
    """PageRank with dangling mass redistributed uniformly; evaluation order per SPEC §9.13.

    Raises:
        OutOfRangeError: ``damping`` outside [0, 1].
    """
    validate_graph(g)
    n = int(g.nodes)
    if n == 0:
        return []
    if not 0 <= damping <= 1:
        raise OutOfRangeError("pagerank: damping must be in [0, 1]")
    out_degree = [0] * n
    outs: list[list[int]] = [[] for _ in range(n)]
    for u, v, _ in g.edges:
        out_degree[u] += 1
        outs[u].append(v)
    rank = [1 / n] * n
    for _ in range(iterations):
        dangling = 0.0
        for u in range(n):
            if out_degree[u] == 0:
                dangling += rank[u]
        base = (1 - damping) / n + (damping * dangling) / n
        nxt = [base] * n
        for u in range(n):
            deg = out_degree[u]
            if deg == 0:
                continue
            contrib = (damping * rank[u]) / deg
            for v in outs[u]:
                nxt[v] = nxt[v] + contrib
        rank = nxt
    return rank

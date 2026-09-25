# LombokAlgoritma — maximum flow, Dinic (SPEC §9.11)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

import math

from ..errors import InvalidInputError, NegativeWeightError
from .types import Graph, assert_node, validate_graph


def dinic(g: Graph, source: int, sink: int) -> float:
    """Maximum ``source → sink`` flow value; weights are capacities (parallel edges add up).

    Raises:
        InvalidInputError: ``source == sink``.
        NegativeWeightError: a negative capacity.
    """
    validate_graph(g)
    assert_node(g, source, "source")
    assert_node(g, sink, "sink")
    if source == sink:
        raise InvalidInputError("dinic: source and sink must differ")
    n = int(g.nodes)
    to: list[int] = []
    cap: list[float] = []
    head: list[list[int]] = [[] for _ in range(n)]
    for u, v, w in g.edges:
        if w < 0:
            raise NegativeWeightError("dinic")
        head[u].append(len(to))
        to.append(v)
        cap.append(w)
        head[v].append(len(to))
        to.append(u)
        cap.append(0)
    level = [-1] * n
    it = [0] * n

    def bfs() -> bool:
        for i in range(n):
            level[i] = -1
        level[source] = 0
        q = [source]
        h = 0
        while h < len(q):
            u = q[h]
            h += 1
            for eid in head[u]:
                v = to[eid]
                if cap[eid] > 0 and level[v] == -1:
                    level[v] = level[u] + 1
                    q.append(v)
        return level[sink] != -1

    def augment() -> float:
        path: list[int] = []
        u = source
        while True:
            if u == sink:
                f = math.inf
                for eid in path:
                    f = min(f, cap[eid])
                for eid in path:
                    cap[eid] -= f
                    cap[eid ^ 1] += f
                return f
            edges = head[u]
            advanced = False
            while it[u] < len(edges):
                eid = edges[it[u]]
                v = to[eid]
                if cap[eid] > 0 and level[v] == level[u] + 1:
                    path.append(eid)
                    u = v
                    advanced = True
                    break
                it[u] += 1
            if advanced:
                continue
            if u == source:
                return 0
            level[u] = -1
            back = path.pop()
            u = to[back ^ 1]
            it[u] += 1

    flow: float = 0
    while bfs():
        for i in range(n):
            it[i] = 0
        f = augment()
        while f > 0:
            flow += f
            f = augment()
    return flow

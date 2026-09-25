# LombokAlgoritma — A* search (SPEC §9.4)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

import heapq
import math
from collections.abc import Callable
from typing import NamedTuple

from ..errors import NegativeWeightError
from .types import Graph, assert_node, build_adj_list


class AStarResult(NamedTuple):
    """Path ``source … target`` and its cost (``[]``, ``inf`` when unreachable)."""

    path: list[int]
    cost: float


def _zero(_: int) -> float:
    return 0


def a_star(
    g: Graph,
    source: int,
    target: int,
    heuristic: Callable[[int], float] | None = None,
) -> AStarResult:
    """A* with an admissible ``heuristic`` (default 0); heap keyed ``(g + h, node)``.

    Raises:
        NegativeWeightError: any edge weight is negative.
    """
    h = heuristic if heuristic is not None else _zero
    adj = build_adj_list(g)
    assert_node(g, source, "source")
    assert_node(g, target, "target")
    if any(w < 0 for _, _, w in g.edges):
        raise NegativeWeightError("a_star")
    g_score: list[float] = [math.inf] * len(adj)
    prev = [-1] * len(adj)
    g_score[source] = 0
    heap: list[tuple[float, int]] = [(h(source), source)]
    while heap:
        f, u = heapq.heappop(heap)
        gu = g_score[u]
        if f > gu + h(u):
            continue
        if u == target:
            path = [target]
            cur = prev[target]
            while cur != -1:
                path.append(cur)
                cur = prev[cur]
            path.reverse()
            return AStarResult(path, gu)
        for v, w in adj[u]:
            ng = gu + w
            if ng < g_score[v]:
                g_score[v] = ng
                prev[v] = u
                heapq.heappush(heap, (ng + h(v), v))
    return AStarResult([], math.inf)

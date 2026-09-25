# LombokAlgoritma — maximum bipartite matching, Hopcroft–Karp (SPEC §9.12)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

import math
from collections.abc import Sequence
from typing import NamedTuple

from ..errors import OutOfRangeError


class MatchingResult(NamedTuple):
    """Matching size (normative) and the partner of every vertex (−1 when unmatched)."""

    size: int
    match_left: list[int]
    match_right: list[int]


def _is_int(x: object) -> bool:
    return isinstance(x, int) and not isinstance(x, bool)


def bipartite_matching(
    n_left: int, n_right: int, pairs: Sequence[tuple[int, int] | Sequence[int]]
) -> MatchingResult:
    """Maximum matching of left ``0 … n_left − 1`` / right ``0 … n_right − 1``. O(E·√V).

    Raises:
        OutOfRangeError: a pair outside the vertex ranges.
    """
    adj: list[list[int]] = [[] for _ in range(n_left)]
    for pr in pairs:
        u, v = pr[0], pr[1]
        if not (_is_int(u) and _is_int(v) and 0 <= u < n_left and 0 <= v < n_right):
            raise OutOfRangeError(f"bipartite_matching: edge [{u}, {v}] out of range")
        adj[u].append(v)
    match_left = [-1] * n_left
    match_right = [-1] * n_right
    inf = math.inf
    dist: list[float] = [0] * n_left

    def bfs() -> bool:
        q: list[int] = []
        for u in range(n_left):
            if match_left[u] == -1:
                dist[u] = 0
                q.append(u)
            else:
                dist[u] = inf
        found = False
        h = 0
        while h < len(q):
            u = q[h]
            h += 1
            for v in adj[u]:
                w = match_right[v]
                if w == -1:
                    found = True
                elif dist[w] == inf:
                    dist[w] = dist[u] + 1
                    q.append(w)
        return found

    it = [0] * n_left

    def try_augment(root: int) -> bool:
        stack = [root]
        via: list[int] = []
        while stack:
            u = stack[-1]
            nb = adj[u]
            pushed = False
            while it[u] < len(nb):
                v = nb[it[u]]
                it[u] += 1
                w = match_right[v]
                if w == -1:
                    via.append(v)
                    for lu, rv in zip(stack, via, strict=True):
                        match_left[lu] = rv
                        match_right[rv] = lu
                    return True
                if dist[w] == dist[u] + 1:
                    via.append(v)
                    stack.append(w)
                    pushed = True
                    break
            if pushed:
                continue
            dist[u] = inf
            stack.pop()
            if via:
                via.pop()
        return False

    size = 0
    while bfs():
        for i in range(n_left):
            it[i] = 0
        for u in range(n_left):
            if match_left[u] == -1 and try_augment(u):
                size += 1
    return MatchingResult(size, match_left, match_right)

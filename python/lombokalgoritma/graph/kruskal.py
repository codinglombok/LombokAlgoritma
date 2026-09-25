# LombokAlgoritma — Kruskal minimum spanning forest (SPEC §9.8)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from ..datastructure import DisjointSet
from .types import Edge, Graph, validate_graph


def kruskal(g: Graph) -> list[Edge]:
    """Minimum spanning forest (edges read undirected), stable by weight, in the order taken."""
    validate_graph(g)
    ds = DisjointSet(int(g.nodes))
    out: list[Edge] = []
    for u, v, w in sorted(g.edges, key=lambda e: e[2]):
        if ds.union(u, v):
            out.append(Edge(u, v, w))
    return out

# LombokAlgoritma — graph types, validation and adjacency (SPEC §9.0)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
"""Directed multigraph on nodes ``0 … nodes − 1``; edge-list order is significant."""

from __future__ import annotations

from collections.abc import Sequence
from typing import NamedTuple

from ..errors import InvalidInputError, OutOfRangeError


class Edge(NamedTuple):
    """Directed edge ``from_ → to`` with a numeric weight (a plain 3-tuple works too)."""

    from_: int
    to: int
    weight: float


EdgeLike = tuple[int, int, float]


class Graph(NamedTuple):
    """``nodes`` count plus an ordered edge list of ``(from, to, weight)`` triples."""

    nodes: int
    edges: Sequence[EdgeLike]


AdjList = list[list[tuple[int, float]]]


def _is_int(x: object) -> bool:
    if isinstance(x, bool):
        return False
    return isinstance(x, int) or (isinstance(x, float) and x.is_integer())


def validate_graph(g: Graph) -> None:
    """Raise unless ``g`` is well formed.

    Raises:
        InvalidInputError: ``nodes`` is not a non-negative integer.
        OutOfRangeError: an edge endpoint is outside ``[0, nodes)``.
    """
    if not _is_int(g.nodes) or g.nodes < 0:
        raise InvalidInputError("graph: nodes must be a non-negative integer")
    for u, v, _ in g.edges:
        if not (_is_int(u) and _is_int(v) and 0 <= u < g.nodes and 0 <= v < g.nodes):
            raise OutOfRangeError(f"graph: edge {u}->{v} outside [0, {g.nodes})")


def build_adj_list(g: Graph) -> AdjList:
    """Validate ``g`` and return outgoing neighbours per node, in edge-list order."""
    validate_graph(g)
    adj: AdjList = [[] for _ in range(int(g.nodes))]
    for u, v, w in g.edges:
        adj[u].append((v, w))
    return adj


def assert_node(g: Graph, v: int, name: str = "node") -> None:
    """Raise :class:`OutOfRangeError` unless ``v`` is a node of ``g``."""
    if not _is_int(v) or v < 0 or v >= g.nodes:
        raise OutOfRangeError(f"graph: {name} {v} outside [0, {g.nodes})")

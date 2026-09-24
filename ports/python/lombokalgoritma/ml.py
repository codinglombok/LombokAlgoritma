# LombokAlgoritma — Python ML Module
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

import math
import random
from collections.abc import Iterable, Sequence
from typing import TypedDict


def _seq_sum(values: Iterable[float]) -> float:
    """Left-to-right IEEE-754 summation.

    Deliberately not ``math.fsum`` / ``sum``: CPython ≥ 3.12 ``sum`` uses compensated
    summation, which would make results differ from the other ports (SPEC: sequential sum).
    """
    total = 0.0
    for v in values:
        total += v
    return total


def dot_product(a: Sequence[float], b: Sequence[float]) -> float:
    """Dot product; vectors must have equal length."""
    return _seq_sum(x * y for x, y in zip(a, b, strict=True))


def l2_norm(v: Sequence[float]) -> float:
    """Euclidean norm."""
    return math.sqrt(_seq_sum(x * x for x in v))


def cosine_similarity(a: Sequence[float], b: Sequence[float]) -> float:
    """Cosine similarity in [-1, 1]; 0 when either vector is zero."""
    na, nb = l2_norm(a), l2_norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return dot_product(a, b) / (na * nb)


def l2_distance(a: Sequence[float], b: Sequence[float]) -> float:
    """Euclidean distance."""
    return math.sqrt(_seq_sum((x - y) * (x - y) for x, y in zip(a, b, strict=True)))


def l1_distance(a: Sequence[float], b: Sequence[float]) -> float:
    """Manhattan distance."""
    return _seq_sum(abs(x - y) for x, y in zip(a, b, strict=True))


def normalize(v: Sequence[float]) -> list[float]:
    """Unit vector in the direction of ``v`` (zero vector stays zero)."""
    n = l2_norm(v)
    return [x / n for x in v] if n > 0 else [0.0] * len(v)


def pearson(a: Sequence[float], b: Sequence[float]) -> float:
    """Pearson correlation coefficient; 0 when either input is constant."""
    if len(a) != len(b):
        raise ValueError("pearson: inputs must have equal length")
    n = len(a)
    ma, mb = _seq_sum(a) / n, _seq_sum(b) / n
    num = _seq_sum((x - ma) * (y - mb) for x, y in zip(a, b, strict=True))
    da = _seq_sum((x - ma) * (x - ma) for x in a)
    db = _seq_sum((y - mb) * (y - mb) for y in b)
    return 0.0 if da == 0 or db == 0 else num / math.sqrt(da * db)


def _nearest(p: Sequence[float], centroids: Sequence[Sequence[float]]) -> int:
    """Index of the nearest centroid; ties → lowest index."""
    best, best_d = 0, math.inf
    for c, centroid in enumerate(centroids):
        dist = l2_distance(p, centroid)
        if dist < best_d:
            best, best_d = c, dist
    return best


class KMeansResult(TypedDict):
    """Result of :func:`kmeans`."""

    centroids: list[list[float]]
    labels: list[int]
    inertia: float
    iterations: int


def kmeans(
    points: Sequence[Sequence[float]],
    k: int,
    max_iter: int = 300,
    tol: float = 1e-4,
    seed: int = 42,
) -> KMeansResult:
    """Lloyd's k-means with k-means++ initialisation (``random.Random(seed)``, non-crypto)."""
    if not points:
        raise ValueError("kmeans: empty input")
    if not 1 <= k <= len(points):
        raise ValueError("kmeans: k must be in [1, len(points)]")
    rng = random.Random(seed)  # noqa: S311 — deterministic clustering, not security
    n, d = len(points), len(points[0])
    centroids = [list(points[rng.randrange(n)])]
    while len(centroids) < k:
        dists = [min(l2_distance(p, c) ** 2 for c in centroids) for p in points]
        r = rng.random() * _seq_sum(dists)
        for i, di in enumerate(dists):
            r -= di
            if r <= 0:
                centroids.append(list(points[i]))
                break
        else:
            centroids.append(list(points[-1]))
    labels = [0] * n
    it = 0
    for it in range(1, max_iter + 1):  # noqa: B007 — `it` is reported
        labels = [_nearest(p, centroids) for p in points]
        sums = [[0.0] * d for _ in range(k)]
        counts = [0] * k
        for i, lab in enumerate(labels):
            for j in range(d):
                sums[lab][j] += points[i][j]
            counts[lab] += 1
        max_shift = 0.0
        new_centroids: list[list[float]] = []
        for c in range(k):
            if counts[c]:
                nc = [v / counts[c] for v in sums[c]]
                max_shift = max(max_shift, l2_distance(centroids[c], nc))
                new_centroids.append(nc)
            else:
                new_centroids.append(centroids[c][:])
        centroids = new_centroids
        if max_shift < tol:
            break
    inertia = _seq_sum(l2_distance(points[i], centroids[labels[i]]) ** 2 for i in range(n))
    return {"centroids": centroids, "labels": labels, "inertia": inertia, "iterations": it}

# LombokAlgoritma — Python ML Module (SPEC §13.1)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
"""Vector similarity / distance and k-means. Every Σ runs left to right from 0 (SPEC §0.2)."""

from __future__ import annotations

import math
from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from typing import TypedDict

from .errors import EmptyInputError, InvalidInputError, OutOfRangeError
from .rng import Xoshiro256pp

__all__ = [
    "BatchScore",
    "KMeansResult",
    "batch_cosine",
    "cosine_similarity",
    "dot_product",
    "jaccard_similarity",
    "kmeans",
    "l1_distance",
    "l2_distance",
    "l2_norm",
    "normalize",
    "pearson",
]


def _seq_sum(values: Iterable[float]) -> float:
    """Left-to-right IEEE-754 summation starting from 0.

    Deliberately not ``math.fsum`` / ``sum``: CPython ≥ 3.12 ``sum`` of floats uses compensated
    summation, which would make results differ from the other ports.
    """
    total = 0.0
    for v in values:
        total += v
    return total


def _same_len(a: Sequence[float], b: Sequence[float]) -> None:
    if len(a) != len(b):
        raise InvalidInputError("vectors must have equal length")


def dot_product(a: Sequence[float], b: Sequence[float]) -> float:
    """``Σ a_i·b_i``.

    Raises:
        InvalidInputError: the lengths differ.
    """
    _same_len(a, b)
    return _seq_sum(x * y for x, y in zip(a, b, strict=True))


def l2_norm(v: Sequence[float]) -> float:
    """Euclidean norm ``√(Σ v_i·v_i)``."""
    return math.sqrt(_seq_sum(x * x for x in v))


def cosine_similarity(a: Sequence[float], b: Sequence[float]) -> float:
    """``dot / (‖a‖·‖b‖)``; 0 when either norm is 0.

    Raises:
        InvalidInputError: the lengths differ.
    """
    _same_len(a, b)
    na, nb = l2_norm(a), l2_norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return dot_product(a, b) / (na * nb)


def l2_distance(a: Sequence[float], b: Sequence[float]) -> float:
    """Euclidean distance ``√(Σ (a_i − b_i)²)``.

    Raises:
        InvalidInputError: the lengths differ.
    """
    _same_len(a, b)
    return math.sqrt(_seq_sum((x - y) * (x - y) for x, y in zip(a, b, strict=True)))


def l1_distance(a: Sequence[float], b: Sequence[float]) -> float:
    """Manhattan distance ``Σ |a_i − b_i|``.

    Raises:
        InvalidInputError: the lengths differ.
    """
    _same_len(a, b)
    return _seq_sum(abs(x - y) for x, y in zip(a, b, strict=True))


def normalize(v: Sequence[float]) -> list[float]:
    """``v / ‖v‖`` (a zero vector stays zero)."""
    n = l2_norm(v)
    if n == 0:
        return [0.0] * len(v)
    return [x / n for x in v]


def jaccard_similarity(a: Iterable[str], b: Iterable[str]) -> float:
    """``|A ∩ B| / |A ∪ B|`` over sets (duplicates ignored); two empty sets → 1."""
    sa, sb = set(a), set(b)
    inter = len(sa & sb)
    union = len(sa) + len(sb) - inter
    return 1.0 if union == 0 else inter / union


@dataclass(frozen=True)
class BatchScore:
    """One :func:`batch_cosine` result."""

    index: int
    score: float


def batch_cosine(query: Sequence[float], candidates: Sequence[Sequence[float]]) -> list[BatchScore]:
    """Cosine of ``query`` against every candidate, score descending, ties by index ascending."""
    scores = [BatchScore(i, cosine_similarity(query, c)) for i, c in enumerate(candidates)]
    return sorted(scores, key=lambda r: (-r.score, r.index))


def pearson(a: Sequence[float], b: Sequence[float]) -> float:
    """Pearson correlation; 0 when either input is constant (or empty).

    Raises:
        InvalidInputError: the lengths differ.
    """
    _same_len(a, b)
    n = len(a)
    if n == 0:
        return 0.0
    ma = _seq_sum(a) / n
    mb = _seq_sum(b) / n
    num = sa = sb = 0.0
    for x, y in zip(a, b, strict=True):
        da = x - ma
        db = y - mb
        num += da * db
        sa += da * da
        sb += db * db
    if sa == 0 or sb == 0:
        return 0.0
    return num / math.sqrt(sa * sb)


def _sq(a: Sequence[float], b: Sequence[float]) -> float:
    s = 0.0
    for x, y in zip(a, b, strict=False):
        d = x - y
        s += d * d
    return s


class KMeansResult(TypedDict):
    """Result of :func:`kmeans`."""

    centroids: list[list[float]]
    labels: list[int]
    iterations: int
    inertia: float


def _kmeanspp(points: Sequence[Sequence[float]], k: int, rng: Xoshiro256pp) -> list[list[float]]:
    n = len(points)
    centroids = [list(points[rng.next_int(n)])]
    dists = [_sq(p, centroids[0]) for p in points]
    while len(centroids) < k:
        total = _seq_sum(dists)
        r = rng.next_float() * total
        pick = n - 1
        for i, di in enumerate(dists):
            r -= di
            if r <= 0:
                pick = i
                break
        c = list(points[pick])
        centroids.append(c)
        for i, p in enumerate(points):
            d = _sq(p, c)
            if d < dists[i]:
                dists[i] = d
    return centroids


def kmeans(
    points: Sequence[Sequence[float]],
    k: int,
    *,
    max_iter: int = 300,
    tol: float = 1e-4,
    seed: int = 0x123456789ABCDEF0,
) -> KMeansResult:
    """Lloyd's k-means with normative k-means++ seeding from ``Xoshiro256pp(seed)`` (SPEC §13.1).

    Raises:
        EmptyInputError: no points.
        OutOfRangeError: ``k`` not in ``[1, n]``.
        InvalidInputError: points of unequal dimension.
    """
    n = len(points)
    if n == 0:
        raise EmptyInputError("kmeans")
    if isinstance(k, bool) or not isinstance(k, int) or not 1 <= k <= n:
        raise OutOfRangeError("kmeans: need 1 <= k <= n")
    d = len(points[0])
    if any(len(p) != d for p in points):
        raise InvalidInputError("kmeans: points of unequal dimension")
    centroids = _kmeanspp(points, k, Xoshiro256pp(seed))
    labels = [0] * n
    it = 0
    while it < max_iter:
        it += 1
        labels = []
        for p in points:
            best, best_d = 0, math.inf
            for c in range(k):
                dist = _sq(p, centroids[c])
                if dist < best_d:
                    best, best_d = c, dist
            labels.append(best)
        sums = [[0.0] * d for _ in range(k)]
        counts = [0] * k
        for i, lab in enumerate(labels):
            row = sums[lab]
            p = points[i]
            for j in range(d):
                row[j] = row[j] + p[j]
            counts[lab] += 1
        max_shift = 0.0
        nxt: list[list[float]] = []
        for c in range(k):
            if counts[c] == 0:
                nxt.append(centroids[c][:])
                continue
            nc = [v / counts[c] for v in sums[c]]
            shift = math.sqrt(_sq(centroids[c], nc))
            if shift > max_shift:
                max_shift = shift
            nxt.append(nc)
        centroids = nxt
        if max_shift < tol:
            break
    inertia = _seq_sum(_sq(points[i], centroids[labels[i]]) for i in range(n))
    return {"centroids": centroids, "labels": labels, "iterations": it, "inertia": inertia}

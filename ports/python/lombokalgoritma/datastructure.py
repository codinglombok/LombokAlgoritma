# LombokAlgoritma — Python Data Structures
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

import math

from .string import fnv1a32


class BloomFilter:
    """Bloom filter sized for ``n`` items at false-positive rate ``fpr``."""

    def __init__(self, n: int, fpr: float = 0.01) -> None:
        if n < 1 or not 0 < fpr < 1:
            raise ValueError("BloomFilter: n >= 1 and 0 < fpr < 1 required")
        self._m = math.ceil(-n * math.log(fpr) / (math.log(2) ** 2))
        self._k = max(1, round((self._m / n) * math.log(2)))
        self._bits = bytearray(math.ceil(self._m / 8))

    def _hashes(self, item: str) -> list[int]:
        h1 = fnv1a32(item)
        h2 = fnv1a32(item + "\x00seed2")
        return [(h1 + i * h2) % self._m for i in range(self._k)]

    def add(self, item: str) -> None:
        """Insert ``item``."""
        for pos in self._hashes(item):
            self._bits[pos >> 3] |= 1 << (pos & 7)

    def has(self, item: str) -> bool:
        """``False`` means definitely absent; ``True`` means probably present."""
        return all((self._bits[p >> 3] >> (p & 7)) & 1 for p in self._hashes(item))


class DisjointSet:
    """Union-find with path compression and union by rank."""

    def __init__(self, n: int) -> None:
        self._parent = list(range(n))
        self._rank = [0] * n
        self._count = n

    def find(self, x: int) -> int:
        """Representative of ``x`` (iterative path compression)."""
        root = x
        while self._parent[root] != root:
            root = self._parent[root]
        while self._parent[x] != root:
            self._parent[x], x = root, self._parent[x]
        return root

    def union(self, x: int, y: int) -> bool:
        """Merge the sets of ``x`` and ``y``; ``False`` if already joined."""
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False
        if self._rank[rx] < self._rank[ry]:
            rx, ry = ry, rx
        self._parent[ry] = rx
        if self._rank[rx] == self._rank[ry]:
            self._rank[rx] += 1
        self._count -= 1
        return True

    def connected(self, x: int, y: int) -> bool:
        """Whether ``x`` and ``y`` are in the same set."""
        return self.find(x) == self.find(y)

    @property
    def count(self) -> int:
        """Number of disjoint sets."""
        return self._count

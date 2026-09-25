# LombokAlgoritma — Python Data Structures (SPEC §8)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
"""Bloom filter, HyperLogLog, disjoint set, Fenwick tree and lazy segment tree."""

from __future__ import annotations

import math
from collections.abc import Sequence

from .errors import InvalidInputError, OutOfRangeError
from .hash import fmix32, fnv1a32, murmur3_32

__all__ = ["BloomFilter", "DisjointSet", "FenwickTree", "HyperLogLog", "SegmentTree"]

_BLOOM_SEED = 0x9747B28C


def _is_int(x: object) -> bool:
    return isinstance(x, int) and not isinstance(x, bool)


class BloomFilter:
    """Bloom filter with ``m`` bits and ``k`` hash functions (Kirsch–Mitzenmacher, SPEC §8.1).

    ``h1 = FNV-1a-32(item)``, ``h2 = MurmurHash3_x86_32(item, 0x9747b28c)`` (UTF-8 bytes),
    ``pos_i = (h1 + i·h2) mod m``; bit ``p`` is bit ``p mod 8`` (LSB first) of byte ``⌊p/8⌋``.

    The ``(n, fpr)`` constructor sizes the filter with ``ln`` and is therefore *not* portable
    across ports — use :meth:`with_params` for filters that must match bit for bit.
    """

    def __init__(self, n: int, fpr: float = 0.01) -> None:
        if not n >= 1 or not 0 < fpr < 1:
            raise OutOfRangeError("BloomFilter: need n >= 1 and 0 < fpr < 1")
        m = math.ceil(-n * math.log(fpr) / (math.log(2) * math.log(2)))
        k = max(1, math.floor((m / n) * math.log(2) + 0.5))
        self._init(m, k)

    def _init(self, m: int, k: int) -> None:
        self._m = m
        self._k = k
        self._bits = bytearray((m + 7) // 8)

    @classmethod
    def with_params(cls, m: int, k: int) -> BloomFilter:
        """Filter with exactly ``m`` bits (``1 <= m < 2^32``) and ``k`` hashes (``1 <= k <= 64``).

        Raises:
            OutOfRangeError: ``m`` or ``k`` outside the permitted range.
        """
        if not (_is_int(m) and _is_int(k) and 1 <= m < 2**32 and 1 <= k <= 64):
            raise OutOfRangeError("BloomFilter.with_params: need 1 <= m < 2^32 and 1 <= k <= 64")
        f = cls.__new__(cls)
        f._init(m, k)
        return f

    def _positions(self, item: str | bytes) -> list[int]:
        h1 = fnv1a32(item)
        h2 = murmur3_32(item, _BLOOM_SEED)
        return [(h1 + i * h2) % self._m for i in range(self._k)]

    def add(self, item: str | bytes) -> None:
        """Insert ``item``."""
        for p in self._positions(item):
            self._bits[p >> 3] |= 1 << (p & 7)

    def has(self, item: str | bytes) -> bool:
        """``False`` means definitely absent; ``True`` means probably present."""
        return all((self._bits[p >> 3] >> (p & 7)) & 1 for p in self._positions(item))

    __contains__ = has

    @property
    def set_bits(self) -> int:
        """Number of set bits."""
        return sum(bin(b).count("1") for b in self._bits)

    @property
    def estimated_fpr(self) -> float:
        """Estimated false-positive rate ``(set_bits / m)^k``."""
        return float((self.set_bits / self._m) ** self._k)

    @property
    def size(self) -> int:
        """Number of bits ``m``."""
        return self._m

    @property
    def hash_count(self) -> int:
        """Number of hash functions ``k``."""
        return self._k

    def to_bytes(self) -> bytes:
        """Copy of the bit array (SPEC §8.1 layout, ``⌈m/8⌉`` bytes)."""
        return bytes(self._bits)


def _js_round(x: float) -> int:
    """ECMAScript ``Math.round`` (half rounds towards +∞)."""
    f = math.floor(x)
    return int(f) + (1 if x - f >= 0.5 else 0)


class HyperLogLog:
    """HyperLogLog cardinality estimator with ``2^b`` u8 registers (SPEC §8.2)."""

    def __init__(self, b: int = 14) -> None:
        self._b = min(16, max(4, b))
        self._m = 1 << self._b
        self._reg = bytearray(self._m)

    @property
    def precision(self) -> int:
        """Register bits ``b`` (after clamping to [4, 16])."""
        return self._b

    def add(self, item: str | bytes) -> None:
        """Observe ``item`` (hashed as ``fmix32(FNV-1a-32(UTF-8(item)))``)."""
        b = self._b
        h = fmix32(fnv1a32(item))
        j = h >> (32 - b)
        w = (h << b) & 0xFFFFFFFF
        rho = 32 - b + 1 if w == 0 else (32 - w.bit_length()) + 1
        if rho > self._reg[j]:
            self._reg[j] = rho

    def count(self) -> int:
        """Estimated number of distinct items."""
        m = self._m
        if m == 16:
            alpha = 0.673
        elif m == 32:
            alpha = 0.697
        elif m == 64:
            alpha = 0.709
        else:
            alpha = 0.7213 / (1 + 1.079 / m)
        z = 0.0
        zeros = 0
        for r in self._reg:
            z += 2.0**-r
            if r == 0:
                zeros += 1
        est = ((alpha * m) * m) / z
        if est <= 2.5 * m:
            if zeros > 0:
                est = m * math.log(m / zeros)
        elif est > 2.0**32 / 30:
            est = -(2.0**32) * math.log(1 - est / 2.0**32)
        return _js_round(est)

    def registers(self) -> bytes:
        """Copy of the ``2^b`` registers, one byte each, in index order."""
        return bytes(self._reg)

    def merge(self, other: HyperLogLog) -> HyperLogLog:
        """Union estimator (register-wise maximum).

        Raises:
            InvalidInputError: the precisions differ.
        """
        if self._b != other._b:
            raise InvalidInputError("HyperLogLog.merge: different precision")
        out = HyperLogLog(self._b)
        out._reg = bytearray(max(x, y) for x, y in zip(self._reg, other._reg, strict=True))
        return out


class DisjointSet:
    """Union-find with union by rank and full path compression (SPEC §8.3)."""

    def __init__(self, n: int) -> None:
        self._parent = list(range(n))
        self._rank = [0] * n
        self._count = n

    def find(self, x: int) -> int:
        """Root of ``x`` (iterative full path compression)."""
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
            self._parent[rx] = ry
        elif self._rank[rx] > self._rank[ry]:
            self._parent[ry] = rx
        else:
            self._parent[ry] = rx
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


class FenwickTree:
    """Fenwick tree (binary indexed tree), 1-based indices (SPEC §8.4)."""

    def __init__(self, arg: int | Sequence[float]) -> None:
        if isinstance(arg, int):
            self.n = arg
            self._tree: list[float] = [0] * (arg + 1)
        else:
            self.n = len(arg)
            self._tree = [0] * (self.n + 1)
            for i, v in enumerate(arg):
                self.update(i + 1, v)

    def update(self, i: int, val: float) -> None:
        """Add ``val`` at index ``i`` (1-based)."""
        while i <= self.n:
            self._tree[i] += val
            i += i & -i

    def prefix_sum(self, i: int) -> float:
        """Sum of ``[1, i]``; ``prefix_sum(0) = 0``."""
        s: float = 0
        while i > 0:
            s += self._tree[i]
            i -= i & -i
        return s

    def range_sum(self, lo: int, hi: int) -> float:
        """Sum of ``[lo, hi]`` (1-based, inclusive)."""
        return self.prefix_sum(hi) - self.prefix_sum(lo - 1)

    def point_query(self, i: int) -> float:
        """Value at index ``i``."""
        return self.range_sum(i, i)


class SegmentTree:
    """Segment tree with lazy propagation: range add, range sum, 0-based inclusive (SPEC §8.5)."""

    def __init__(self, arr: Sequence[float]) -> None:
        self._n = len(arr)
        self._tree: list[float] = [0] * (4 * self._n)
        self._lazy: list[float] = [0] * (4 * self._n)
        if self._n > 0:
            self._build(arr, 1, 0, self._n - 1)

    def _build(self, arr: Sequence[float], node: int, lo: int, hi: int) -> None:
        if lo == hi:
            self._tree[node] = arr[lo]
            return
        mid = (lo + hi) >> 1
        self._build(arr, 2 * node, lo, mid)
        self._build(arr, 2 * node + 1, mid + 1, hi)
        self._tree[node] = self._tree[2 * node] + self._tree[2 * node + 1]

    def _apply(self, node: int, lo: int, hi: int, val: float) -> None:
        self._tree[node] += val * (hi - lo + 1)
        self._lazy[node] += val

    def _push(self, node: int, lo: int, hi: int) -> None:
        pending = self._lazy[node]
        if pending != 0:
            mid = (lo + hi) >> 1
            self._apply(2 * node, lo, mid, pending)
            self._apply(2 * node + 1, mid + 1, hi, pending)
            self._lazy[node] = 0

    def query(self, lo: int, hi: int) -> float:
        """Sum of ``a[lo..hi]``."""
        if self._n == 0:
            return 0
        return self._query(lo, hi, 1, 0, self._n - 1)

    def _query(self, left: int, right: int, node: int, lo: int, hi: int) -> float:
        if right < lo or hi < left:
            return 0
        if left <= lo and hi <= right:
            return self._tree[node]
        self._push(node, lo, hi)
        mid = (lo + hi) >> 1
        return self._query(left, right, 2 * node, lo, mid) + self._query(
            left, right, 2 * node + 1, mid + 1, hi
        )

    def update(self, lo: int, hi: int, val: float) -> None:
        """Add ``val`` to every element of ``a[lo..hi]``."""
        if self._n > 0:
            self._update(lo, hi, val, 1, 0, self._n - 1)

    def _update(self, left: int, right: int, val: float, node: int, lo: int, hi: int) -> None:
        if right < lo or hi < left:
            return
        if left <= lo and hi <= right:
            self._apply(node, lo, hi, val)
            return
        self._push(node, lo, hi)
        mid = (lo + hi) >> 1
        self._update(left, right, val, 2 * node, lo, mid)
        self._update(left, right, val, 2 * node + 1, mid + 1, hi)
        self._tree[node] = self._tree[2 * node] + self._tree[2 * node + 1]

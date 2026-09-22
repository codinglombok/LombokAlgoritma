# LombokAlgoritma — Python Data Structures
# Apache-2.0 — @codinglombok
import math

class BloomFilter:
    def __init__(self, n: int, fpr: float=0.01):
        self._m = math.ceil(-n * math.log(fpr) / (math.log(2)**2))
        self._k = max(1, round((self._m / n) * math.log(2)))
        self._bits = bytearray(math.ceil(self._m / 8))
    def _hashes(self, item: str) -> list[int]:
        from .string import fnv1a32, fnv1a64
        h1 = fnv1a32(item); h2 = fnv1a32(item + "\x00seed2")
        return [abs((h1 + i * h2) % self._m) for i in range(self._k)]
    def add(self, item: str) -> None:
        for pos in self._hashes(item): self._bits[pos >> 3] |= (1 << (pos & 7))
    def has(self, item: str) -> bool:
        return all((self._bits[p >> 3] >> (p & 7)) & 1 for p in self._hashes(item))

class DisjointSet:
    def __init__(self, n: int):
        self._parent = list(range(n)); self._rank = [0]*n; self._count = n
    def find(self, x: int) -> int:
        if self._parent[x] != x: self._parent[x] = self.find(self._parent[x])
        return self._parent[x]
    def union(self, x: int, y: int) -> bool:
        rx, ry = self.find(x), self.find(y)
        if rx == ry: return False
        if self._rank[rx] < self._rank[ry]: rx, ry = ry, rx
        self._parent[ry] = rx
        if self._rank[rx] == self._rank[ry]: self._rank[rx] += 1
        self._count -= 1; return True
    def connected(self, x: int, y: int) -> bool: return self.find(x) == self.find(y)
    @property
    def count(self) -> int: return self._count

# LombokAlgoritma — Python String Module
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

_M32 = 0xFFFFFFFF
_M64 = 0xFFFFFFFFFFFFFFFF


def kmp_search(text: str, pattern: str) -> list[int]:
    """All start indices of ``pattern`` in ``text`` (Knuth-Morris-Pratt, O(n + m))."""
    if not pattern:
        return []
    m = len(pattern)
    f = [0] * m
    k = 0
    for i in range(1, m):
        while k > 0 and pattern[k] != pattern[i]:
            k = f[k - 1]
        if pattern[k] == pattern[i]:
            k += 1
        f[i] = k
    results: list[int] = []
    k = 0
    for i, ch in enumerate(text):
        while k > 0 and pattern[k] != ch:
            k = f[k - 1]
        if pattern[k] == ch:
            k += 1
        if k == m:
            results.append(i - m + 1)
            k = f[k - 1]
    return results


def levenshtein(a: str, b: str) -> int:
    """Levenshtein edit distance (two-row DP)."""
    if a == b:
        return 0
    if len(a) > len(b):
        a, b = b, a
    prev = list(range(len(a) + 1))
    for j, ch_b in enumerate(b, 1):
        curr = [j] + [0] * len(a)
        for i, ch_a in enumerate(a, 1):
            cost = 0 if ch_a == ch_b else 1
            curr[i] = min(curr[i - 1] + 1, prev[i] + 1, prev[i - 1] + cost)
        prev = curr
    return prev[len(a)]


def jaro(a: str, b: str) -> float:
    """Jaro similarity in [0, 1]."""
    if a == b:
        return 1.0
    if not a or not b:
        return 0.0
    match_dist = max(0, max(len(a), len(b)) // 2 - 1)
    a_matched = [False] * len(a)
    b_matched = [False] * len(b)
    matches = 0
    for i in range(len(a)):
        lo = max(0, i - match_dist)
        hi = min(i + match_dist + 1, len(b))
        for j in range(lo, hi):
            if b_matched[j] or a[i] != b[j]:
                continue
            a_matched[i] = b_matched[j] = True
            matches += 1
            break
    if matches == 0:
        return 0.0
    trans = 0
    k = 0
    for i in range(len(a)):
        if not a_matched[i]:
            continue
        while not b_matched[k]:
            k += 1
        if a[i] != b[k]:
            trans += 1
        k += 1
    return (matches / len(a) + matches / len(b) + (matches - trans / 2) / matches) / 3


def jaro_winkler(a: str, b: str, p: float = 0.1) -> float:
    """Jaro-Winkler similarity (common prefix up to 4, scaling ``p``)."""
    j = jaro(a, b)
    prefix = 0
    for x, y in zip(a[:4], b[:4], strict=False):
        if x != y:
            break
        prefix += 1
    return j + prefix * p * (1 - j)


def _bytes(data: bytes | str) -> bytes:
    return data.encode() if isinstance(data, str) else data


def fnv1a32(data: bytes | str) -> int:
    """FNV-1a 32-bit."""
    h = 0x811C9DC5
    for b in _bytes(data):
        h = ((h ^ b) * 0x01000193) & _M32
    return h


def fnv1a64(data: bytes | str) -> int:
    """FNV-1a 64-bit."""
    h = 0xCBF29CE484222325
    for b in _bytes(data):
        h = ((h ^ b) * 0x00000100000001B3) & _M64
    return h


def _rotl32(x: int, r: int) -> int:
    return ((x << r) | (x >> (32 - r))) & _M32


def fmix32(h: int) -> int:
    """MurmurHash3 32-bit finalizer."""
    h ^= h >> 16
    h = (h * 0x85EBCA6B) & _M32
    h ^= h >> 13
    h = (h * 0xC2B2AE35) & _M32
    return h ^ (h >> 16)


def murmur3_32(data: bytes | str, seed: int = 0) -> int:
    """MurmurHash3_x86_32."""
    d = _bytes(data)
    c1, c2 = 0xCC9E2D51, 0x1B873593
    h = seed & _M32
    n4 = len(d) & ~3
    for i in range(0, n4, 4):
        k = int.from_bytes(d[i : i + 4], "little")
        k = (_rotl32((k * c1) & _M32, 15) * c2) & _M32
        h ^= k
        h = (_rotl32(h, 13) * 5 + 0xE6546B64) & _M32
    tail = d[n4:]
    if tail:
        k = int.from_bytes(tail, "little")
        h ^= (_rotl32((k * c1) & _M32, 15) * c2) & _M32
    return fmix32(h ^ len(d))


_P1, _P2, _P3, _P4, _P5 = 0x9E3779B1, 0x85EBCA77, 0xC2B2AE3D, 0x27D4EB2F, 0x165667B1


def xxhash32(data: bytes | str, seed: int = 0) -> int:
    """xxHash32 (XXH32) per the reference specification."""
    d = _bytes(data)
    n = len(d)
    s = seed & _M32
    i = 0
    if n >= 16:
        v = [(s + _P1 + _P2) & _M32, (s + _P2) & _M32, s, (s - _P1) & _M32]
        while i + 16 <= n:
            for lane in range(4):
                w = int.from_bytes(d[i + 4 * lane : i + 4 * lane + 4], "little")
                v[lane] = (_rotl32((v[lane] + w * _P2) & _M32, 13) * _P1) & _M32
            i += 16
        h = (_rotl32(v[0], 1) + _rotl32(v[1], 7) + _rotl32(v[2], 12) + _rotl32(v[3], 18)) & _M32
    else:
        h = (s + _P5) & _M32
    h = (h + n) & _M32
    while i + 4 <= n:
        w = int.from_bytes(d[i : i + 4], "little")
        h = (_rotl32((h + w * _P3) & _M32, 17) * _P4) & _M32
        i += 4
    while i < n:
        h = (_rotl32((h + d[i] * _P5) & _M32, 11) * _P1) & _M32
        i += 1
    h ^= h >> 15
    h = (h * _P2) & _M32
    h ^= h >> 13
    h = (h * _P3) & _M32
    return h ^ (h >> 16)

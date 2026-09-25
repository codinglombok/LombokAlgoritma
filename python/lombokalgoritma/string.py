# LombokAlgoritma — Python String Module (SPEC §11)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
"""String algorithms over Unicode code points (a Python ``str`` is a code-point sequence).

The non-cryptographic hashes live in :mod:`lombokalgoritma.hash`; they are re-exported here for
backwards compatibility with v0.1.x imports.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .hash import fmix32, fnv1a32, fnv1a64, murmur3_32, siphash24, xxhash32, xxhash64

__all__ = [
    "AhoCorasick",
    "AhoCorasickMatch",
    "damerau_levenshtein",
    "fmix32",
    "fnv1a32",
    "fnv1a64",
    "jaro",
    "jaro_winkler",
    "kmp_search",
    "levenshtein",
    "murmur3_32",
    "polynomial_hash",
    "siphash24",
    "xxhash32",
    "xxhash64",
]


def kmp_search(text: str, pattern: str) -> list[int]:
    """All (overlapping) start indices of ``pattern`` in ``text``; ``[]`` for an empty pattern."""
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
    """Levenshtein edit distance (two-row Wagner–Fischer)."""
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


def damerau_levenshtein(a: str, b: str) -> int:
    """Unrestricted Damerau–Levenshtein distance (Lowrance–Wagner)."""
    m, n = len(a), len(b)
    if m == 0:
        return n
    if n == 0:
        return m
    max_dist = m + n
    d = [[0] * (n + 2) for _ in range(m + 2)]
    d[0][0] = max_dist
    for i in range(m + 1):
        d[i + 1][0] = max_dist
        d[i + 1][1] = i
    for j in range(n + 1):
        d[0][j + 1] = max_dist
        d[1][j + 1] = j
    da: dict[str, int] = {}
    for i in range(1, m + 1):
        db = 0
        for j in range(1, n + 1):
            i1 = da.get(b[j - 1], 0)
            j1 = db
            cost = 0 if a[i - 1] == b[j - 1] else 1
            if cost == 0:
                db = j
            d[i + 1][j + 1] = min(
                d[i][j] + cost,
                d[i + 1][j] + 1,
                d[i][j + 1] + 1,
                d[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1),
            )
        da[a[i - 1]] = i
    return d[m + 1][n + 1]


def jaro(a: str, b: str) -> float:
    """Jaro similarity in [0, 1] — ``((m/|a| + m/|b|) + (m − t/2)/m) / 3``."""
    if a == b:
        return 1.0
    match_dist = max(len(a), len(b)) // 2 - 1
    if match_dist < 0:
        return 0.0
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
    """Jaro–Winkler similarity ``j + ((ℓ·p)·(1 − j))`` with common prefix ``ℓ ≤ 4``."""
    j = jaro(a, b)
    prefix = 0
    for x, y in zip(a[:4], b[:4], strict=False):
        if x != y:
            break
        prefix += 1
    return j + prefix * p * (1 - j)


def polynomial_hash(s: str, base: int = 31, mod: int = 1_000_000_007) -> int:
    """Polynomial hash by Horner's rule over ``cp − 96``, result in ``[0, mod)``."""
    h = 0
    for ch in s:
        h = (h * base + (ord(ch) - 96)) % mod
    return h


@dataclass(frozen=True)
class AhoCorasickMatch:
    """One match: ``pattern`` found at code-point ``index``."""

    pattern: str
    index: int


@dataclass
class _ACNode:
    children: dict[str, int] = field(default_factory=dict)
    fail: int = 0
    own: list[str] = field(default_factory=list)
    output: list[str] = field(default_factory=list)


class AhoCorasick:
    """Aho–Corasick multi-pattern automaton (SPEC §11).

    Matches are reported in ascending end position; at one position the node's own patterns come
    first (insertion order), then those inherited through the failure link.
    """

    def __init__(self, patterns: list[str] | None = None) -> None:
        self._nodes: list[_ACNode] = [_ACNode()]
        self._built = False
        for p in patterns or []:
            self.add_pattern(p)

    def add_pattern(self, pattern: str) -> None:
        """Add a pattern (empty patterns are ignored)."""
        if not pattern:
            return
        cur = 0
        for ch in pattern:
            node = self._nodes[cur]
            nxt = node.children.get(ch)
            if nxt is None:
                nxt = len(self._nodes)
                node.children[ch] = nxt
                self._nodes.append(_ACNode())
            cur = nxt
        self._nodes[cur].own.append(pattern)
        self._built = False

    def build(self) -> None:
        """Compute failure links (BFS)."""
        nodes = self._nodes
        for n in nodes:
            n.output = n.own[:]
        queue: list[int] = []
        for child in nodes[0].children.values():
            nodes[child].fail = 0
            queue.append(child)
        h = 0
        while h < len(queue):
            u = queue[h]
            h += 1
            for ch, v in nodes[u].children.items():
                fail = nodes[u].fail
                while fail != 0 and ch not in nodes[fail].children:
                    fail = nodes[fail].fail
                fv = nodes[fail].children.get(ch)
                node_v = nodes[v]
                node_v.fail = fv if fv is not None and fv != v else 0
                node_v.output = node_v.output + nodes[node_v.fail].output
                queue.append(v)
        self._built = True

    def search(self, text: str) -> list[AhoCorasickMatch]:
        """All matches in ``text`` (builds the automaton on first use)."""
        if not self._built:
            self.build()
        nodes = self._nodes
        results: list[AhoCorasickMatch] = []
        cur = 0
        for i, ch in enumerate(text):
            while cur != 0 and ch not in nodes[cur].children:
                cur = nodes[cur].fail
            cur = nodes[cur].children.get(ch, 0)
            for pattern in nodes[cur].output:
                results.append(AhoCorasickMatch(pattern, i - len(pattern) + 1))
        return results

# LombokAlgoritma — Python regression & coverage tests
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import functools
import random

import pytest

from lombokalgoritma import datastructure, math, ml, search, sort, string
from lombokalgoritma.errors import AlgoError, NoInverseError

INPUTS = [
    b"",
    b"a",
    b"abc",
    b"hello",
    b"abcdefghijklmnop",
    b"The quick brown fox jumps over the lazy dog",
]


# --- math -------------------------------------------------------------------------------------
def test_number_theory() -> None:
    assert math.lcm(0, 5) == 0 and math.lcm(-4, 6) == 12
    with pytest.raises(NoInverseError):
        math.mod_inverse(2, 4)
    assert math.mod_inverse(-3, 11) == 7
    assert math.crt([2, 3, 2], [3, 5, 7]) == 23
    assert math.crt([1, 2, 3], [5, 7, 11]) == 366
    for x in range(60):
        assert math.crt([x % 3, x % 4, x % 5], [3, 4, 5]) == x
    with pytest.raises(AlgoError):
        math.crt([1, 1], [4, 6])
    with pytest.raises(AlgoError):
        math.crt([1], [3, 5])
    primes = [n for n in range(200) if math.is_prime(n)]
    assert primes == [n for n in range(2, 200) if all(n % d for d in range(2, int(n**0.5) + 1))]
    assert math.is_prime(2**61 - 1) and not math.is_prime(
        3215031751
    )  # strong pseudoprime to 2,3,5,7
    assert math.next_prime(0) == 2 and math.next_prime(14) == 17 and math.next_prime(17) == 17


# --- sort / search ----------------------------------------------------------------------------
def test_sorts_match_builtin() -> None:
    rng = random.Random(1)
    for n in [0, 1, 15, 16, 17, 100, 1000]:
        data = [rng.randrange(-50, 50) for _ in range(n)]
        want = sorted(data)
        assert sort.quicksort(data) == want
        assert sort.mergesort(data) == want
        assert sort.heapsort(data) == want
        assert sort.radix_sort_lsd(data) == want
        assert sort.timsort(data) == want


def test_quicksort_honours_comparator() -> None:
    desc = sort.quicksort([3, 1, 2, 5, 4] * 5, cmp=lambda a, b: b - a)
    assert desc == sorted([3, 1, 2, 5, 4] * 5, reverse=True)
    words = ["banana", "fig", "apple", "kiwi"]
    assert [len(w) for w in sort.quicksort(words, cmp=lambda a, b: len(a) - len(b))] == [3, 4, 5, 6]


def test_stable_sorts() -> None:
    items = [(k % 3, i) for i, k in enumerate(range(30))]
    assert sort.sort_with(items, lambda a, b: a[0] - b[0]) == sorted(items, key=lambda t: t[0])
    assert sort.timsort(items, key=lambda t: t[0]) == sorted(items, key=lambda t: t[0])

    @functools.total_ordering
    class K:
        def __init__(self, k: int, tag: int) -> None:
            self.k, self.tag = k, tag

        def __lt__(self, o: "K") -> bool:
            return self.k < o.k

        def __eq__(self, o: object) -> bool:
            return isinstance(o, K) and self.k == o.k

    ks = [K(i % 4, i) for i in range(40)]
    assert [x.tag for x in sort.mergesort(ks)] == [x.tag for x in sorted(ks, key=lambda x: x.k)]


def test_counting_sort_validation() -> None:
    assert sort.counting_sort([]) == []
    with pytest.raises(AlgoError):
        sort.counting_sort([1, -1])
    with pytest.raises(AlgoError):
        sort.counting_sort([5, 1], 3)
    assert sort.radix_sort_lsd([]) == []


def test_search_family() -> None:
    arr = list(range(0, 2000, 2))
    for i, v in enumerate(arr):
        assert search.jump_search(arr, v) == i
    for f in (
        search.binary_search,
        search.jump_search,
        search.interpolation_search,
        search.linear_search,
    ):
        assert f(arr, 998) == 499
        assert f(arr, 3) == -1
        assert f([], 3) == -1
    assert search.jump_search([0, 1, 2, 3], 2) == 2
    assert search.interpolation_search([7, 7, 7], 7) == 0
    assert search.interpolation_search([5], 5) == 0
    assert search.lower_bound([1, 3, 3, 5], 3) == 1
    assert search.upper_bound([1, 3, 3, 5], 3) == 3


# --- string -----------------------------------------------------------------------------------
def test_hash_reference_values() -> None:
    assert [string.xxhash32(s) for s in INPUTS] == [
        0x02CC5D05,
        0x550D7456,
        0x32D153FF,
        0xFB0077F9,
        0x9D2D8B62,
        0xE85EA4DE,
    ]
    assert [string.xxhash32(s, 1) for s in INPUTS] == [
        0x0B2CB792,
        0xF514706F,
        0xAA3DA8FF,
        0xFCFFFBA9,
        0x7CFB9556,
        0x234F8471,
    ]
    assert [string.murmur3_32(s) for s in INPUTS] == [
        0,
        0x3C2569B2,
        0xB3DD93FA,
        0x248BFA47,
        0xE76291ED,
        0x2E4FF723,
    ]
    assert string.murmur3_32("hello", 42) == 0xE2DBD2E1
    assert string.fnv1a32("a") == 0xE40C292C and string.fnv1a64(b"a") == 0xAF63DC4C8601EC8C


def test_jaro_family() -> None:
    assert string.jaro("", "abc") == 0.0
    assert string.jaro("abc", "xyz") == 0.0
    assert abs(string.jaro("MARTHA", "MARHTA") - 0.9444444444444445) < 1e-12
    assert abs(string.jaro_winkler("MARTHA", "MARHTA") - 0.9611111111111111) < 1e-12
    assert abs(string.jaro_winkler("DIXON", "DICKSONX") - 0.8133333333333332) < 1e-12
    assert string.kmp_search("aaaa", "aa") == [0, 1, 2]
    assert string.kmp_search("abc", "") == []


# --- ml / datastructure -----------------------------------------------------------------------
def test_vector_ops() -> None:
    assert ml.dot_product([1, 2, 3], [4, 5, 6]) == 32
    assert ml.l2_norm([3, 4]) == 5
    assert ml.l2_distance([0, 0], [3, 4]) == 5
    assert ml.l1_distance([0, 0], [3, -4]) == 7
    assert ml.cosine_similarity([1, 0], [0, 0]) == 0.0
    assert abs(ml.cosine_similarity([1, 1], [2, 2]) - 1) < 1e-12
    assert ml.normalize([0, 0]) == [0.0, 0.0]
    assert ml.normalize([3, 4]) == [0.6, 0.8]
    assert ml.pearson([1, 2, 3, 4], [1, -1, -1, 1]) == 0.0
    assert abs(ml.pearson([1, 2, 3, 4], [2, 1, 4, 3]) - 0.6) < 1e-12
    assert ml.pearson([1, 1], [1, 2]) == 0.0
    with pytest.raises(AlgoError):
        ml.pearson([1], [1, 2])
    with pytest.raises(AlgoError):
        ml.dot_product([1], [1, 2])


def test_kmeans() -> None:
    pts = [[0.0, 0.0], [0.1, 0.0], [0.0, 0.1], [10.0, 10.0], [10.1, 10.0], [10.0, 10.1]]
    r = ml.kmeans(pts, 2, seed=7)
    assert len(set(r["labels"][:3])) == 1 and len(set(r["labels"][3:])) == 1
    assert r["labels"][0] != r["labels"][3]
    assert r["inertia"] < 0.1 and r["iterations"] >= 1
    assert ml.kmeans(pts, 2, seed=7) == r  # deterministic for a fixed seed
    with pytest.raises(AlgoError):
        ml.kmeans([], 1)
    with pytest.raises(AlgoError):
        ml.kmeans(pts, 7)
    same = ml.kmeans([[1.0, 1.0]] * 4, 2, seed=1)  # duplicate points → empty cluster branch
    assert same["inertia"] == 0


def test_bloom_and_dsu() -> None:
    bf = datastructure.BloomFilter(1000, 0.01)
    for i in range(1000):
        bf.add(f"k{i}")
    assert all(bf.has(f"k{i}") for i in range(1000))
    fp = sum(bf.has(f"u{i}") for i in range(2000))
    assert fp < 80  # ≈1 % expected
    with pytest.raises(AlgoError):
        datastructure.BloomFilter(0)
    ds = datastructure.DisjointSet(6)
    assert ds.union(0, 1) and ds.union(1, 2) and not ds.union(0, 2)
    assert ds.union(4, 3) and ds.union(3, 0)
    assert ds.connected(4, 2) and not ds.connected(5, 0)
    assert ds.count == 2
    big = datastructure.DisjointSet(100_000)  # iterative find: no RecursionError on long chains
    for i in range(99_999):
        big._parent[i] = i + 1
    assert big.find(0) == 99_999

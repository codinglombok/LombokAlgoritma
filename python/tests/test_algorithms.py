# LombokAlgoritma — Python unit tests for the v0.2.0 modules
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import math
import random

import pytest

from lombokalgoritma import compression, datastructure, geometry, graph, ml, rng, search, sort
from lombokalgoritma import hash as lh
from lombokalgoritma import string as st
from lombokalgoritma.errors import AlgoError, InvalidInputError


def code(exc: pytest.ExceptionInfo[AlgoError]) -> str:
    return exc.value.code


# --- errors -----------------------------------------------------------------------------------
def test_algo_error() -> None:
    e = InvalidInputError("bad")
    assert isinstance(e, ValueError) and e.code == "INVALID_INPUT"
    assert repr(e) == "InvalidInputError('INVALID_INPUT', 'bad')"
    assert AlgoError("OVERFLOW", "x").code == "OVERFLOW"


# --- rng --------------------------------------------------------------------------------------
def test_rng_reference_values() -> None:
    # xoshiro256++ / splitmix64 reference (prng.di.unimi.it), pcg32 demo (pcg-c, seed 42/54)
    assert rng.SplitMix64(0).next() == 0xE220A8397B1DCDAF
    p = rng.Pcg32(42, 54)
    assert [p.next() for _ in range(3)] == [0xA15C02B7, 0x7B47F409, 0xBA1D3330]
    x = rng.Xoshiro256pp()
    f = x.next_float()
    assert 0 <= f < 1
    assert 0 <= rng.Pcg32().next_float() < 1
    r = rng.Xoshiro256pp(7)
    assert all(0 <= r.next_int(10) < 10 for _ in range(100))
    for bad in (0, 2**53, 1.5, True):
        with pytest.raises(AlgoError) as e:
            r.next_int(bad)  # type: ignore[arg-type]
        assert code(e) == "OUT_OF_RANGE"
    for bad in (0, 2**32):
        with pytest.raises(AlgoError):
            p.next_bounded(bad)
    assert all(0 <= p.next_bounded(7) < 7 for _ in range(100))


# --- hash -------------------------------------------------------------------------------------
def test_hashes() -> None:
    assert lh.xxhash64(b"") == 0xEF46DB3751D8E999
    assert lh.xxhash64("abc") == 0x44BC2CF5AD770999
    key = bytes(range(16))
    # SipHash-2-4 paper test vector (64-byte message 00..0e → a129ca6149be45e5)
    assert lh.siphash24(key, bytes(range(15))) == int.from_bytes(
        bytes.fromhex("e545be4961ca29a1"), "little"
    )
    with pytest.raises(AlgoError) as e:
        lh.siphash24(b"short", b"")
    assert code(e) == "INVALID_INPUT"
    assert st.fnv1a32 is lh.fnv1a32  # re-exported for v0.1 imports
    assert lh.fmix32(0) == 0


# --- string -----------------------------------------------------------------------------------
def test_strings_code_points() -> None:
    assert st.levenshtein("😀", "") == 1
    assert st.levenshtein("abc", "abc") == 0
    assert st.damerau_levenshtein("ca", "abc") == 2
    assert st.damerau_levenshtein("", "ab") == 2 and st.damerau_levenshtein("ab", "") == 2
    assert st.kmp_search("a😀a😀", "😀") == [1, 3]
    assert st.jaro("a", "b") == 0.0 and st.jaro("x", "x") == 1.0
    assert st.polynomial_hash("abc") == (1 * 31 * 31 + 2 * 31 + 3)
    ac = st.AhoCorasick(["he", "she", "his", "hers", ""])
    got = [(m.pattern, m.index) for m in ac.search("ushers")]
    assert got == [("she", 1), ("he", 2), ("hers", 2)]
    ac.add_pattern("😀")
    assert [m.index for m in ac.search("a😀")] == [1]


# --- sort / search ----------------------------------------------------------------------------
def test_sort_search_extras() -> None:
    assert sort.counting_sort([-1]) == [-1]  # length ≤ 1 is returned as-is (like the TS port)
    with pytest.raises(AlgoError) as e:
        sort.counting_sort([3, -1, 2])
    assert code(e) == "OUT_OF_RANGE"
    assert sort.radix_sort_lsd([5]) == [5]
    pairs = [(k % 3, i) for i, k in enumerate(range(20))]
    assert sort.mergesort(pairs, key=lambda p: p[0]) == sorted(pairs, key=lambda p: p[0])
    arr = [1, 3, 3, 5, 7, 9, 11]
    for f in (search.exponential_search, search.fibonacci_search):
        assert f(arr, 7) == 4
        assert f(arr, 4) == -1
        assert f([], 1) == -1
    assert search.exponential_search(arr, 1) == 0
    x = search.ternary_search(-10, 10, lambda t: -((t - 2) ** 2))
    assert abs(x - 2) < 1e-6
    y = search.ternary_search(-10, 10, lambda t: (t + 1) ** 2, maximize=False)
    assert abs(y + 1) < 1e-6


# --- data structures --------------------------------------------------------------------------
def test_bloom_filter() -> None:
    f = datastructure.BloomFilter.with_params(64, 3)
    f.add("x")
    assert "x" in f and f.size == 64 and f.hash_count == 3
    assert f.set_bits <= 3 and len(f.to_bytes()) == 8
    assert 0 < f.estimated_fpr < 1
    with pytest.raises(AlgoError):
        datastructure.BloomFilter.with_params(0, 1)
    with pytest.raises(AlgoError):
        datastructure.BloomFilter.with_params(8, 65)
    g = datastructure.BloomFilter(100, 0.01)
    assert g.size > 0 and g.hash_count >= 1


def test_hyperloglog() -> None:
    h = datastructure.HyperLogLog(2)  # clamped to 4
    assert h.precision == 4 and len(h.registers()) == 16
    assert h.count() == 0
    big = datastructure.HyperLogLog(4)
    for i in range(100_000):
        big.add(f"x{i}")
    assert big.count() > 50_000  # large-range branch of the estimator
    for b in (5, 6, 10):
        e = datastructure.HyperLogLog(b)
        for i in range(1000):
            e.add(f"k{i}")
        assert 700 < e.count() < 1300
    with pytest.raises(AlgoError) as exc:
        datastructure.HyperLogLog(4).merge(datastructure.HyperLogLog(5))
    assert code(exc) == "INVALID_INPUT"


def test_fenwick_segment() -> None:
    ft = datastructure.FenwickTree(5)
    ft.update(3, 4)
    assert ft.prefix_sum(5) == 4 and ft.point_query(3) == 4 and ft.range_sum(1, 2) == 0
    st_ = datastructure.SegmentTree([1, 2, 3, 4])
    st_.update(1, 2, 10)
    assert st_.query(0, 3) == 30 and st_.query(2, 2) == 13
    empty = datastructure.SegmentTree([])
    empty.update(0, 0, 1)
    assert empty.query(0, 0) == 0
    rnd = random.Random(9)
    arr = [rnd.randrange(-5, 5) for _ in range(40)]
    seg = datastructure.SegmentTree(arr)
    for _ in range(200):
        lo = rnd.randrange(40)
        hi = rnd.randrange(lo, 40)
        if rnd.random() < 0.5:
            v = rnd.randrange(-3, 4)
            seg.update(lo, hi, v)
            for i in range(lo, hi + 1):
                arr[i] += v
        else:
            assert seg.query(lo, hi) == sum(arr[lo : hi + 1])


# --- graph ------------------------------------------------------------------------------------
def test_graph_validation_and_helpers() -> None:
    with pytest.raises(AlgoError) as e:
        graph.bfs(graph.Graph(-1, []), 0)
    assert code(e) == "INVALID_INPUT"
    with pytest.raises(AlgoError) as e:
        graph.bfs(graph.Graph(2, [(0, 2, 1.0)]), 0)
    assert code(e) == "OUT_OF_RANGE"
    with pytest.raises(AlgoError) as e:
        graph.dfs(graph.Graph(2, []), 5)
    assert code(e) == "OUT_OF_RANGE"
    with pytest.raises(AlgoError):
        graph.pagerank(graph.Graph(2, []), damping=1.5)
    assert graph.pagerank(graph.Graph(0, [])) == []
    g = graph.Graph(3, [graph.Edge(0, 1, 1), graph.Edge(1, 2, 1), graph.Edge(0, 2, 5)])
    r = graph.a_star(g, 0, 2, heuristic=lambda v: [2, 1, 0][v])
    assert r.path == [0, 1, 2] and r.cost == 2
    assert graph.a_star(g, 2, 0) == graph.AStarResult([], math.inf)
    with pytest.raises(AlgoError) as e:
        graph.a_star(graph.Graph(2, [(0, 1, -1)]), 0, 1)
    assert code(e) == "NEGATIVE_WEIGHT"
    with pytest.raises(AlgoError) as e:
        graph.dinic(graph.Graph(2, [(0, 1, -1)]), 0, 1)
    assert code(e) == "NEGATIVE_WEIGHT"
    assert graph.dinic(g, 0, 2) == 6
    m = graph.bipartite_matching(2, 2, [(0, 0), (1, 0), (1, 1)])
    assert m.size == 2 and sorted(m.match_left) == [0, 1]
    assert graph.build_adj_list(g)[0] == [(1, 1), (2, 5)]
    graph.validate_graph(graph.Graph(2.0, [(0.0, 1.0, 1)]))  # type: ignore[arg-type]


# --- ml / geometry / compression --------------------------------------------------------------
def test_ml_extras() -> None:
    assert ml.jaccard_similarity([], []) == 1.0
    assert ml.jaccard_similarity(["a", "b"], ["b", "c", "c"]) == 1 / 3
    assert ml.pearson([], []) == 0.0
    res = ml.batch_cosine([1, 0], [[0, 1], [1, 0], [0, 0], [2, 0]])
    assert [r.index for r in res] == [1, 3, 0, 2]
    for f in (ml.cosine_similarity, ml.l2_distance, ml.l1_distance):
        with pytest.raises(AlgoError):
            f([1], [1, 2])
    with pytest.raises(AlgoError) as e:
        ml.kmeans([[1.0, 2.0], [1.0]], 1)
    assert code(e) == "INVALID_INPUT"
    with pytest.raises(AlgoError) as e:
        ml.kmeans([], 1)
    assert code(e) == "EMPTY_INPUT"


def test_geometry_extras() -> None:
    assert geometry.convex_hull([(1, 1), (0, 0)]) == [(0, 0), (1, 1)]
    assert geometry.convex_hull([(1, 1)] * 4) == [(1, 1)]
    sq = [(0, 0), (1, 0), (1, 1), (0, 1)]
    assert geometry.convex_hull([*sq, (0.5, 0.5)]) == sq
    assert geometry.point_in_polygon((0.5, 0.5), sq) and not geometry.point_in_polygon((2, 2), sq)
    assert geometry.bezier([(0, 0), (2, 2)], 0.5) == (1, 1)
    rnd = random.Random(2)
    pts = [(rnd.uniform(0, 100), rnd.uniform(0, 100)) for _ in range(200)]
    brute = min(math.dist(p, q) for i, p in enumerate(pts) for q in pts[i + 1 :])
    assert abs(geometry.closest_pair(pts)[2] - brute) < 1e-12


def test_compression_roundtrip() -> None:
    rnd = random.Random(4)
    samples = [b"", b"a", b"aaaa", bytes(600), bytes(rnd.randrange(4) for _ in range(500))]
    for data in samples:
        assert compression.rle_decode(compression.rle_encode(data)) == data
        assert compression.lz77_decompress(compression.lz77_compress(data)) == data
        r = compression.huffman_encode(data)
        assert compression.huffman_decode(r.encoded, r.bit_length, r.tree) == data
    assert compression.lz77_decompress(compression.lz77_compress(b"abcabcabc", 1)) == b"abcabcabc"
    for bad in (b"\x00", b"\x01\x01"):
        with pytest.raises(AlgoError):
            compression.lz77_decompress(bad)
    r = compression.huffman_encode(b"abcab")
    with pytest.raises(AlgoError):
        compression.huffman_decode(r.encoded, 99, r.tree)
    t = compression.huffman_encode(b"abc")  # codes c=0, a=10, b=11 → bits 10 11 0
    assert t.codes == {97: "10", 98: "11", 99: "0"}
    with pytest.raises(AlgoError):
        compression.huffman_decode(t.encoded, 1, t.tree)
    with pytest.raises(AlgoError):
        compression.huffman_decode(b"\xff", 8, compression.HuffNode(2, None, r.tree, None))
    assert compression.huffman_encode(b"zz").codes == {ord("z"): "0"}

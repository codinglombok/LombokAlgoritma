# LombokAlgoritma — shared-vector runner (Python port), SPEC §3–§4, §14
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
"""Run ``vectors/lombokalgoritma-vectors-v1.json`` and print ``group<TAB>id<TAB>canonical`` lines.

Usage (from the repo root)::

    python -m lombokalgoritma._vectors vectors/lombokalgoritma-vectors-v1.json > out/python.txt

Exits non-zero on an unknown group or when any case differs from its ``expected`` value.
"""

from __future__ import annotations

import json
import math
import struct
import sys
from collections.abc import Callable, Sequence
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from . import compression as cmp
from . import datastructure as ds
from . import geometry as geo
from . import graph as gr
from . import hash as hs
from . import math as mt
from . import ml, rng, search, sort
from . import string as st
from .errors import AlgoError

_MAX_SAFE = (1 << 53) - 1

# ── §3 canonical JSON ─────────────────────────────────────────────────────────────────────────


def format_number(x: float) -> str:
    """SPEC §3.2: ECMAScript ``Number::toString`` with ``-0`` kept; NaN/±Infinity as strings."""
    if x != x:
        return '"NaN"'
    if x == math.inf:
        return '"Infinity"'
    if x == -math.inf:
        return '"-Infinity"'
    if x == 0:
        return "-0" if math.copysign(1.0, x) < 0 else "0"
    if x < 0:
        return "-" + format_number(-x)
    mant, _, exp = repr(float(x)).partition("e")
    int_part, _, frac = mant.partition(".")
    digits = int_part + frac
    n = len(int_part) + (int(exp) if exp else 0)  # x = 0.d1d2… × 10^n
    stripped = digits.lstrip("0")
    n -= len(digits) - len(stripped)
    digits = stripped.rstrip("0")
    k = len(digits)
    if k <= n <= 21:
        return digits + "0" * (n - k)
    if 0 < n <= 21:
        return digits[:n] + "." + digits[n:]
    if -6 < n <= 0:
        return "0." + "0" * (-n) + digits
    e = n - 1
    sign = "+" if e >= 0 else "-"
    head = digits[0] + ("." + digits[1:] if k > 1 else "")
    return f"{head}e{sign}{abs(e)}"


_ESCAPES = {
    '"': '\\"',
    "\\": "\\\\",
    "\b": "\\b",
    "\f": "\\f",
    "\n": "\\n",
    "\r": "\\r",
    "\t": "\\t",
}


def _string(s: str) -> str:
    out = ['"']
    for ch in s:
        c = ord(ch)
        if ch in _ESCAPES:
            out.append(_ESCAPES[ch])
        elif c < 0x20 or 0xD800 <= c <= 0xDFFF:
            out.append(f"\\u{c:04x}")
        else:
            out.append(ch)
    out.append('"')
    return "".join(out)


def canonical(v: Any) -> str:
    """Canonical serialisation of a JSON-like value (SPEC §3)."""
    if v is None:
        return "null"
    if v is True:
        return "true"
    if v is False:
        return "false"
    if isinstance(v, int):
        return str(v) if -_MAX_SAFE <= v <= _MAX_SAFE else format_number(float(v))
    if isinstance(v, float):
        return format_number(v)
    if isinstance(v, str):
        return _string(v)
    if isinstance(v, (bytes, bytearray)):
        return _string(v.hex())
    if isinstance(v, dict):
        items = sorted(v.items())
        return "{" + ",".join(f"{_string(k)}:{canonical(x)}" for k, x in items) + "}"
    if isinstance(v, (list, tuple)):
        return "[" + ",".join(canonical(x) for x in v) + "]"
    raise TypeError(f"canonical: unsupported value {v!r}")


def hex64(x: int) -> str:
    """u64 → 16 lowercase hex digits (SPEC §3.1)."""
    return f"{x & 0xFFFFFFFFFFFFFFFF:016x}"


def int_out(v: int) -> int | str:
    """A JSON number when ``|v| <= 2^53 − 1``, else a decimal string (SPEC §3.1)."""
    return v if -_MAX_SAFE <= v <= _MAX_SAFE else str(v)


def big(v: Any) -> int:
    """Integer input: a JSON number or a decimal string."""
    if isinstance(v, bool):
        raise TypeError(f"not an integer: {v!r}")
    if isinstance(v, int):
        return v
    if isinstance(v, float) and v.is_integer() and abs(v) <= _MAX_SAFE:
        return int(v)
    if isinstance(v, str) and v.lstrip("-").isdigit():
        return int(v)
    raise TypeError(f"not an integer: {v!r}")


def _parse_int(s: str) -> int | float:
    return -0.0 if s == "-0" else int(s)


def loads(text: str) -> Any:
    """``json.loads`` that keeps the token ``-0`` as ``-0.0``."""
    return json.loads(text, parse_int=_parse_int)


# ── §4.2 dispatch ─────────────────────────────────────────────────────────────────────────────

In = dict[str, Any]
Fn = Callable[[In], Any]


def _f(x: Any) -> float:
    return float(x)


def _fv(xs: Sequence[Any]) -> list[float]:
    return [float(x) for x in xs]


def _pt(p: Sequence[Any]) -> geo.Point2D:
    return (float(p[0]), float(p[1]))


def _pts(ps: Sequence[Sequence[Any]]) -> list[geo.Point2D]:
    return [_pt(p) for p in ps]


def _graph(g: In) -> gr.Graph:
    return gr.Graph(g["nodes"], [(e[0], e[1], float(e[2])) for e in g["edges"]])


def _edges_out(es: Sequence[gr.Edge]) -> list[list[float]]:
    return [[e[0], e[1], e[2]] for e in es]


def _items(s: In) -> list[str]:
    return [f"{s['prefix']}{i}" for i in range(s["count"])]


def _repeat(count: int, f: Callable[[], Any]) -> list[Any]:
    return [f() for _ in range(count)]


def _canon_number(i: In) -> float:
    return float(struct.unpack(">d", bytes.fromhex(i["bits"]))[0])


def _stable_perm(sorter: Callable[[list[tuple[Any, int]]], list[tuple[Any, int]]]) -> Fn:
    return lambda i: [p[1] for p in sorter([(k, idx) for idx, k in enumerate(i["keys"])])]


def _ternary(i: In) -> float:
    c = float(i["c"])
    maximize = i.get("maximize")

    def f(x: float) -> float:
        return -((x - c) * (x - c)) if maximize else (x - c) * (x - c)

    kw: dict[str, Any] = {}
    if maximize is not None:
        kw["maximize"] = bool(maximize)
    if i.get("epsilon") is not None:
        kw["epsilon"] = float(i["epsilon"])
    return search.ternary_search(_f(i["lo"]), _f(i["hi"]), f, **kw)


def _aho(i: In) -> list[list[Any]]:
    ac = st.AhoCorasick()
    for p in i["patterns"]:
        ac.add_pattern(p)
    return [[m.pattern, m.index] for m in ac.search(i["text"])]


def _bloom(i: In) -> dict[str, Any]:
    f = ds.BloomFilter.with_params(i["m"], i["k"])
    for x in i["add"]:
        f.add(x)
    has = [f.has(q) for q in i["query"]]
    return {"bits": f.to_bytes().hex(), "set_bits": f.set_bits, "has": has}


def _hll(i: In) -> dict[str, Any]:
    h = ds.HyperLogLog(i["b"])
    for x in _items(i["items"]):
        h.add(x)
    return {"estimate": h.count(), "registers_fnv1a64": hex64(hs.fnv1a64(h.registers()))}


def _hll_merge(i: In) -> int:
    a = ds.HyperLogLog(i["b"])
    b = ds.HyperLogLog(i["b"])
    for x in _items(i["a"]):
        a.add(x)
    for x in _items(i["b_items"]):
        b.add(x)
    return a.merge(b).count()


def _dsu(i: In) -> list[Any]:
    d = ds.DisjointSet(i["n"])
    out: list[Any] = []
    for op in i["ops"]:
        if op[0] == "union":
            out.append(d.union(op[1], op[2]))
        elif op[0] == "find":
            out.append(d.find(op[1]))
        elif op[0] == "connected":
            out.append(d.connected(op[1], op[2]))
        else:
            out.append(d.count)
    return out


def _fenwick(i: In) -> list[Any]:
    ft = ds.FenwickTree(i["init"])
    out: list[Any] = []
    for op in i["ops"]:
        if op[0] == "update":
            ft.update(op[1], op[2])
            out.append(None)
        elif op[0] == "prefix":
            out.append(ft.prefix_sum(op[1]))
        elif op[0] == "range":
            out.append(ft.range_sum(op[1], op[2]))
        else:
            out.append(ft.point_query(op[1]))
    return out


def _segtree(i: In) -> list[Any]:
    t = ds.SegmentTree(i["init"])
    out: list[Any] = []
    for op in i["ops"]:
        if op[0] == "update":
            t.update(op[1], op[2], op[3])
            out.append(None)
        else:
            out.append(t.query(op[1], op[2]))
    return out


def _a_star(i: In) -> dict[str, Any]:
    h = i.get("heuristic")
    heur = (lambda v: float(h[v])) if h is not None else None
    r = gr.a_star(_graph(i["graph"]), i["source"], i["target"], heur)
    return {"path": r.path, "cost": r.cost}


def _bellman(i: In) -> dict[str, Any]:
    r = gr.bellman_ford(_graph(i["graph"]), i["source"])
    return {"distances": r.distances, "has_negative_cycle": r.has_negative_cycle}


def _pagerank(i: In) -> list[float]:
    kw: dict[str, Any] = {}
    if i.get("damping") is not None:
        kw["damping"] = float(i["damping"])
    if i.get("iterations") is not None:
        kw["iterations"] = i["iterations"]
    return gr.pagerank(_graph(i["graph"]), **kw)


def _kmeans(i: In) -> dict[str, Any]:
    r = ml.kmeans(
        [_fv(p) for p in i["points"]],
        i["k"],
        seed=big(i["seed"]),
        max_iter=i["max_iter"],
        tol=float(i["tol"]),
    )
    return {
        "centroids": r["centroids"],
        "labels": r["labels"],
        "iterations": r["iterations"],
        "inertia": r["inertia"],
    }


def _huffman(i: In) -> dict[str, Any]:
    r = cmp.huffman_encode(bytes.fromhex(i["data"]))
    return {
        "encoded": r.encoded.hex(),
        "bit_length": r.bit_length,
        "codes": [[b, c] for b, c in sorted(r.codes.items())],
    }


def _hx(i: In, key: str = "data") -> bytes:
    return bytes.fromhex(i[key])


DISPATCH: dict[str, Fn] = {
    # §3 canonical number formatting
    "canon.number": _canon_number,
    # §5 PRNG
    "rng.splitmix64": lambda i: _repeat(
        i["count"], (lambda r: lambda: hex64(r.next()))(rng.SplitMix64(big(i["seed"])))
    ),
    "rng.xoshiro256pp": lambda i: _repeat(
        i["count"], (lambda r: lambda: hex64(r.next()))(rng.Xoshiro256pp(big(i["seed"])))
    ),
    "rng.xoshiro256pp_float": lambda i: _repeat(
        i["count"], rng.Xoshiro256pp(big(i["seed"])).next_float
    ),
    "rng.xoshiro256pp_int": lambda i: _repeat(
        i["count"], (lambda r: lambda: r.next_int(i["n"]))(rng.Xoshiro256pp(big(i["seed"])))
    ),
    "rng.pcg32": lambda i: _repeat(i["count"], rng.Pcg32(big(i["state"]), big(i["seq"])).next),
    "rng.pcg32_bounded": lambda i: _repeat(
        i["count"],
        (lambda r: lambda: r.next_bounded(i["bound"]))(rng.Pcg32(big(i["state"]), big(i["seq"]))),
    ),
    # §6 sort
    "sort.quicksort": lambda i: sort.quicksort(i["input"]),
    "sort.timsort": lambda i: sort.timsort(i["input"]),
    "sort.mergesort": lambda i: sort.mergesort(i["input"]),
    "sort.heapsort": lambda i: sort.heapsort(i["input"]),
    "sort.radix_lsd": lambda i: sort.radix_sort_lsd(i["input"]),
    "sort.counting": lambda i: sort.counting_sort(i["input"]),
    "sort.timsort_stable": _stable_perm(lambda a: sort.timsort(a, key=lambda p: p[0])),
    "sort.mergesort_stable": _stable_perm(lambda a: sort.mergesort(a, key=lambda p: p[0])),
    # §7 search
    "search.binary": lambda i: search.binary_search(i["arr"], i["target"]),
    "search.lower_bound": lambda i: search.lower_bound(i["arr"], i["target"]),
    "search.upper_bound": lambda i: search.upper_bound(i["arr"], i["target"]),
    "search.interpolation": lambda i: search.interpolation_search(i["arr"], i["target"]),
    "search.exponential": lambda i: search.exponential_search(i["arr"], i["target"]),
    "search.jump": lambda i: search.jump_search(i["arr"], i["target"]),
    "search.fibonacci": lambda i: search.fibonacci_search(i["arr"], i["target"]),
    "search.linear": lambda i: search.linear_search(i["arr"], i["target"]),
    "search.ternary": _ternary,
    # §10 math
    "math.gcd": lambda i: int_out(mt.gcd(big(i["a"]), big(i["b"]))),
    "math.lcm": lambda i: int_out(mt.lcm(big(i["a"]), big(i["b"]))),
    "math.extended_gcd": lambda i: (
        lambda r: {"g": int_out(r.g), "x": int_out(r.x), "y": int_out(r.y)}
    )(mt.extended_gcd(big(i["a"]), big(i["b"]))),
    "math.mod_inverse": lambda i: int_out(mt.mod_inverse(big(i["a"]), big(i["m"]))),
    "math.mod_pow": lambda i: int_out(mt.mod_pow(big(i["base"]), big(i["exp"]), big(i["mod"]))),
    "math.crt": lambda i: int_out(mt.crt([big(x) for x in i["r"]], [big(x) for x in i["m"]])),
    "math.is_prime": lambda i: mt.is_prime(big(i["n"])),
    "math.next_prime": lambda i: int_out(mt.next_prime(big(i["n"]))),
    "math.sieve": lambda i: mt.sieve(i["n"]),
    "math.segmented_sieve": lambda i: mt.segmented_sieve(i["lo"], i["hi"]),
    "math.factorize": lambda i: [int_out(x) for x in mt.factorize(big(i["n"]))],
    "math.karatsuba": lambda i: int_out(mt.karatsuba(big(i["x"]), big(i["y"]))),
    "math.ntt": lambda i: [int_out(x) for x in mt.ntt([big(x) for x in i["a"]])],
    "math.poly_mul_ntt": lambda i: [
        int_out(x) for x in mt.poly_mul_ntt([big(x) for x in i["a"]], [big(x) for x in i["b"]])
    ],
    "math.mat_mul": lambda i: mt.mat_mul([_fv(r) for r in i["a"]], [_fv(r) for r in i["b"]]),
    "math.strassen": lambda i: mt.strassen_mul([_fv(r) for r in i["a"]], [_fv(r) for r in i["b"]]),
    # §11 string
    "string.kmp": lambda i: st.kmp_search(i["text"], i["pattern"]),
    "string.levenshtein": lambda i: st.levenshtein(i["a"], i["b"]),
    "string.damerau_levenshtein": lambda i: st.damerau_levenshtein(i["a"], i["b"]),
    "string.jaro": lambda i: st.jaro(i["a"], i["b"]),
    "string.jaro_winkler": lambda i: st.jaro_winkler(
        i["a"], i["b"], float(i["p"]) if i.get("p") is not None else 0.1
    ),
    "string.aho_corasick": _aho,
    "string.polynomial_hash": lambda i: st.polynomial_hash(
        i["s"],
        i["base"] if i.get("base") is not None else 31,
        i["mod"] if i.get("mod") is not None else 1_000_000_007,
    ),
    # §12 non-cryptographic hashes
    "hash.fnv1a32": lambda i: hs.fnv1a32(_hx(i)),
    "hash.fnv1a64": lambda i: hex64(hs.fnv1a64(_hx(i))),
    "hash.murmur3_32": lambda i: hs.murmur3_32(_hx(i), i["seed"]),
    "hash.xxhash32": lambda i: hs.xxhash32(_hx(i), i["seed"]),
    "hash.xxhash64": lambda i: hex64(hs.xxhash64(_hx(i), big(i["seed"]))),
    "hash.siphash24": lambda i: hex64(hs.siphash24(_hx(i, "key"), _hx(i))),
    # §8 data structures
    "datastructure.bloom": _bloom,
    "datastructure.hyperloglog": _hll,
    "datastructure.hyperloglog_merge": _hll_merge,
    "datastructure.disjoint_set": _dsu,
    "datastructure.fenwick": _fenwick,
    "datastructure.segment_tree": _segtree,
    # §9 graph
    "graph.bfs": lambda i: gr.bfs(_graph(i["graph"]), i["source"]),
    "graph.dfs": lambda i: gr.dfs(_graph(i["graph"]), i["source"]),
    "graph.dijkstra": lambda i: gr.dijkstra(_graph(i["graph"]), i["source"]),
    "graph.bellman_ford": _bellman,
    "graph.floyd_warshall": lambda i: gr.floyd_warshall(_graph(i["graph"])),
    "graph.topological_sort": lambda i: gr.topological_sort(_graph(i["graph"])),
    "graph.kruskal": lambda i: _edges_out(gr.kruskal(_graph(i["graph"]))),
    "graph.prim": lambda i: _edges_out(gr.prim(_graph(i["graph"]))),
    "graph.tarjan_scc": lambda i: gr.tarjan_scc(_graph(i["graph"])),
    "graph.dinic": lambda i: gr.dinic(_graph(i["graph"]), i["source"], i["sink"]),
    "graph.bipartite_matching": lambda i: (
        gr.bipartite_matching(i["n_left"], i["n_right"], i["pairs"]).size
    ),
    "graph.a_star": _a_star,
    "graph.pagerank": _pagerank,
    # §13.1 ml
    "ml.dot": lambda i: ml.dot_product(_fv(i["a"]), _fv(i["b"])),
    "ml.l2_norm": lambda i: ml.l2_norm(_fv(i["v"])),
    "ml.cosine": lambda i: ml.cosine_similarity(_fv(i["a"]), _fv(i["b"])),
    "ml.l2_distance": lambda i: ml.l2_distance(_fv(i["a"]), _fv(i["b"])),
    "ml.l1_distance": lambda i: ml.l1_distance(_fv(i["a"]), _fv(i["b"])),
    "ml.normalize": lambda i: ml.normalize(_fv(i["v"])),
    "ml.jaccard": lambda i: ml.jaccard_similarity(i["a"], i["b"]),
    "ml.pearson": lambda i: ml.pearson(_fv(i["a"]), _fv(i["b"])),
    "ml.batch_cosine": lambda i: [
        [r.index, r.score]
        for r in ml.batch_cosine(_fv(i["query"]), [_fv(c) for c in i["candidates"]])
    ],
    "ml.kmeans": _kmeans,
    # §13.2 geometry
    "geometry.cross": lambda i: geo.cross(_pt(i["o"]), _pt(i["a"]), _pt(i["b"])),
    "geometry.convex_hull": lambda i: [list(p) for p in geo.convex_hull(_pts(i["points"]))],
    "geometry.closest_pair": lambda i: geo.closest_pair(_pts(i["points"]))[2],
    "geometry.point_in_polygon": lambda i: geo.point_in_polygon(
        _pt(i["point"]), _pts(i["polygon"])
    ),
    "geometry.bezier": lambda i: list(geo.bezier(_pts(i["points"]), float(i["t"]))),
    # §13.3 compression
    "compression.rle_encode": lambda i: cmp.rle_encode(_hx(i)).hex(),
    "compression.rle_decode": lambda i: cmp.rle_decode(_hx(i)).hex(),
    "compression.lz77_compress": lambda i: cmp.lz77_compress(
        _hx(i), i["window"] if i.get("window") is not None else 255
    ).hex(),
    "compression.lz77_decompress": lambda i: cmp.lz77_decompress(_hx(i)).hex(),
    "compression.huffman": _huffman,
}


def run_case(group: str, inp: Any) -> Any:
    """Run one case; an :class:`AlgoError` becomes ``{"error": code}``. Anything else is a bug."""
    fn = DISPATCH.get(group)
    if fn is None:
        raise KeyError(f"unknown vector group {group}")
    try:
        return fn(inp)
    except AlgoError as e:
        return {"error": e.code}


# ── §4.3 runner ───────────────────────────────────────────────────────────────────────────────


@dataclass
class RunReport:
    """Runner output lines plus failures (mismatches) and unknown groups."""

    lines: list[str] = field(default_factory=list)
    failures: list[str] = field(default_factory=list)
    missing: list[str] = field(default_factory=list)
    cases: int = 0

    @property
    def ok(self) -> bool:
        """``True`` when every group is known and every case matches."""
        return not self.failures and not self.missing


def run_vectors(path: str | Path) -> RunReport:
    """Run every case of the vector file at ``path``."""
    doc = loads(Path(path).read_text(encoding="utf-8"))
    if doc.get("format") != "lombokalgoritma-vectors" or doc.get("version") != 1:
        raise ValueError("unsupported vector file")
    rep = RunReport()
    groups: dict[str, list[dict[str, Any]]] = doc["groups"]
    for group in sorted(groups):
        if group not in DISPATCH:
            rep.missing.append(group)
            continue
        for c in groups[group]:
            rep.cases += 1
            got = canonical(run_case(group, c["input"]))
            rep.lines.append(f"{group}\t{c['id']}\t{got}")
            want = canonical(c["expected"])
            if got != want:
                rep.failures.append(f"{group}/{c['id']}: expected {want}, got {got}")
    return rep


def main(argv: Sequence[str] | None = None) -> int:
    """CLI entry point: print runner lines to stdout, diagnostics to stderr."""
    args = list(sys.argv[1:] if argv is None else argv)
    if len(args) != 1:
        sys.stderr.write("usage: python -m lombokalgoritma._vectors <vectors.json>\n")
        return 2
    rep = run_vectors(args[0])
    sys.stdout.buffer.write("".join(line + "\n" for line in rep.lines).encode("utf-8"))
    sys.stdout.flush()
    for g in rep.missing:
        sys.stderr.write(f"unknown group: {g}\n")
    for f in rep.failures:
        sys.stderr.write(f"FAIL {f}\n")
    sys.stderr.write(
        f"{rep.cases} cases, {len(rep.failures)} failures, {len(rep.missing)} unknown groups\n"
    )
    return 0 if rep.ok else 1


if __name__ == "__main__":
    raise SystemExit(main())

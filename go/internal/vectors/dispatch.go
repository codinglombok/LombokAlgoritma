// LombokAlgoritma — vector dispatch: group name + input → output value (SPEC §4.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//
// Mirrors typescript/tests/vectors/dispatch.ts exactly (same groups, same input field names).
// An input documented as `int` is a JSON number or a decimal string; `u64` fields are decimal
// strings; byte strings are lowercase hex.

package vectors

import (
	"encoding/binary"
	"encoding/hex"
	"math"
	"sort"

	la "github.com/codinglombok/lombokalgoritma/go"
)

type fn func(in obj) (any, error)

func repeat[T any](count int, f func() T) []T {
	out := make([]T, count)
	for i := range out {
		out[i] = f()
	}
	return out
}

func repeatErr[T any](count int, f func() (T, error)) ([]T, error) {
	out := make([]T, count)
	for i := range out {
		v, err := f()
		if err != nil {
			return nil, err
		}
		out[i] = v
	}
	return out, nil
}

// wrap adapts a (T, error) result to (any, error).
func wrap[T any](v T, err error) (any, error) {
	if err != nil {
		return nil, err
	}
	return v, nil
}

func sorter(f func([]int64) []int64) fn {
	return func(i obj) (any, error) { return f(i.i64s("input")), nil }
}

// stablePerm sorts (key, index) pairs by key only and returns the index order.
func stablePerm(f func([][2]int64, func(a, b [2]int64) int) [][2]int64) fn {
	return func(i obj) (any, error) {
		keys := i.i64s("keys")
		pairs := make([][2]int64, len(keys))
		for idx, k := range keys {
			pairs[idx] = [2]int64{k, int64(idx)}
		}
		sorted := f(pairs, func(a, b [2]int64) int {
			switch {
			case a[0] < b[0]:
				return -1
			case a[0] > b[0]:
				return 1
			}
			return 0
		})
		out := make([]int64, len(sorted))
		for idx, p := range sorted {
			out[idx] = p[1]
		}
		return out, nil
	}
}

func search(f func([]int64, int64) int) fn {
	return func(i obj) (any, error) { return f(i.i64s("arr"), i.i64("target")), nil }
}

func pointOut(p la.Point2D) []float64 { return []float64{p.X, p.Y} }

func edgesOut(es []la.Edge, err error) (any, error) {
	if err != nil {
		return nil, err
	}
	out := make([][]any, len(es))
	for i, e := range es {
		out[i] = []any{e.From, e.To, e.Weight}
	}
	return out, nil
}

// Dispatch maps every vector group to its implementation.
var Dispatch = map[string]fn{
	// ── §3 canonical number formatting ──────────────────────────────────────────────────
	"canon.number": func(i obj) (any, error) {
		b := i.bytes("bits")
		if len(b) != 8 {
			bad("bits must be 8 bytes")
		}
		return math.Float64frombits(binary.BigEndian.Uint64(b)), nil
	},

	// ── §5 PRNG ─────────────────────────────────────────────────────────────────────────
	"rng.splitmix64": func(i obj) (any, error) {
		r := la.NewSplitMix64(i.u64("seed"))
		return repeat(i.int("count"), func() string { return hex64(r.Next()) }), nil
	},
	"rng.xoshiro256pp": func(i obj) (any, error) {
		r := la.NewXoshiro256pp(i.u64("seed"))
		return repeat(i.int("count"), func() string { return hex64(r.Next()) }), nil
	},
	"rng.xoshiro256pp_float": func(i obj) (any, error) {
		r := la.NewXoshiro256pp(i.u64("seed"))
		return repeat(i.int("count"), r.NextFloat), nil
	},
	"rng.xoshiro256pp_int": func(i obj) (any, error) {
		r := la.NewXoshiro256pp(i.u64("seed"))
		n := i.i64("n")
		return wrap(repeatErr(i.int("count"), func() (int64, error) { return r.NextInt(n) }))
	},
	"rng.pcg32": func(i obj) (any, error) {
		r := la.NewPcg32(i.u64("state"), i.u64("seq"))
		return repeat(i.int("count"), r.Next), nil
	},
	"rng.pcg32_bounded": func(i obj) (any, error) {
		r := la.NewPcg32(i.u64("state"), i.u64("seq"))
		bound := i.i64("bound")
		if bound < 0 || bound > math.MaxUint32 {
			return nil, &la.Error{Code: la.CodeOutOfRange, Message: "bound outside [1, 2^32)"}
		}
		return wrap(repeatErr(i.int("count"), func() (uint32, error) { return r.NextBounded(uint32(bound)) }))
	},

	// ── §6 sort ─────────────────────────────────────────────────────────────────────────
	"sort.quicksort": sorter(la.Quicksort[int64]),
	"sort.timsort":   sorter(la.Timsort[int64]),
	"sort.mergesort": sorter(la.Mergesort[int64]),
	"sort.heapsort":  sorter(la.Heapsort[int64]),
	"sort.radix_lsd": sorter(la.RadixSortLSD),
	"sort.counting": func(i obj) (any, error) {
		return wrap(la.CountingSort(i.ints("input")))
	},
	"sort.timsort_stable":   stablePerm(la.TimsortFunc[[2]int64]),
	"sort.mergesort_stable": stablePerm(la.MergesortFunc[[2]int64]),

	// ── §7 search ───────────────────────────────────────────────────────────────────────
	"search.binary":        search(la.BinarySearch[int64]),
	"search.lower_bound":   search(la.LowerBound[int64]),
	"search.upper_bound":   search(la.UpperBound[int64]),
	"search.interpolation": search(la.InterpolationSearch[int64]),
	"search.exponential":   search(la.ExponentialSearch[int64]),
	"search.jump":          search(la.JumpSearch[int64]),
	"search.fibonacci":     search(la.FibonacciSearch[int64]),
	"search.linear":        search(la.LinearSearch[int64]),
	"search.ternary": func(i obj) (any, error) {
		c := i.float("c")
		maximize := i.boolean("maximize")
		f := func(x float64) float64 { return float64((x - c) * (x - c)) }
		if maximize {
			f = func(x float64) float64 { return -float64((x - c) * (x - c)) }
		}
		return la.TernarySearch(i.float("lo"), i.float("hi"), f, maximize, i.float("epsilon")), nil
	},

	// ── §10 math ────────────────────────────────────────────────────────────────────────
	"math.gcd": func(i obj) (any, error) { return la.GCD(i.i64("a"), i.i64("b")), nil },
	"math.lcm": func(i obj) (any, error) { return wrap(la.LCM(i.i64("a"), i.i64("b"))) },
	"math.extended_gcd": func(i obj) (any, error) {
		g, x, y := la.ExtendedGCD(i.i64("a"), i.i64("b"))
		return map[string]any{"g": g, "x": x, "y": y}, nil
	},
	"math.mod_inverse": func(i obj) (any, error) { return wrap(la.ModInverse(i.i64("a"), i.i64("m"))) },
	"math.mod_pow": func(i obj) (any, error) {
		return wrap(la.ModPow(i.i64("base"), i.i64("exp"), i.i64("mod")))
	},
	"math.crt":        func(i obj) (any, error) { return wrap(la.CRT(i.i64s("r"), i.i64s("m"))) },
	"math.is_prime":   func(i obj) (any, error) { return la.IsPrime(i.i64("n")), nil },
	"math.next_prime": func(i obj) (any, error) { return wrap(la.NextPrime(i.i64("n"))) },
	"math.sieve":      func(i obj) (any, error) { return la.Sieve(i.int("n")), nil },
	"math.segmented_sieve": func(i obj) (any, error) {
		return la.SegmentedSieve(i.int("lo"), i.int("hi")), nil
	},
	"math.factorize": func(i obj) (any, error) { return la.Factorize(i.i64("n")), nil },
	"math.karatsuba": func(i obj) (any, error) { return la.Karatsuba(i.big("x"), i.big("y")), nil },
	"math.ntt":       func(i obj) (any, error) { return wrap(la.NTT(i.i64s("a"))) },
	"math.poly_mul_ntt": func(i obj) (any, error) {
		return wrap(la.PolyMulNTT(i.i64s("a"), i.i64s("b")))
	},
	"math.mat_mul":  func(i obj) (any, error) { return wrap(la.MatMul(i.matrix("a"), i.matrix("b"))) },
	"math.strassen": func(i obj) (any, error) { return wrap(la.Strassen(i.matrix("a"), i.matrix("b"))) },

	// ── §11 string ──────────────────────────────────────────────────────────────────────
	"string.kmp":         func(i obj) (any, error) { return la.KMPSearch(i.str("text"), i.str("pattern")), nil },
	"string.levenshtein": func(i obj) (any, error) { return la.Levenshtein(i.str("a"), i.str("b")), nil },
	"string.damerau_levenshtein": func(i obj) (any, error) {
		return la.DamerauLevenshtein(i.str("a"), i.str("b")), nil
	},
	"string.jaro": func(i obj) (any, error) { return la.Jaro(i.str("a"), i.str("b")), nil },
	"string.jaro_winkler": func(i obj) (any, error) {
		p := la.DefaultJaroWinklerPrefixScale
		if i.has("p") {
			p = i.float("p")
		}
		return la.JaroWinkler(i.str("a"), i.str("b"), p), nil
	},
	"string.aho_corasick": func(i obj) (any, error) {
		ac := la.NewAhoCorasick()
		for _, p := range i.strs("patterns") {
			ac.AddPattern(p)
		}
		ms := ac.Search(i.str("text"))
		out := make([][]any, len(ms))
		for k, m := range ms {
			out[k] = []any{m.Pattern, m.Index}
		}
		return out, nil
	},
	"string.polynomial_hash": func(i obj) (any, error) {
		base, mod := la.DefaultPolyHashBase, la.DefaultPolyHashMod
		if i.has("base") {
			base = i.i64("base")
		}
		if i.has("mod") {
			mod = i.i64("mod")
		}
		return wrap(la.PolynomialHash(i.str("s"), base, mod))
	},

	// ── §12 non-cryptographic hashes (input bytes as hex) ─────────────────────────────
	"hash.fnv1a32":    func(i obj) (any, error) { return la.FNV1a32(i.bytes("data")), nil },
	"hash.fnv1a64":    func(i obj) (any, error) { return hex64(la.FNV1a64(i.bytes("data"))), nil },
	"hash.murmur3_32": func(i obj) (any, error) { return la.MurmurHash3(i.bytes("data"), u32(i, "seed")), nil },
	"hash.xxhash32":   func(i obj) (any, error) { return la.XXHash32(i.bytes("data"), u32(i, "seed")), nil },
	"hash.xxhash64": func(i obj) (any, error) {
		return hex64(la.XXHash64(i.bytes("data"), i.u64("seed"))), nil
	},
	"hash.siphash24": func(i obj) (any, error) {
		h, err := la.SipHash24(i.bytes("key"), i.bytes("data"))
		if err != nil {
			return nil, err
		}
		return hex64(h), nil
	},

	// ── §8 data structures ──────────────────────────────────────────────────────────────
	"datastructure.bloom": func(i obj) (any, error) {
		f, err := la.NewBloomFilterWithParams(i.i64("m"), i.int("k"))
		if err != nil {
			return nil, err
		}
		for _, x := range i.strs("add") {
			f.Add(x)
		}
		has := mapArr(i.arr("query"), func(v any) bool { return f.Has(asStr(v)) })
		return map[string]any{"bits": hex.EncodeToString(f.Bytes()), "set_bits": f.SetBits(), "has": has}, nil
	},
	"datastructure.hyperloglog": func(i obj) (any, error) {
		h := la.NewHyperLogLog(i.int("b"))
		for _, x := range i.items("items") {
			h.Add(x)
		}
		return map[string]any{"estimate": h.Count(), "registers_fnv1a64": hex64(la.FNV1a64(h.Registers()))}, nil
	},
	"datastructure.hyperloglog_merge": func(i obj) (any, error) {
		a := la.NewHyperLogLog(i.int("b"))
		b := la.NewHyperLogLog(i.int("b"))
		for _, x := range i.items("a") {
			a.Add(x)
		}
		for _, x := range i.items("b_items") {
			b.Add(x)
		}
		m, err := a.Merge(b)
		if err != nil {
			return nil, err
		}
		return m.Count(), nil
	},
	"datastructure.disjoint_set": func(i obj) (any, error) {
		ds := la.NewDisjointSet(i.int("n"))
		return mapArr(i.arr("ops"), func(v any) any {
			op := asArr(v)
			arg := func(k int) int { return int(asInt64(op[k])) }
			switch asStr(op[0]) {
			case "union":
				return ds.Union(arg(1), arg(2))
			case "find":
				return ds.Find(arg(1))
			case "connected":
				return ds.Connected(arg(1), arg(2))
			}
			return ds.Count()
		}), nil
	},
	"datastructure.fenwick": func(i obj) (any, error) {
		ft := la.NewFenwickTree(i.i64s("init"))
		return mapArr(i.arr("ops"), func(v any) any {
			op := asArr(v)
			a := int(asInt64(op[1]))
			switch asStr(op[0]) {
			case "update":
				ft.Update(a, asInt64(op[2]))
				return nil
			case "prefix":
				return ft.PrefixSum(a)
			case "range":
				return ft.RangeSum(a, int(asInt64(op[2])))
			}
			return ft.PointQuery(a)
		}), nil
	},
	"datastructure.segment_tree": func(i obj) (any, error) {
		st := la.NewSegmentTree(i.i64s("init"))
		return mapArr(i.arr("ops"), func(v any) any {
			op := asArr(v)
			l, r := int(asInt64(op[1])), int(asInt64(op[2]))
			if asStr(op[0]) == "update" {
				st.Update(l, r, asInt64(op[3]))
				return nil
			}
			return st.Query(l, r)
		}), nil
	},

	// ── §9 graph (edges as [from, to, weight]) ──────────────────────────────────────────
	"graph.bfs":      func(i obj) (any, error) { return wrap(la.BFS(i.graph(), i.int("source"))) },
	"graph.dfs":      func(i obj) (any, error) { return wrap(la.DFS(i.graph(), i.int("source"))) },
	"graph.dijkstra": func(i obj) (any, error) { return wrap(la.Dijkstra(i.graph(), i.int("source"))) },
	"graph.bellman_ford": func(i obj) (any, error) {
		r, err := la.BellmanFord(i.graph(), i.int("source"))
		if err != nil {
			return nil, err
		}
		return map[string]any{"distances": r.Distances, "has_negative_cycle": r.HasNegativeCycle}, nil
	},
	"graph.floyd_warshall":   func(i obj) (any, error) { return wrap(la.FloydWarshall(i.graph())) },
	"graph.topological_sort": func(i obj) (any, error) { return wrap(la.TopologicalSort(i.graph())) },
	"graph.kruskal":          func(i obj) (any, error) { return edgesOut(la.Kruskal(i.graph())) },
	"graph.prim":             func(i obj) (any, error) { return edgesOut(la.Prim(i.graph())) },
	"graph.tarjan_scc":       func(i obj) (any, error) { return wrap(la.TarjanSCC(i.graph())) },
	"graph.dinic": func(i obj) (any, error) {
		return wrap(la.Dinic(i.graph(), i.int("source"), i.int("sink")))
	},
	"graph.bipartite_matching": func(i obj) (any, error) {
		pairs := mapArr(i.arr("pairs"), func(v any) [2]int {
			p := asArr(v)
			if len(p) != 2 {
				bad("pair must be [left, right]")
			}
			return [2]int{int(asInt64(p[0])), int(asInt64(p[1]))}
		})
		r, err := la.BipartiteMatching(i.int("n_left"), i.int("n_right"), pairs)
		if err != nil {
			return nil, err
		}
		return r.Size, nil
	},
	"graph.a_star": func(i obj) (any, error) {
		var h func(int) float64
		if i.has("heuristic") {
			hv := i.floats("heuristic")
			h = func(v int) float64 { return hv[v] }
		}
		r, err := la.AStar(i.graph(), i.int("source"), i.int("target"), h)
		if err != nil {
			return nil, err
		}
		return map[string]any{"path": r.Path, "cost": r.Cost}, nil
	},
	"graph.pagerank": func(i obj) (any, error) {
		return wrap(la.PageRank(i.graph(), i.float("damping"), i.int("iterations")))
	},

	// ── §13.1 ml ────────────────────────────────────────────────────────────────────────
	"ml.dot":         func(i obj) (any, error) { return wrap(la.DotProduct(i.floats("a"), i.floats("b"))) },
	"ml.l2_norm":     func(i obj) (any, error) { return la.L2Norm(i.floats("v")), nil },
	"ml.cosine":      func(i obj) (any, error) { return wrap(la.CosineSimilarity(i.floats("a"), i.floats("b"))) },
	"ml.l2_distance": func(i obj) (any, error) { return wrap(la.L2Distance(i.floats("a"), i.floats("b"))) },
	"ml.l1_distance": func(i obj) (any, error) { return wrap(la.L1Distance(i.floats("a"), i.floats("b"))) },
	"ml.normalize":   func(i obj) (any, error) { return la.Normalize(i.floats("v")), nil },
	"ml.jaccard":     func(i obj) (any, error) { return la.JaccardSimilarity(i.strs("a"), i.strs("b")), nil },
	"ml.pearson":     func(i obj) (any, error) { return wrap(la.Pearson(i.floats("a"), i.floats("b"))) },
	"ml.batch_cosine": func(i obj) (any, error) {
		r, err := la.BatchCosine(i.floats("query"), i.matrix("candidates"))
		if err != nil {
			return nil, err
		}
		out := make([][]any, len(r))
		for k, s := range r {
			out[k] = []any{s.Index, s.Score}
		}
		return out, nil
	},
	"ml.kmeans": func(i obj) (any, error) {
		r, err := la.KMeans(i.matrix("points"), i.int("k"), i.int("max_iter"), i.float("tol"), i.u64("seed"))
		if err != nil {
			return nil, err
		}
		return map[string]any{"centroids": r.Centroids, "labels": r.Labels, "iterations": r.Iterations, "inertia": r.Inertia}, nil
	},

	// ── §13.2 geometry (points as [x, y]) ─────────────────────────────────────────────
	"geometry.cross": func(i obj) (any, error) { return la.Cross(i.point("o"), i.point("a"), i.point("b")), nil },
	"geometry.convex_hull": func(i obj) (any, error) {
		hull := la.ConvexHull(i.points("points"))
		out := make([][]float64, len(hull))
		for k, p := range hull {
			out[k] = pointOut(p)
		}
		return out, nil
	},
	"geometry.closest_pair": func(i obj) (any, error) {
		_, _, d, err := la.ClosestPair(i.points("points"))
		return wrap(d, err)
	},
	"geometry.point_in_polygon": func(i obj) (any, error) {
		return la.PointInPolygon(i.point("point"), i.points("polygon")), nil
	},
	"geometry.bezier": func(i obj) (any, error) {
		p, err := la.Bezier(i.points("points"), i.float("t"))
		if err != nil {
			return nil, err
		}
		return pointOut(p), nil
	},

	// ── §13.3 compression (bytes as hex) ──────────────────────────────────────────────
	"compression.rle_encode": func(i obj) (any, error) { return hex.EncodeToString(la.RLEEncode(i.bytes("data"))), nil },
	"compression.rle_decode": func(i obj) (any, error) { return hexOut(la.RLEDecode(i.bytes("data"))) },
	"compression.lz77_compress": func(i obj) (any, error) {
		w := la.DefaultLZ77Window
		if i.has("window") {
			w = i.int("window")
		}
		return hexOut(la.LZ77Compress(i.bytes("data"), w))
	},
	"compression.lz77_decompress": func(i obj) (any, error) { return hexOut(la.LZ77Decompress(i.bytes("data"))) },
	"compression.huffman": func(i obj) (any, error) {
		r := la.HuffmanEncode(i.bytes("data"))
		syms := make([]int, 0, len(r.Codes))
		for s := range r.Codes {
			syms = append(syms, int(s))
		}
		sort.Ints(syms)
		codes := make([][]any, len(syms))
		for k, s := range syms {
			codes[k] = []any{s, r.Codes[byte(s)]}
		}
		return map[string]any{"encoded": hex.EncodeToString(r.Encoded), "bit_length": r.BitLength, "codes": codes}, nil
	},
}

func u32(i obj, k string) uint32 {
	v := i.u64(k)
	if v > math.MaxUint32 {
		bad("field %q exceeds u32", k)
	}
	return uint32(v)
}

func hexOut(b []byte, err error) (any, error) {
	if err != nil {
		return nil, err
	}
	return hex.EncodeToString(b), nil
}

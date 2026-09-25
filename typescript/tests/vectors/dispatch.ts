import {
  huffmanEncode,
  lz77Compress,
  lz77Decompress,
  rleDecode,
  rleEncode,
} from '../../src/compression/index.js';
// LombokAlgoritma — vector dispatch: group name + input → output value (SPEC §4)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//
// Every port implements exactly this table. An input field documented as `int` is a JSON number or
// a decimal string; `u64` fields are decimal strings; byte strings are lowercase hex.
import { AlgoError } from '../../src/core/errors.js';
import { Pcg32, SplitMix64, Xoshiro256pp } from '../../src/core/rng.js';
import {
  BloomFilter,
  DisjointSet,
  FenwickTree,
  HyperLogLog,
  SegmentTree,
} from '../../src/datastructure/index.js';
import {
  type Point2D,
  bezier,
  closestPair,
  convexHull,
  cross,
  pointInPolygon,
} from '../../src/geometry/index.js';
import {
  type Edge,
  type Graph,
  aStar,
  bellmanFord,
  bfs,
  bipartiteMatching,
  dfs,
  dijkstra,
  dinic,
  floydWarshall,
  kruskal,
  pageRank,
  prim,
  tarjanScc,
  topologicalSort,
} from '../../src/graph/index.js';
import {
  crt,
  extendedGcd,
  factorize,
  gcd,
  isPrime,
  karatsuba,
  lcm,
  matMul,
  modInverse,
  modPow,
  nextPrime,
  ntt,
  polyMulNTT,
  segmentedSieve,
  sieve,
  strassenMul,
} from '../../src/math/index.js';
import {
  batchCosine,
  cosineSimilarity,
  dotProduct,
  jaccardSimilarity,
  kmeans,
  l1Distance,
  l2Distance,
  l2Norm,
  normalize,
  pearson,
} from '../../src/ml/index.js';
import {
  binarySearch,
  exponentialSearch,
  fibonacciSearch,
  interpolationSearch,
  jumpSearch,
  linearSearch,
  lowerBound,
  ternarySearch,
  upperBound,
} from '../../src/search/index.js';
import {
  countingSort,
  heapsort,
  mergesort,
  quicksort,
  radixSortLSD,
  timsort,
} from '../../src/sort/index.js';
import {
  AhoCorasick,
  damerauLevenshtein,
  fnv1a32,
  fnv1a64,
  jaro,
  jaroWinkler,
  kmpSearch,
  levenshtein,
  murmurHash3_32,
  polynomialHash,
  sipHash24,
  xxHash32,
  xxHash64,
} from '../../src/string/index.js';
import { big, fromHex, hex64, intOut, toHex } from './canonical.js';

// biome-ignore lint/suspicious/noExplicitAny: vector inputs are untyped JSON
type In = any;
type Fn = (input: In) => unknown;

const nums = (a: unknown[]): number[] => a as number[];
const pt = ([x, y]: [number, number]): Point2D => ({ x, y });
const ptOut = (p: Point2D): [number, number] => [p.x, p.y];
const graphOf = (g: { nodes: number; edges: [number, number, number][] }): Graph => ({
  nodes: g.nodes,
  edges: g.edges.map(([from, to, weight]) => ({ from, to, weight })),
});
const edgesOut = (es: Edge[]): [number, number, number][] =>
  es.map((e) => [e.from, e.to, e.weight]);
/** HyperLogLog item stream: prefix + decimal i for i in [0, count). */
const items = (s: { prefix: string; count: number }): string[] =>
  Array.from({ length: s.count }, (_, i) => `${s.prefix}${i}`);
const repeat = <T>(count: number, f: () => T): T[] => Array.from({ length: count }, f);

/** Stable-sort permutation: indices of `keys` in sorted order. */
const stablePerm =
  (sorter: <T>(a: T[], c: (x: T, y: T) => number) => T[]): Fn =>
  (i) =>
    sorter(
      nums(i.keys).map((k, idx) => [k, idx] as [number, number]),
      (x, y) => x[0] - y[0],
    ).map((p) => p[1]);

export const DISPATCH: Record<string, Fn> = {
  // ── §3 canonical number formatting ───────────────────────────────────────────────────────
  'canon.number': (i) => new DataView(Uint8Array.from(fromHex(i.bits)).buffer).getFloat64(0, false),

  // ── §4.1 PRNG ─────────────────────────────────────────────────────────────────────────────
  'rng.splitmix64': (i) => {
    const r = new SplitMix64(big(i.seed));
    return repeat(i.count, () => hex64(r.next()));
  },
  'rng.xoshiro256pp': (i) => {
    const r = new Xoshiro256pp(big(i.seed));
    return repeat(i.count, () => hex64(r.next()));
  },
  'rng.xoshiro256pp_float': (i) => {
    const r = new Xoshiro256pp(big(i.seed));
    return repeat(i.count, () => r.nextFloat());
  },
  'rng.xoshiro256pp_int': (i) => {
    const r = new Xoshiro256pp(big(i.seed));
    return repeat(i.count, () => r.nextInt(i.n));
  },
  'rng.pcg32': (i) => {
    const r = new Pcg32(big(i.state), big(i.seq));
    return repeat(i.count, () => r.next());
  },
  'rng.pcg32_bounded': (i) => {
    const r = new Pcg32(big(i.state), big(i.seq));
    return repeat(i.count, () => r.nextBounded(i.bound));
  },

  // ── §4.2 sort ─────────────────────────────────────────────────────────────────────────────
  'sort.quicksort': (i) => quicksort(nums(i.input).slice()),
  'sort.timsort': (i) => timsort(nums(i.input).slice()),
  'sort.mergesort': (i) => mergesort(nums(i.input).slice()),
  'sort.heapsort': (i) => heapsort(nums(i.input).slice()),
  'sort.radix_lsd': (i) => radixSortLSD(nums(i.input).slice()),
  'sort.counting': (i) => countingSort(nums(i.input).slice()),
  'sort.timsort_stable': stablePerm((a, c) => timsort(a, c)),
  'sort.mergesort_stable': stablePerm((a, c) => mergesort(a, c)),

  // ── §4.3 search ───────────────────────────────────────────────────────────────────────────
  'search.binary': (i) => binarySearch(nums(i.arr), i.target),
  'search.lower_bound': (i) => lowerBound(nums(i.arr), i.target),
  'search.upper_bound': (i) => upperBound(nums(i.arr), i.target),
  'search.interpolation': (i) => interpolationSearch(nums(i.arr), i.target),
  'search.exponential': (i) => exponentialSearch(nums(i.arr), i.target),
  'search.jump': (i) => jumpSearch(nums(i.arr), i.target),
  'search.fibonacci': (i) => fibonacciSearch(nums(i.arr), i.target),
  'search.linear': (i) => linearSearch(nums(i.arr), i.target),
  'search.ternary': (i) => {
    const c = i.c as number;
    const f =
      i.maximize === true ? (x: number) => -((x - c) * (x - c)) : (x: number) => (x - c) * (x - c);
    return ternarySearch(i.lo, i.hi, f, { maximize: i.maximize, epsilon: i.epsilon });
  },

  // ── §4.4 math ─────────────────────────────────────────────────────────────────────────────
  'math.gcd': (i) => intOut(gcd(big(i.a), big(i.b))),
  'math.lcm': (i) => intOut(lcm(big(i.a), big(i.b))),
  'math.extended_gcd': (i) => {
    const r = extendedGcd(big(i.a), big(i.b));
    return { g: intOut(r.g), x: intOut(r.x), y: intOut(r.y) };
  },
  'math.mod_inverse': (i) => intOut(modInverse(big(i.a), big(i.m))),
  'math.mod_pow': (i) => intOut(modPow(big(i.base), big(i.exp), big(i.mod))),
  'math.crt': (i) => intOut(crt(i.r.map(big), i.m.map(big))),
  'math.is_prime': (i) => isPrime(big(i.n)),
  'math.next_prime': (i) => intOut(nextPrime(big(i.n))),
  'math.sieve': (i) => sieve(i.n),
  'math.segmented_sieve': (i) => segmentedSieve(i.lo, i.hi),
  'math.factorize': (i) => factorize(big(i.n)).map(intOut),
  'math.karatsuba': (i) => intOut(karatsuba(big(i.x), big(i.y))),
  'math.ntt': (i) => ntt(i.a.map(big)).map(intOut),
  'math.poly_mul_ntt': (i) => polyMulNTT(i.a.map(big), i.b.map(big)).map(intOut),
  'math.mat_mul': (i) => matMul(i.a, i.b),
  'math.strassen': (i) => strassenMul(i.a, i.b),

  // ── §4.5 string ───────────────────────────────────────────────────────────────────────────
  'string.kmp': (i) => kmpSearch(i.text, i.pattern),
  'string.levenshtein': (i) => levenshtein(i.a, i.b),
  'string.damerau_levenshtein': (i) => damerauLevenshtein(i.a, i.b),
  'string.jaro': (i) => jaro(i.a, i.b),
  'string.jaro_winkler': (i) => jaroWinkler(i.a, i.b, i.p ?? 0.1),
  'string.aho_corasick': (i) => {
    const ac = new AhoCorasick();
    for (const p of i.patterns as string[]) ac.addPattern(p);
    return ac.search(i.text).map((m) => [m.pattern, m.index]);
  },
  'string.polynomial_hash': (i) => polynomialHash(i.s, i.base ?? 31, i.mod ?? 1_000_000_007),

  // ── §4.6 non-cryptographic hashes (input bytes as hex) ─────────────────────────────────────
  'hash.fnv1a32': (i) => fnv1a32(fromHex(i.data)),
  'hash.fnv1a64': (i) => hex64(fnv1a64(fromHex(i.data))),
  'hash.murmur3_32': (i) => murmurHash3_32(fromHex(i.data), i.seed),
  'hash.xxhash32': (i) => xxHash32(fromHex(i.data), i.seed),
  'hash.xxhash64': (i) => hex64(xxHash64(fromHex(i.data), big(i.seed))),
  'hash.siphash24': (i) => hex64(sipHash24(fromHex(i.key), fromHex(i.data))),

  // ── §4.7 data structures ──────────────────────────────────────────────────────────────────
  'datastructure.bloom': (i) => {
    const f = BloomFilter.withParams(i.m, i.k);
    for (const x of i.add as string[]) f.add(x);
    return {
      bits: toHex(f.toBytes()),
      set_bits: f.setBits,
      has: (i.query as string[]).map((q) => f.has(q)),
    };
  },
  'datastructure.hyperloglog': (i) => {
    const h = new HyperLogLog(i.b);
    for (const x of items(i.items)) h.add(x);
    return { estimate: h.count(), registers_fnv1a64: hex64(fnv1a64(h.registersBytes())) };
  },
  'datastructure.hyperloglog_merge': (i) => {
    const a = new HyperLogLog(i.b);
    const b = new HyperLogLog(i.b);
    for (const x of items(i.a)) a.add(x);
    for (const x of items(i.b_items)) b.add(x);
    return a.merge(b).count();
  },
  'datastructure.disjoint_set': (i) => {
    const ds = new DisjointSet(i.n);
    return (i.ops as [string, ...number[]][]).map(([op, x, y]) => {
      if (op === 'union') return ds.union(x as number, y as number);
      if (op === 'find') return ds.find(x as number);
      if (op === 'connected') return ds.connected(x as number, y as number);
      return ds.count;
    });
  },
  'datastructure.fenwick': (i) => {
    const ft = new FenwickTree(i.init as number[]);
    return (i.ops as [string, number, number?][]).map(([op, a, b]) => {
      if (op === 'update') {
        ft.update(a, b as number);
        return null;
      }
      if (op === 'prefix') return ft.prefixSum(a);
      if (op === 'range') return ft.rangeSum(a, b as number);
      return ft.pointQuery(a);
    });
  },
  'datastructure.segment_tree': (i) => {
    const st = new SegmentTree(i.init as number[]);
    return (i.ops as [string, number, number, number?][]).map(([op, l, r, v]) => {
      if (op === 'update') {
        st.update(l, r, v as number);
        return null;
      }
      return st.query(l, r);
    });
  },

  // ── §4.8 graph (edges as [from, to, weight]) ───────────────────────────────────────────────
  'graph.bfs': (i) => bfs(graphOf(i.graph), i.source),
  'graph.dfs': (i) => dfs(graphOf(i.graph), i.source),
  'graph.dijkstra': (i) => dijkstra(graphOf(i.graph), i.source),
  'graph.bellman_ford': (i) => {
    const r = bellmanFord(graphOf(i.graph), i.source);
    return { distances: r.distances, has_negative_cycle: r.hasNegativeCycle };
  },
  'graph.floyd_warshall': (i) => floydWarshall(graphOf(i.graph)),
  'graph.topological_sort': (i) => topologicalSort(graphOf(i.graph)),
  'graph.kruskal': (i) => edgesOut(kruskal(graphOf(i.graph))),
  'graph.prim': (i) => edgesOut(prim(graphOf(i.graph))),
  'graph.tarjan_scc': (i) => tarjanScc(graphOf(i.graph)),
  'graph.dinic': (i) => dinic(graphOf(i.graph), i.source, i.sink),
  'graph.bipartite_matching': (i) => bipartiteMatching(i.n_left, i.n_right, i.pairs).size,
  'graph.a_star': (i) => {
    const h = i.heuristic as number[] | undefined;
    const r = aStar(graphOf(i.graph), i.source, i.target, h ? (v) => h[v] as number : undefined);
    return { path: r.path, cost: r.cost };
  },
  'graph.pagerank': (i) =>
    pageRank(graphOf(i.graph), { damping: i.damping, iterations: i.iterations }),

  // ── §4.9 ml ───────────────────────────────────────────────────────────────────────────────
  'ml.dot': (i) => dotProduct(i.a, i.b),
  'ml.l2_norm': (i) => l2Norm(i.v),
  'ml.cosine': (i) => cosineSimilarity(i.a, i.b),
  'ml.l2_distance': (i) => l2Distance(i.a, i.b),
  'ml.l1_distance': (i) => l1Distance(i.a, i.b),
  'ml.normalize': (i) => Array.from(normalize(i.v)),
  'ml.jaccard': (i) => jaccardSimilarity(new Set(i.a as string[]), new Set(i.b as string[])),
  'ml.pearson': (i) => pearson(i.a, i.b),
  'ml.batch_cosine': (i) => batchCosine(i.query, i.candidates).map((r) => [r.index, r.score]),
  'ml.kmeans': (i) => {
    const r = kmeans(i.points, i.k, { seed: big(i.seed), maxIter: i.max_iter, tol: i.tol });
    return {
      centroids: r.centroids,
      labels: r.labels,
      iterations: r.iterations,
      inertia: r.inertia,
    };
  },

  // ── §4.10 geometry (points as [x, y]) ─────────────────────────────────────────────────────
  'geometry.cross': (i) => cross(pt(i.o), pt(i.a), pt(i.b)),
  'geometry.convex_hull': (i) => convexHull((i.points as [number, number][]).map(pt)).map(ptOut),
  'geometry.closest_pair': (i) => closestPair((i.points as [number, number][]).map(pt))[2],
  'geometry.point_in_polygon': (i) =>
    pointInPolygon(pt(i.point), (i.polygon as [number, number][]).map(pt)),
  'geometry.bezier': (i) => ptOut(bezier((i.points as [number, number][]).map(pt), i.t)),

  // ── §4.11 compression (bytes as hex) ──────────────────────────────────────────────────────
  'compression.rle_encode': (i) => toHex(rleEncode(fromHex(i.data))),
  'compression.rle_decode': (i) => toHex(rleDecode(fromHex(i.data))),
  'compression.lz77_compress': (i) => toHex(lz77Compress(fromHex(i.data), i.window ?? 255)),
  'compression.lz77_decompress': (i) => toHex(lz77Decompress(fromHex(i.data))),
  'compression.huffman': (i) => {
    const r = huffmanEncode(fromHex(i.data));
    return {
      encoded: toHex(r.encoded),
      bit_length: r.bitLength,
      codes: [...r.codes.entries()].sort((a, b) => a[0] - b[0]),
    };
  },
};

/** Run one case; an AlgoError becomes `{ "error": "<CODE>" }` (SPEC §2, §4.0). Anything else is a bug. */
export function runCase(group: string, input: unknown): unknown {
  const fn = DISPATCH[group];
  if (fn === undefined) throw new Error(`unknown vector group ${group}`);
  try {
    return fn(input);
  } catch (e) {
    if (e instanceof AlgoError) return { error: e.code };
    throw e;
  }
}

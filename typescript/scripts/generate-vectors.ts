// LombokAlgoritma — generate vectors/lombokalgoritma-vectors-v1.json from the TypeScript reference
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//
//   npm run vectors:generate          # rewrite the file
//   npm run vectors:check             # exit 1 when the committed file differs (CI)
//
// Inputs are produced by a fixed PCG32 stream, so the file is reproducible byte for byte. Expected
// values come from the TypeScript reference; groups with an external reference (hashes, PRNGs,
// FIPS/RFC values) are additionally pinned in tests/regression.test.ts.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Pcg32 } from '../src/core/rng.js';
import { canonical, toHex } from '../tests/vectors/canonical.js';
import { runCase } from '../tests/vectors/dispatch.js';

const OUT = join(import.meta.dirname, '..', '..', 'vectors', 'lombokalgoritma-vectors-v1.json');
const rng = new Pcg32(20260925n, 54n);
const int = (lo: number, hi: number): number => lo + rng.nextBounded(hi - lo + 1); // [lo, hi]
const ints = (n: number, lo: number, hi: number): number[] =>
  Array.from({ length: n }, () => int(lo, hi));
const bytes = (n: number, alphabet = 256): string =>
  toHex(Uint8Array.from({ length: n }, () => rng.nextBounded(alphabet)));
const u64 = (): string => ((BigInt(rng.next()) << 32n) | BigInt(rng.next())).toString();
const float = (lo: number, hi: number): number => lo + (hi - lo) * (rng.next() / 2 ** 32);
const round2 = (x: number): number => Math.round(x * 4) / 4; // exact binary fractions
const word = (n: number, alphabet = 'abcde'): string =>
  Array.from({ length: n }, () => alphabet[rng.nextBounded(alphabet.length)]).join('');
const sorted = (a: number[]): number[] => [...a].sort((x, y) => x - y);

type Case = { id: string; input: unknown };
const groups: Record<string, Case[]> = {};
function add(group: string, input: unknown, id?: string): void {
  let list = groups[group];
  if (list === undefined) {
    list = [];
    groups[group] = list;
  }
  list.push({ id: id ?? String(list.length + 1).padStart(3, '0'), input });
}

// ── §3 number formatting ────────────────────────────────────────────────────────────────────
const f64bits = (x: number): string => {
  const dv = new DataView(new ArrayBuffer(8));
  dv.setFloat64(0, x, false);
  return toHex(new Uint8Array(dv.buffer));
};
for (const x of [
  0,
  -0,
  1,
  -1,
  0.1,
  0.2,
  0.30000000000000004,
  1 / 3,
  2 / 3,
  100,
  1e20,
  1e21,
  1.5e21,
  1.2345678901234568e20,
  1e-6,
  1e-7,
  1.5e-7,
  5e-324,
  2.2250738585072014e-308,
  1.7976931348623157e308,
  9007199254740991,
  9007199254740992,
  4.35,
  0.000001234,
  1234.5678,
  -2.5e-10,
  6.02214076e23,
  Number.NaN,
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
  2 ** 70,
  1e100,
  123e-20,
  0.5,
  1e16,
  12345678901234568,
]) {
  add('canon.number', { bits: f64bits(x) });
}
for (let k = 0; k < 20; k++) {
  const dv = new DataView(new ArrayBuffer(8));
  dv.setUint32(0, rng.next());
  dv.setUint32(4, rng.next());
  if (Number.isFinite(dv.getFloat64(0)))
    add('canon.number', { bits: toHex(new Uint8Array(dv.buffer)) });
}

// ── §4.1 PRNG ────────────────────────────────────────────────────────────────────────────────
for (const seed of ['0', '1', '1234567', '18446744073709551615', u64()]) {
  add('rng.splitmix64', { seed, count: 8 });
  add('rng.xoshiro256pp', { seed, count: 8 });
  add('rng.xoshiro256pp_float', { seed, count: 8 });
}
for (const n of [1, 2, 3, 10, 1000, 2 ** 31 + 1, 2 ** 53 - 1])
  add('rng.xoshiro256pp_int', { seed: u64(), n, count: 8 });
add('rng.pcg32', { state: '42', seq: '54', count: 12 }, 'pcg-c-demo');
for (let k = 0; k < 4; k++) add('rng.pcg32', { state: u64(), seq: u64(), count: 8 });
for (const bound of [1, 2, 6, 1000, 2 ** 31 + 7, 4294967295])
  add('rng.pcg32_bounded', { state: u64(), seq: u64(), bound, count: 8 });

// ── §4.2 sort ────────────────────────────────────────────────────────────────────────────────
const sortInputs: number[][] = [
  [],
  [7],
  [2, 1],
  [1, 2, 3, 4, 5],
  [5, 4, 3, 2, 1],
  [3, 3, 3, 3],
  [0, -1, 5, -10, 2, 2, -1],
  ints(20, -50, 50),
  ints(40, 0, 5),
  ints(100, -1000000, 1000000),
  ints(300, 0, 99),
  [...Array.from({ length: 64 }, (_, k) => k), 3, 2, 1],
];
for (const input of sortInputs) {
  for (const g of ['quicksort', 'timsort', 'mergesort', 'heapsort', 'radix_lsd'])
    add(`sort.${g}`, { input });
  if (input.every((v) => v >= 0)) add('sort.counting', { input });
}
add('sort.counting', { input: [3, -1, 2] }, 'negative-error');
for (const keys of [
  [],
  [1],
  [2, 1, 2, 1, 2, 1],
  ints(50, 0, 4),
  ints(200, 0, 9),
  ints(33, -3, 3),
]) {
  add('sort.timsort_stable', { keys });
  add('sort.mergesort_stable', { keys });
}

// ── §4.3 search ──────────────────────────────────────────────────────────────────────────────
const searchArrays: number[][] = [
  [],
  [5],
  [1, 3, 5, 7, 9, 11],
  sorted(ints(30, 0, 100)),
  [1, 2, 2, 2, 3, 3, 9],
  Array.from({ length: 100 }, (_, k) => 3 * k),
];
for (const arr of searchArrays) {
  const targets =
    arr.length === 0
      ? [1]
      : [
          arr[0] as number,
          arr[arr.length - 1] as number,
          arr[arr.length >> 1] as number,
          -1,
          1000,
          4,
        ];
  for (const target of targets) {
    for (const g of [
      'binary',
      'lower_bound',
      'upper_bound',
      'interpolation',
      'exponential',
      'jump',
      'fibonacci',
      'linear',
    ]) {
      add(`search.${g}`, { arr, target });
    }
  }
}
for (const [lo, hi, c, maximize, epsilon] of [
  [0, 10, 3.7, true, 1e-9],
  [-5, 5, 0, false, 1e-6],
  [0, 1, 0.25, true, 1e-12],
  [-100, 50, -42.5, false, 1e-3],
] as const) {
  add('search.ternary', { lo, hi, c, maximize, epsilon });
}

// ── §4.4 math ────────────────────────────────────────────────────────────────────────────────
for (const [a, b] of [
  [0, 0],
  [0, 7],
  [12, 18],
  [-12, 18],
  [17, 5],
  ['9223372036854775807', '6700417'],
  [1071, 462],
  [2 ** 40, 2 ** 20 * 3],
]) {
  add('math.gcd', { a, b });
  add('math.extended_gcd', { a, b });
}
for (const [a, b] of [
  [0, 5],
  [4, 6],
  [-4, 6],
  [21, 6],
  [1000003, 999983],
])
  add('math.lcm', { a, b });
for (const [a, m] of [
  [3, 11],
  [10, 17],
  [-3, 11],
  [6, 9],
  ['123456789', '1000000007'],
])
  add('math.mod_inverse', { a, m });
for (const [base, exp, mod] of [
  [2, 10, 1000],
  [3, 0, 7],
  [5, 3, 1],
  [7, '1000000006', '1000000007'],
  ['123456789123', '987654321', '9223372036854775783'],
  [0, 0, 13],
]) {
  add('math.mod_pow', { base, exp, mod });
}
add('math.mod_pow', { base: -2, exp: 3, mod: 5 }, 'negative-base');
add('math.mod_pow', { base: 2, exp: -1, mod: 5 }, 'negative-exp-error');
add('math.crt', { r: [2, 3, 2], m: [3, 5, 7] });
add('math.crt', { r: [1, 2, 3, 4], m: [5, 7, 9, 11] });
add('math.crt', { r: [-1, 0], m: [4, 9] });
add('math.crt', { r: [1, 1], m: [4, 6] }, 'not-coprime-error');
for (const n of [
  0,
  1,
  2,
  3,
  4,
  17,
  91,
  561,
  7919,
  1000000007,
  '9223372036854775783',
  '9223372036854775807',
  '3215031751',
  '4759123141',
]) {
  add('math.is_prime', { n });
}
for (const n of [0, 2, 14, 90, 7920, 1000000000, '9223372036854775700'])
  add('math.next_prime', { n });
for (const n of [0, 1, 2, 30, 100, 997]) add('math.sieve', { n });
for (const [lo, hi] of [
  [0, 30],
  [1, 1],
  [90, 110],
  [1000000, 1000100],
  [2, 2],
])
  add('math.segmented_sieve', { lo, hi });
for (const n of [
  1,
  2,
  12,
  97,
  360,
  1001,
  999999,
  600851475143,
  '9223372036854775807',
  '1000000016000000063',
])
  add('math.factorize', { n });
for (const [x, y] of [
  [0, 5],
  [12345, 6789],
  [-999, 1001],
  ['9223372036854775807', '9223372036854775807'],
  ['1234567890123', '-98765432109'],
]) {
  add('math.karatsuba', { x, y });
}
add('math.ntt', { a: [1, 2, 3, 4] });
add('math.ntt', { a: ints(8, 0, 998244352) });
add('math.ntt', { a: [1, 2, 3] }, 'length-error');
add('math.poly_mul_ntt', { a: [1, 2, 3], b: [4, 5] });
add('math.poly_mul_ntt', { a: ints(10, 0, 1000), b: ints(7, 0, 1000) });
add('math.poly_mul_ntt', { a: [998244352], b: [998244352, 1] });
const mat = (r: number, c: number): number[][] => Array.from({ length: r }, () => ints(c, -9, 9));
add('math.mat_mul', {
  a: [
    [1, 2],
    [3, 4],
  ],
  b: [
    [5, 6],
    [7, 8],
  ],
});
add('math.mat_mul', { a: mat(3, 4), b: mat(4, 2) });
add('math.mat_mul', { a: [[1, 2]], b: [[1, 2]] }, 'shape-error');
add('math.strassen', { a: mat(3, 3), b: mat(3, 3) });
add('math.strassen', { a: mat(4, 4), b: mat(4, 4) });
add('math.strassen', { a: mat(70, 70), b: mat(70, 70) }, 'padded-70');

// ── §4.5 string ──────────────────────────────────────────────────────────────────────────────
for (const [text, pattern] of [
  ['abcabc', 'abc'],
  ['aaaa', 'aa'],
  ['hello', ''],
  ['', 'a'],
  ['banana', 'ana'],
  ['😀a😀a', '😀a'],
  [word(200, 'ab'), 'abab'],
]) {
  add('string.kmp', { text, pattern });
}
const strPairs: [string, string][] = [
  ['', ''],
  ['a', ''],
  ['', 'abc'],
  ['kitten', 'sitting'],
  ['flaw', 'lawn'],
  ['ca', 'abc'],
  ['MARTHA', 'MARHTA'],
  ['DWAYNE', 'DUANE'],
  ['DIXON', 'DICKSONX'],
  ['😀x', 'x😀'],
  ['naïve', 'naive'],
  [word(12), word(15)],
  [word(30), word(28)],
];
for (const [a, b] of strPairs) {
  add('string.levenshtein', { a, b });
  add('string.damerau_levenshtein', { a, b });
  add('string.jaro', { a, b });
  add('string.jaro_winkler', { a, b });
}
add('string.jaro_winkler', { a: 'MARTHA', b: 'MARHTA', p: 0.2 }, 'p-0.2');
add('string.aho_corasick', { patterns: ['he', 'she', 'his', 'hers'], text: 'ahishers' });
add('string.aho_corasick', { patterns: ['a', 'aa', 'aaa'], text: 'aaaa' });
add('string.aho_corasick', { patterns: ['😀', 'b😀'], text: 'ab😀😀' });
add('string.aho_corasick', { patterns: ['abc', 'bcd', 'x', 'abc'], text: word(60, 'abcdx') });
add('string.aho_corasick', { patterns: [], text: 'abc' });
for (const s of [
  '',
  'a',
  'abc',
  'Hello, World!',
  'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
  '😀',
  word(100, 'abcdefghij'),
])
  add('string.polynomial_hash', { s });
add('string.polynomial_hash', { s: 'abcdef', base: 257, mod: 998244353 }, 'custom-base');

// ── §4.6 hashes ──────────────────────────────────────────────────────────────────────────────
const hashData = [
  '',
  '61',
  '616263',
  toHex(new TextEncoder().encode('hello')),
  toHex(new TextEncoder().encode('The quick brown fox jumps over the lazy dog')),
  ...[1, 3, 4, 7, 8, 15, 16, 17, 31, 32, 33, 63, 64, 65, 100, 257].map((n) => bytes(n)),
];
for (const data of hashData) {
  add('hash.fnv1a32', { data });
  add('hash.fnv1a64', { data });
  add('hash.murmur3_32', { data, seed: 0 });
  add('hash.murmur3_32', { data, seed: rng.next() });
  add('hash.xxhash32', { data, seed: 0 });
  add('hash.xxhash32', { data, seed: rng.next() });
  add('hash.xxhash64', { data, seed: '0' });
  add('hash.xxhash64', { data, seed: u64() });
  add('hash.siphash24', { key: '000102030405060708090a0b0c0d0e0f', data });
  add('hash.siphash24', { key: bytes(16), data });
}
add('hash.siphash24', { key: '00', data: '' }, 'short-key-error');

// ── §4.7 data structures ─────────────────────────────────────────────────────────────────────
for (const [m, k, n] of [
  [64, 3, 5],
  [1000, 7, 50],
  [1, 1, 3],
  [4096, 5, 300],
] as const) {
  const addItems = Array.from({ length: n }, (_, j) => `item-${j}`);
  const query = [...addItems.slice(0, 5), ...Array.from({ length: 20 }, (_, j) => `other-${j}`)];
  add('datastructure.bloom', { m, k, add: addItems, query });
}
add('datastructure.bloom', { m: 0, k: 1, add: [], query: [] }, 'zero-m-error');
for (const [b, count] of [
  [4, 10],
  [10, 100],
  [10, 5000],
  [14, 10000],
  [12, 200000],
  [16, 1000],
] as const) {
  add('datastructure.hyperloglog', { b, items: { prefix: 'x', count } });
}
add('datastructure.hyperloglog', { b: 14, items: { prefix: 'user:', count: 0 } }, 'empty');
add('datastructure.hyperloglog_merge', {
  b: 12,
  a: { prefix: 'a', count: 3000 },
  b_items: { prefix: 'a', count: 5000 },
});
{
  const ops: unknown[] = [];
  for (let k = 0; k < 60; k++) {
    const r = rng.nextBounded(4);
    const x = int(0, 19);
    const y = int(0, 19);
    ops.push(
      r === 0 ? ['union', x, y] : r === 1 ? ['find', x] : r === 2 ? ['connected', x, y] : ['count'],
    );
  }
  add('datastructure.disjoint_set', { n: 20, ops });
  add('datastructure.disjoint_set', {
    n: 3,
    ops: [['union', 0, 1], ['union', 1, 2], ['find', 2], ['find', 0], ['count'], ['union', 0, 2]],
  });
}
{
  const init = ints(16, -10, 10);
  const ops: unknown[] = [];
  for (let k = 0; k < 40; k++) {
    const r = rng.nextBounded(4);
    const a = int(1, 16);
    const b = int(a, 16);
    ops.push(
      r === 0
        ? ['update', a, int(-5, 5)]
        : r === 1
          ? ['prefix', a]
          : r === 2
            ? ['range', a, b]
            : ['point', a],
    );
  }
  add('datastructure.fenwick', { init, ops });
  add('datastructure.fenwick', { init: [], ops: [['prefix', 0]] }, 'empty');
}
{
  const init = ints(13, -10, 10);
  const ops: unknown[] = [];
  for (let k = 0; k < 40; k++) {
    const l = int(0, 12);
    const r = int(l, 12);
    ops.push(rng.nextBounded(2) === 0 ? ['update', l, r, int(-5, 5)] : ['query', l, r]);
  }
  add('datastructure.segment_tree', { init, ops });
  add('datastructure.segment_tree', {
    init: [5],
    ops: [
      ['query', 0, 0],
      ['update', 0, 0, 3],
      ['query', 0, 0],
    ],
  });
}

// ── §4.8 graph ───────────────────────────────────────────────────────────────────────────────
type G = { nodes: number; edges: [number, number, number][] };
const randGraph = (n: number, m: number, wlo: number, whi: number): G => ({
  nodes: n,
  edges: Array.from(
    { length: m },
    () => [int(0, n - 1), int(0, n - 1), int(wlo, whi)] as [number, number, number],
  ),
});
const graphs: G[] = [
  { nodes: 1, edges: [] },
  {
    nodes: 4,
    edges: [
      [0, 1, 1],
      [1, 2, 2],
      [0, 2, 5],
      [2, 3, 1],
    ],
  },
  {
    nodes: 5,
    edges: [
      [0, 1, 2],
      [0, 2, 2],
      [1, 3, 1],
      [2, 3, 1],
      [3, 4, 3],
      [4, 0, 1],
    ],
  },
  {
    nodes: 6,
    edges: [
      [0, 1, 7],
      [0, 2, 9],
      [0, 5, 14],
      [1, 2, 10],
      [1, 3, 15],
      [2, 3, 11],
      [2, 5, 2],
      [3, 4, 6],
      [4, 5, 9],
    ],
  },
  {
    nodes: 5,
    edges: [
      [0, 1, 1],
      [2, 3, 1],
    ],
  },
  randGraph(12, 30, 0, 20),
  randGraph(20, 60, 1, 9),
  randGraph(8, 8, 0, 3),
];
for (const graph of graphs) {
  add('graph.bfs', { graph, source: 0 });
  add('graph.dfs', { graph, source: 0 });
  add('graph.dijkstra', { graph, source: 0 });
  add('graph.bellman_ford', { graph, source: 0 });
  add('graph.floyd_warshall', { graph });
  add('graph.topological_sort', { graph });
  add('graph.kruskal', { graph });
  add('graph.prim', { graph });
  add('graph.tarjan_scc', { graph });
  add('graph.pagerank', { graph, damping: 0.85, iterations: 30 });
  if (graph.nodes > 1) {
    add('graph.dinic', { graph, source: 0, sink: graph.nodes - 1 });
    add('graph.a_star', { graph, source: 0, target: graph.nodes - 1 });
  }
}
const dag: G = {
  nodes: 6,
  edges: [
    [5, 2, 1],
    [5, 0, 1],
    [4, 0, 1],
    [4, 1, 1],
    [2, 3, 1],
    [3, 1, 1],
  ],
};
add('graph.topological_sort', { graph: dag }, 'dag');
add('graph.tarjan_scc', { graph: dag }, 'dag');
add('graph.dijkstra', { graph: { nodes: 2, edges: [[0, 1, -1]] }, source: 0 }, 'negative-error');
add(
  'graph.bellman_ford',
  {
    graph: {
      nodes: 4,
      edges: [
        [0, 1, 4],
        [0, 2, 5],
        [2, 1, -3],
        [1, 3, 2],
      ],
    },
    source: 0,
  },
  'negative-weights',
);
add(
  'graph.bellman_ford',
  {
    graph: {
      nodes: 3,
      edges: [
        [0, 1, 1],
        [1, 2, -2],
        [2, 1, 1],
      ],
    },
    source: 0,
  },
  'negative-cycle',
);
add(
  'graph.a_star',
  {
    graph: {
      nodes: 5,
      edges: [
        [0, 1, 1],
        [1, 2, 1],
        [0, 3, 2],
        [3, 2, 0.5],
        [2, 4, 1],
      ],
    },
    source: 0,
    target: 4,
    heuristic: [2, 1.5, 1, 1.5, 0],
  },
  'heuristic',
);
add(
  'graph.a_star',
  { graph: { nodes: 3, edges: [[0, 1, 1]] }, source: 0, target: 2 },
  'unreachable',
);
add(
  'graph.dinic',
  {
    graph: {
      nodes: 6,
      edges: [
        [0, 1, 16],
        [0, 2, 13],
        [1, 2, 10],
        [2, 1, 4],
        [1, 3, 12],
        [3, 2, 9],
        [2, 4, 14],
        [4, 3, 7],
        [3, 5, 20],
        [4, 5, 4],
      ],
    },
    source: 0,
    sink: 5,
  },
  'clrs-23',
);
add('graph.dinic', { graph: { nodes: 2, edges: [] }, source: 0, sink: 0 }, 'same-node-error');
add('graph.pagerank', { graph: { nodes: 0, edges: [] }, damping: 0.85, iterations: 10 }, 'empty');
add(
  'graph.pagerank',
  {
    graph: {
      nodes: 3,
      edges: [
        [0, 1, 1],
        [1, 2, 1],
      ],
    },
    damping: 0.5,
    iterations: 100,
  },
  'dangling',
);
add('graph.bipartite_matching', {
  n_left: 3,
  n_right: 3,
  pairs: [
    [0, 0],
    [0, 1],
    [1, 0],
    [2, 2],
  ],
});
add('graph.bipartite_matching', {
  n_left: 4,
  n_right: 4,
  pairs: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
});
add('graph.bipartite_matching', { n_left: 0, n_right: 0, pairs: [] });
add('graph.bipartite_matching', {
  n_left: 30,
  n_right: 25,
  pairs: Array.from({ length: 90 }, () => [int(0, 29), int(0, 24)]),
});
add('graph.bipartite_matching', { n_left: 1, n_right: 1, pairs: [[0, 1]] }, 'range-error');

// ── §4.9 ml ──────────────────────────────────────────────────────────────────────────────────
const vecPairs: [number[], number[]][] = [
  [
    [1, 2, 3],
    [4, 5, 6],
  ],
  [
    [0, 0, 0],
    [1, 2, 3],
  ],
  [
    [1, 0],
    [0, 1],
  ],
  [
    [1.5, -2.25, 3.125],
    [-0.5, 4, 0.75],
  ],
  [Array.from({ length: 16 }, () => float(-1, 1)), Array.from({ length: 16 }, () => float(-1, 1))],
  [
    [0.1, 0.2, 0.3],
    [0.3, 0.2, 0.1],
  ],
];
for (const [a, b] of vecPairs) {
  for (const g of ['dot', 'cosine', 'l2_distance', 'l1_distance', 'pearson'])
    add(`ml.${g}`, { a, b });
  add('ml.l2_norm', { v: a });
  add('ml.normalize', { v: a });
}
add('ml.dot', { a: [1, 2], b: [1] }, 'length-error');
add('ml.pearson', { a: [1, 2, 3, 4], b: [1, -1, -1, 1] }, 'uncorrelated');
for (const [a, b] of [
  [
    ['a', 'b', 'c'],
    ['b', 'c', 'd'],
  ],
  [[], []],
  [['x'], []],
  [['a', 'a', 'b'], ['a']],
])
  add('ml.jaccard', { a, b });
add('ml.batch_cosine', {
  query: [1, 0],
  candidates: [
    [1, 0],
    [0, 1],
    [1, 1],
    [0, 0],
    [2, 0],
    [-1, 0],
  ],
});
add('ml.batch_cosine', {
  query: Array.from({ length: 8 }, () => float(-1, 1)),
  candidates: Array.from({ length: 10 }, () => Array.from({ length: 8 }, () => float(-1, 1))),
});
{
  const blob = (cx: number, cy: number, n: number): number[][] =>
    Array.from({ length: n }, () => [round2(cx + float(-1, 1)), round2(cy + float(-1, 1))]);
  const pts = [...blob(0, 0, 15), ...blob(10, 10, 15), ...blob(-10, 8, 15)];
  add('ml.kmeans', { points: pts, k: 3, seed: '42', max_iter: 100, tol: 1e-4 });
  add('ml.kmeans', { points: pts, k: 1, seed: '7', max_iter: 10, tol: 0 });
  add('ml.kmeans', { points: pts, k: 5, seed: u64(), max_iter: 3, tol: 1e-9 });
  add('ml.kmeans', {
    points: Array.from({ length: 40 }, () => [float(0, 1), float(0, 1), float(0, 1)]),
    k: 4,
    seed: '1',
    max_iter: 50,
    tol: 1e-6,
  });
  add(
    'ml.kmeans',
    {
      points: [
        [1, 1],
        [1, 1],
        [1, 1],
      ],
      k: 2,
      seed: '3',
      max_iter: 5,
      tol: 1e-4,
    },
    'identical-points',
  );
  add('ml.kmeans', { points: [[1, 2]], k: 2, seed: '1', max_iter: 5, tol: 1e-4 }, 'k-error');
}

// ── §4.10 geometry ───────────────────────────────────────────────────────────────────────────
add('geometry.cross', { o: [0, 0], a: [1, 0], b: [0, 1] });
add('geometry.cross', { o: [1, 1], a: [2, 2], b: [3, 3] });
add('geometry.cross', { o: [0.1, 0.2], a: [0.3, -0.7], b: [1.5, 2.25] });
const hullSets: number[][][] = [
  [],
  [[1, 1]],
  [
    [2, 2],
    [1, 1],
  ],
  [
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 3],
  ],
  [
    [0, 0],
    [4, 0],
    [4, 4],
    [0, 4],
    [2, 2],
    [2, 0],
    [1, 3],
  ],
  [
    [1, 1],
    [1, 1],
    [1, 1],
  ],
  Array.from({ length: 50 }, () => [int(-20, 20), int(-20, 20)]),
  Array.from({ length: 30 }, () => [round2(float(-5, 5)), round2(float(-5, 5))]),
];
for (const points of hullSets) add('geometry.convex_hull', { points });
for (const points of [
  [
    [0, 0],
    [3, 4],
  ],
  [
    [0, 0],
    [5, 5],
    [1, 1],
    [9, 9],
    [1.5, 1.5],
  ],
  Array.from({ length: 60 }, () => [int(-1000, 1000), int(-1000, 1000)]),
  Array.from({ length: 40 }, () => [float(-1, 1), float(-1, 1)]),
  [
    [1, 1],
    [1, 1],
    [2, 2],
  ],
]) {
  add('geometry.closest_pair', { points });
}
add('geometry.closest_pair', { points: [[1, 1]] }, 'one-point-error');
const square = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
];
const concave = [
  [0, 0],
  [6, 0],
  [6, 6],
  [3, 2],
  [0, 6],
];
for (const [point, polygon] of [
  [[5, 5], square],
  [[15, 5], square],
  [[-1, -1], square],
  [[3, 4], concave],
  [[3, 1], concave],
  [[1, 5], concave],
  [[5, 5], []],
] as const) {
  add('geometry.point_in_polygon', { point, polygon });
}
for (const t of [0, 0.25, 0.5, 0.75, 1, 0.1]) {
  add('geometry.bezier', {
    points: [
      [0, 0],
      [1, 2],
      [3, 3],
      [4, 0],
    ],
    t,
  });
}
add('geometry.bezier', { points: [[2, 3]], t: 0.7 });
add('geometry.bezier', {
  points: [
    [0, 0],
    [10, 10],
  ],
  t: 0.3,
});
add('geometry.bezier', { points: [], t: 0.5 }, 'empty-error');

// ── §4.11 compression ────────────────────────────────────────────────────────────────────────
const compData = [
  '',
  '41',
  '414141',
  '00'.repeat(300),
  toHex(new TextEncoder().encode('abracadabra abracadabra')),
  bytes(50, 3),
  bytes(200, 256),
  bytes(400, 2),
];
for (const data of compData) {
  add('compression.rle_encode', { data });
  add('compression.lz77_compress', { data });
  add('compression.huffman', { data });
}
add('compression.lz77_compress', { data: bytes(100, 4), window: 16 }, 'window-16');
add('compression.lz77_compress', { data: '00', window: 0 }, 'window-error');
for (const data of ['', '0341', '02ff0100', 'ff00ff01']) add('compression.rle_decode', { data });
add('compression.rle_decode', { data: '03' }, 'odd-error');
add('compression.rle_decode', { data: '0041' }, 'zero-run-error');
for (const data of ['', '0041', '0061006200630103030102050062'])
  add('compression.lz77_decompress', { data });
add('compression.lz77_decompress', { data: '010101' }, 'offset-error');
add('compression.lz77_decompress', { data: '02' }, 'flag-error');

// ── assemble ─────────────────────────────────────────────────────────────────────────────────
const names = Object.keys(groups).sort();
const lines: string[] = [];
lines.push('{');
lines.push('"format":"lombokalgoritma-vectors",');
lines.push('"version":1,');
lines.push('"library_version":"0.2.0",');
lines.push('"spec":"docs/SPEC_LombokAlgoritma_v0.2.0.md",');
lines.push('"groups":{');
names.forEach((name, gi) => {
  lines.push(`${JSON.stringify(name)}:[`);
  const cases = groups[name] as Case[];
  cases.forEach((c, ci) => {
    const expected = runCase(name, JSON.parse(JSON.stringify(c.input)));
    const sep = ci + 1 < cases.length ? ',' : '';
    lines.push(
      `{"id":${JSON.stringify(c.id)},"input":${canonical(c.input)},"expected":${canonical(expected)}}${sep}`,
    );
  });
  lines.push(`]${gi + 1 < names.length ? ',' : ''}`);
});
lines.push('}');
lines.push('}');
const text = `${lines.join('\n')}\n`;

if (process.argv.includes('--check')) {
  const cur = readFileSync(OUT, 'utf8');
  if (cur !== text) {
    console.error(
      'vectors/lombokalgoritma-vectors-v1.json is stale — run `npm run vectors:generate`',
    );
    process.exit(1);
  }
  console.log(`vectors up to date (${names.length} groups)`);
} else {
  writeFileSync(OUT, text);
  let n = 0;
  for (const g of names) n += (groups[g] as Case[]).length;
  console.log(`wrote ${OUT}: ${names.length} groups, ${n} cases, ${text.length} bytes`);
}

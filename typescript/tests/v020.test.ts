// LombokAlgoritma — unit tests for code added or changed in v0.2.0
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { describe, expect, it } from 'vitest';
import {
  huffmanDecode,
  huffmanEncode,
  lz77Compress,
  lz77Decompress,
  rleDecode,
  rleEncode,
} from '../src/compression/index.js';
import { AlgoError } from '../src/core/errors.js';
import { BloomFilter } from '../src/datastructure/bloom-filter.js';
import { HyperLogLog } from '../src/datastructure/hyperloglog.js';
import { closestPair, convexHull, convexHullGraham } from '../src/geometry/index.js';
import { bellmanFord, bipartiteMatching, dinic, prim, tarjanScc } from '../src/graph/index.js';
import { batchCosine, cosineSimilarity, kmeans } from '../src/ml/index.js';
import { sipHash24, xxHash64 } from '../src/string/hash/index.js';
import { AhoCorasick, kmpSearch, levenshtein, polynomialHash } from '../src/string/index.js';

const bytes = (s: string): Uint8Array => new TextEncoder().encode(s);
const code = (f: () => unknown): string => {
  try {
    f();
  } catch (e) {
    if (e instanceof AlgoError) return e.code;
    throw e;
  }
  return 'none';
};

describe('compression round trips and malformed input', () => {
  const samples = ['', 'a', 'aaaa', 'abracadabra abracadabra', 'x'.repeat(600), 'ÿ\u0000\u0001'];
  it.each(samples)('huffman/lz77/rle round-trip %#', (s) => {
    const data = bytes(s);
    const h = huffmanEncode(data);
    expect(huffmanDecode(h.encoded, h.bitLength, h.tree)).toEqual(data);
    expect(lz77Decompress(lz77Compress(data))).toEqual(data);
    expect(lz77Decompress(lz77Compress(data, 7))).toEqual(data);
    expect(rleDecode(rleEncode(data))).toEqual(data);
  });
  it('rejects malformed streams with INVALID_INPUT', () => {
    const h = huffmanEncode(bytes('abc'));
    expect(code(() => huffmanDecode(h.encoded, 999, h.tree))).toBe('INVALID_INPUT');
    expect(code(() => huffmanDecode(h.encoded, 1, h.tree))).toBe('INVALID_INPUT'); // truncated code
    expect(
      code(() =>
        huffmanDecode(new Uint8Array([0xff]), 8, { freq: 2, left: { symbol: 1, freq: 1 } }),
      ),
    ).toBe('INVALID_INPUT');
    expect(code(() => lz77Decompress(new Uint8Array([0])))).toBe('INVALID_INPUT');
    expect(code(() => lz77Decompress(new Uint8Array([1, 1])))).toBe('INVALID_INPUT');
    expect(code(() => lz77Compress(bytes('a'), 256))).toBe('OUT_OF_RANGE');
    expect(code(() => rleDecode(new Uint8Array([1])))).toBe('INVALID_INPUT');
  });
  it('huffman codes are deterministic and prefix-free', () => {
    const r = huffmanEncode(bytes('aabbbc'));
    expect([...r.codes.entries()].sort((a, b) => a[0] - b[0])).toEqual([
      [97, '11'],
      [98, '0'],
      [99, '10'],
    ]);
    expect(r.bitLength).toBe(2 * 2 + 3 * 1 + 2);
  });
});

describe('hashes — external reference values', () => {
  it('xxHash64 (Cyan4973 reference)', () => {
    expect(xxHash64('')).toBe(0xef46db3751d8e999n);
    expect(xxHash64('a'.repeat(40), 1n)).toBe(xxHash64(bytes('a'.repeat(40)), 1n));
  });
  it('SipHash-2-4 (reference vectors.h, key 00..0f)', () => {
    const key = Uint8Array.from({ length: 16 }, (_, i) => i);
    expect(sipHash24(key, new Uint8Array(0))).toBe(0x726fdb47dd0e0e31n);
    expect(
      sipHash24(
        key,
        Uint8Array.from({ length: 15 }, (_, i) => i),
      ),
    ).toBe(0xa129ca6149be45e5n);
    expect(code(() => sipHash24(new Uint8Array(8), ''))).toBe('INVALID_INPUT');
  });
});

describe('strings are code points', () => {
  it('counts an astral character once', () => {
    expect(levenshtein('😀', 'a')).toBe(1);
    expect(kmpSearch('😀a😀a', '😀a')).toEqual([0, 2]);
    expect(polynomialHash('😀')).toBe(0x1f600 - 96);
  });
  it('Aho–Corasick rebuilds idempotently and ignores empty patterns', () => {
    const ac = new AhoCorasick();
    ac.addPattern('');
    ac.addPattern('ab');
    ac.build();
    ac.build();
    expect(ac.search('xabab')).toEqual([
      { pattern: 'ab', index: 1 },
      { pattern: 'ab', index: 3 },
    ]);
    ac.addPattern('b');
    expect(ac.search('ab').map((m) => m.pattern)).toEqual(['ab', 'b']);
  });
});

describe('data structures', () => {
  it('Bloom withParams validates and has no false negatives', () => {
    const f = BloomFilter.withParams(128, 4);
    for (let i = 0; i < 20; i++) f.add(`k${i}`);
    for (let i = 0; i < 20; i++) expect(f.has(`k${i}`)).toBe(true);
    expect(f.size).toBe(128);
    expect(f.hashCount).toBe(4);
    expect(f.toBytes()).toHaveLength(16);
    expect(f.estimatedFPR).toBeGreaterThan(0);
    expect(code(() => BloomFilter.withParams(0, 1))).toBe('OUT_OF_RANGE');
    expect(code(() => new BloomFilter(0))).toBe('OUT_OF_RANGE');
  });
  it('HyperLogLog merge requires equal precision', () => {
    expect(code(() => new HyperLogLog(10).merge(new HyperLogLog(12)))).toBe('INVALID_INPUT');
  });
});

describe('graph algorithms added in v0.2.0', () => {
  const g = {
    nodes: 4,
    edges: [0, 1, 2, 3].map((i) => ({ from: i, to: (i + 1) % 4, weight: i + 1 })),
  };
  it('tarjanScc finds one cycle component', () => {
    expect(tarjanScc(g)).toEqual([[0, 1, 2, 3]]);
  });
  it('prim builds a spanning tree of n − 1 edges', () => {
    expect(prim(g).map((e) => e.weight)).toEqual([1, 2, 3]);
  });
  it('bellmanFord handles negative edges and detects negative cycles', () => {
    expect(bellmanFord({ nodes: 2, edges: [{ from: 0, to: 1, weight: -2 }] }, 0)).toEqual({
      distances: [0, -2],
      hasNegativeCycle: false,
    });
    const cyc = {
      nodes: 2,
      edges: [
        { from: 0, to: 1, weight: -1 },
        { from: 1, to: 0, weight: -1 },
      ],
    };
    expect(bellmanFord(cyc, 0).hasNegativeCycle).toBe(true);
  });
  it('dinic and bipartiteMatching', () => {
    expect(dinic(g, 0, 2)).toBe(1);
    expect(code(() => dinic({ nodes: 2, edges: [{ from: 0, to: 1, weight: -1 }] }, 0, 1))).toBe(
      'NEGATIVE_WEIGHT',
    );
    expect(
      bipartiteMatching(2, 2, [
        [0, 0],
        [0, 1],
        [1, 0],
      ]).size,
    ).toBe(2);
    expect(code(() => bipartiteMatching(1, 1, [[0, 2]]))).toBe('OUT_OF_RANGE');
  });
});

describe('geometry and ml changes', () => {
  it('convexHullGraham is an alias; hull of < 3 points is sorted', () => {
    expect(convexHullGraham).toBe(convexHull);
    expect(
      convexHull([
        { x: 2, y: 0 },
        { x: 1, y: 5 },
      ]),
    ).toEqual([
      { x: 1, y: 5 },
      { x: 2, y: 0 },
    ]);
    expect(code(() => closestPair([]))).toBe('EMPTY_INPUT');
  });
  it('batchCosine scores zero vectors as 0 and breaks ties by index', () => {
    expect(
      batchCosine(
        [1, 0],
        [
          [0, 0],
          [2, 0],
          [1, 0],
        ],
      ),
    ).toEqual([
      { index: 1, score: 1 },
      { index: 2, score: 1 },
      { index: 0, score: 0 },
    ]);
    expect(code(() => cosineSimilarity([1], [1, 2]))).toBe('INVALID_INPUT');
  });
  it('kmeans validates its input', () => {
    expect(code(() => kmeans([], 1))).toBe('EMPTY_INPUT');
    expect(code(() => kmeans([[1], [2, 3]], 1))).toBe('INVALID_INPUT');
    expect(kmeans([[0], [0], [10]], 2, { seed: 5n }).inertia).toBe(0);
  });
});

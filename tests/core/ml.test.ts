// LombokAlgoritma — ML Module Tests
// Apache-2.0 — @codinglombok

import { describe, expect, it } from 'vitest';
import { kmeans } from '../../src/ml/kmeans.js';
import {
  batchCosine,
  cosineSimilarity,
  dotProduct,
  jaccardSimilarity,
  l1Distance,
  l2Distance,
  normalize,
  pearson,
} from '../../src/ml/similarity.js';

describe('cosineSimilarity', () => {
  it('identical vectors = 1', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });
  it('orthogonal = 0', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });
  it('opposite = -1', () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });
  it('known value', () => {
    // [1,2,3] · [4,5,6] = 32 / (sqrt(14) * sqrt(77)) ≈ 0.9746
    expect(cosineSimilarity([1, 2, 3], [4, 5, 6])).toBeCloseTo(0.9746318, 5);
  });
  it('zero vector = 0', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
  });
});

describe('l2Distance', () => {
  it('same vector = 0', () => {
    expect(l2Distance([1, 2], [1, 2])).toBe(0);
  });
  it('known value', () => {
    expect(l2Distance([0, 0], [3, 4])).toBeCloseTo(5);
  });
  it('throws on length mismatch', () => {
    expect(() => l2Distance([1, 2], [1, 2, 3])).toThrow();
  });
});

describe('l1Distance', () => {
  it('basic', () => {
    expect(l1Distance([1, 2, 3], [4, 5, 6])).toBe(9);
  });
  it('same = 0', () => {
    expect(l1Distance([1, 2], [1, 2])).toBe(0);
  });
});

describe('dotProduct', () => {
  it('known value', () => {
    expect(dotProduct([1, 2, 3], [4, 5, 6])).toBe(32);
  });
  it('zero', () => {
    expect(dotProduct([1, 0], [0, 1])).toBe(0);
  });
});

describe('normalize', () => {
  it('unit length', () => {
    const v = normalize([3, 4]);
    expect(Math.sqrt(v[0]! ** 2 + v[1]! ** 2)).toBeCloseTo(1);
    expect(v[0]).toBeCloseTo(0.6);
    expect(v[1]).toBeCloseTo(0.8);
  });
  it('zero vector stays zero', () => {
    const v = normalize([0, 0]);
    expect(v[0]).toBe(0);
    expect(v[1]).toBe(0);
  });
});

describe('batchCosine', () => {
  it('returns sorted by score descending', () => {
    const q = [1, 0];
    const candidates = [
      [0, 1],
      [-1, 0],
      [1, 0],
      [0.7, 0.7],
    ];
    const results = batchCosine(q, candidates);
    expect(results[0]!.index).toBe(2); // [1,0] most similar
    expect(results[0]!.score).toBeCloseTo(1);
  });
});

describe('pearson', () => {
  it('perfect positive correlation', () => {
    expect(pearson([1, 2, 3, 4, 5], [2, 4, 6, 8, 10])).toBeCloseTo(1);
  });
  it('perfect negative correlation', () => {
    expect(pearson([1, 2, 3], [-1, -2, -3])).toBeCloseTo(-1);
  });
  it('no correlation', () => {
    // Σ(dx·dy) = 0 → r = 0 exactly. (The previous fixture [2,1,4,3] has r = 0.6.)
    const r = pearson([1, 2, 3, 4], [1, -1, -1, 1]);
    expect(r).toBe(0);
    expect(pearson([1, 2, 3, 4], [2, 1, 4, 3])).toBeCloseTo(0.6, 12);
  });
});

describe('jaccardSimilarity', () => {
  it('identical sets = 1', () => {
    const s = new Set(['a', 'b', 'c']);
    expect(jaccardSimilarity(s, s)).toBe(1);
  });
  it('disjoint sets = 0', () => {
    expect(jaccardSimilarity(new Set(['a']), new Set(['b']))).toBe(0);
  });
  it('partial overlap', () => {
    const a = new Set(['a', 'b', 'c']);
    const b = new Set(['b', 'c', 'd']);
    // |A∩B| = 2, |A∪B| = 4 → 0.5
    expect(jaccardSimilarity(a, b)).toBeCloseTo(0.5);
  });
});

describe('k-Means', () => {
  it('clusters 2D points', () => {
    const cluster1 = Array.from({ length: 20 }, () => [Math.random() * 0.5, Math.random() * 0.5]);
    const cluster2 = Array.from({ length: 20 }, () => [
      10 + Math.random() * 0.5,
      10 + Math.random() * 0.5,
    ]);
    const points = [...cluster1, ...cluster2];
    const result = kmeans(points, 2, { seed: 42n });
    expect(result.centroids).toHaveLength(2);
    expect(result.labels).toHaveLength(40);
    // All cluster1 points should share the same label
    const label0 = result.labels[0];
    expect(result.labels.slice(0, 20).every((l) => l === label0)).toBe(true);
  });
  it('single cluster', () => {
    const pts = [
      [1, 2],
      [1.1, 2.1],
      [0.9, 1.9],
    ];
    const r = kmeans(pts, 1, { seed: 1n });
    expect(r.labels.every((l) => l === 0)).toBe(true);
  });
  it('throws when k > points', () => {
    expect(() => kmeans([[1, 2]], 5)).toThrow();
  });
});

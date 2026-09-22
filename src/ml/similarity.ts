// LombokAlgoritma — Similarity & Distance Functions
// Apache-2.0 — @codinglombok
// DIPAKAI: LombokVector (cosine, L2, dot), LombokSimHash (Jaccard), LombokRAGFrameworks

import { InvalidInputError } from '../core/errors.js';

/** Dot product of two vectors */
export function dotProduct(a: Float64Array | number[], b: Float64Array | number[]): number {
  if (a.length !== b.length) throw new InvalidInputError('Vectors must have equal length');
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] as number) * (b[i] as number);
  return sum;
}

/** L2 norm (magnitude) of a vector */
export function l2Norm(v: Float64Array | number[]): number {
  let sum = 0;
  for (const x of v) sum += x * x;
  return Math.sqrt(sum);
}

/** Cosine similarity [-1, 1] */
export function cosineSimilarity(a: Float64Array | number[], b: Float64Array | number[]): number {
  const normA = l2Norm(a), normB = l2Norm(b);
  if (normA === 0 || normB === 0) return 0;
  return dotProduct(a, b) / (normA * normB);
}

/** L2 (Euclidean) distance */
export function l2Distance(a: Float64Array | number[], b: Float64Array | number[]): number {
  if (a.length !== b.length) throw new InvalidInputError('Vectors must have equal length');
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] as number) - (b[i] as number);
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/** L1 (Manhattan) distance */
export function l1Distance(a: Float64Array | number[], b: Float64Array | number[]): number {
  if (a.length !== b.length) throw new InvalidInputError('Vectors must have equal length');
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs((a[i] as number) - (b[i] as number));
  return sum;
}

/** Normalize a vector to unit length */
export function normalize(v: number[]): Float64Array {
  const norm = l2Norm(v);
  const out = new Float64Array(v.length);
  if (norm === 0) return out;
  for (let i = 0; i < v.length; i++) out[i] = (v[i] as number) / norm;
  return out;
}

/** Jaccard similarity: |A ∩ B| / |A ∪ B| for binary/set vectors */
export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  let intersection = 0;
  for (const x of a) if (b.has(x)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

/** Batch cosine: 1 query vs N candidates — returns sorted (index, score) pairs */
export function batchCosine(
  query: number[],
  candidates: number[][],
): Array<{ index: number; score: number }> {
  const normQ = l2Norm(query);
  if (normQ === 0) return candidates.map((_, i) => ({ index: i, score: 0 }));
  return candidates
    .map((c, i) => ({ index: i, score: dotProduct(query, c) / (normQ * l2Norm(c)) }))
    .sort((a, b) => b.score - a.score);
}

/** Pearson correlation coefficient */
export function pearson(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new InvalidInputError('Arrays must have equal length');
  const n = a.length;
  const meanA = a.reduce((s, x) => s + x, 0) / n;
  const meanB = b.reduce((s, x) => s + x, 0) / n;
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const da = (a[i] as number) - meanA, db = (b[i] as number) - meanB;
    num += da * db; denA += da * da; denB += db * db;
  }
  if (denA === 0 || denB === 0) return 0;
  return num / Math.sqrt(denA * denB);
}

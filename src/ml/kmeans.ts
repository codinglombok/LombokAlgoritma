// LombokAlgoritma — k-Means Clustering (k-means++ init)
// Apache-2.0 — @codinglombok
// O(nkdi) — n=points, k=clusters, d=dims, i=iterations

import { l2Distance, cosineSimilarity } from './similarity.js';
import { Xoshiro256pp } from '../core/rng.js';

export interface KMeansResult {
  centroids: number[][];
  labels: number[];
  iterations: number;
  inertia: number;
}

/** k-means++ initialization — better starting centroids */
function kmeansppInit(points: number[][], k: number, rng: Xoshiro256pp): number[][] {
  const n = points.length;
  const centroids: number[][] = [points[rng.nextInt(n)]!];
  while (centroids.length < k) {
    const dists = points.map(p => Math.min(...centroids.map(c => l2Distance(p, c) ** 2)));
    const total = dists.reduce((a, b) => a + b, 0);
    let r = rng.nextFloat() * total;
    for (let i = 0; i < n; i++) {
      r -= dists[i]!;
      if (r <= 0) { centroids.push(points[i]!); break; }
    }
    if (centroids.length < k) centroids.push(points[n-1]!);
  }
  return centroids;
}

/** k-Means clustering */
export function kmeans(
  points: number[][],
  k: number,
  { maxIter = 300, tol = 1e-4, seed }: { maxIter?: number; tol?: number; seed?: bigint } = {},
): KMeansResult {
  if (points.length === 0) throw new Error('Empty input');
  if (k > points.length) throw new Error('k > number of points');
  const rng = new Xoshiro256pp(seed);
  let centroids = kmeansppInit(points, k, rng);
  const n = points.length, d = points[0]!.length;
  let labels = new Array<number>(n).fill(0);
  let iter = 0;
  for (; iter < maxIter; iter++) {
    // Assignment step
    const newLabels = points.map(p => {
      let best = 0, bestDist = Infinity;
      for (let c = 0; c < k; c++) {
        const dist = l2Distance(p, centroids[c]!);
        if (dist < bestDist) { bestDist = dist; best = c; }
      }
      return best;
    });
    // Update step
    const newCentroids = Array.from({ length: k }, () => new Array<number>(d).fill(0));
    const counts = new Array<number>(k).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < d; j++) newCentroids[newLabels[i]!]![j]! += points[i]![j]!;
      counts[newLabels[i]!]!++;
    }
    let maxShift = 0;
    for (let c = 0; c < k; c++) {
      if (counts[c]! === 0) { newCentroids[c] = [...centroids[c]!]; continue; }
      for (let j = 0; j < d; j++) newCentroids[c]![j]! /= counts[c]!;
      maxShift = Math.max(maxShift, l2Distance(centroids[c]!, newCentroids[c]!));
    }
    labels = newLabels;
    centroids = newCentroids;
    if (maxShift < tol) break;
  }
  const inertia = points.reduce((s, p, i) => s + l2Distance(p, centroids[labels[i]!]!)**2, 0);
  return { centroids, labels, iterations: iter, inertia };
}

// LombokAlgoritma — k-means clustering (k-means++ initialisation, Lloyd iterations)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
// O(n·k·d·iterations).
import { EmptyInputError, InvalidInputError, OutOfRangeError } from '../core/errors.js';
import { Xoshiro256pp } from '../core/rng.js';

/** Result of {@link kmeans}. */
export interface KMeansResult {
  centroids: number[][];
  labels: number[];
  /** Number of Lloyd iterations performed (≤ maxIter). */
  iterations: number;
  /** Σ squared distance of every point to its centroid. */
  inertia: number;
}

/** Σ (aᵢ − bᵢ)², summed left to right. */
function sqDist(a: readonly number[], b: readonly number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] as number) - (b[i] as number);
    s += d * d;
  }
  return s;
}

/**
 * k-means++ seeding (SPEC §9.5, normative with the xoshiro256++ stream of `seed`):
 * first centroid = points[nextInt(n)]; then repeatedly D(i) = min over chosen centroids of the
 * squared distance, total = Σ D(i) (i ascending), r = nextFloat()·total, and the next centroid is
 * the first i with (r −= D(i)) ≤ 0 — or the last point when rounding leaves r > 0.
 */
function kmeansppInit(points: number[][], k: number, rng: Xoshiro256pp): number[][] {
  const n = points.length;
  const centroids: number[][] = [(points[rng.nextInt(n)] as number[]).slice()];
  const dists = points.map((p) => sqDist(p, centroids[0] as number[]));
  while (centroids.length < k) {
    let total = 0;
    for (const d of dists) total += d;
    let r = rng.nextFloat() * total;
    let pick = n - 1;
    for (let i = 0; i < n; i++) {
      r -= dists[i] as number;
      if (r <= 0) {
        pick = i;
        break;
      }
    }
    const c = (points[pick] as number[]).slice();
    centroids.push(c);
    for (let i = 0; i < n; i++) {
      const d = sqDist(points[i] as number[], c);
      if (d < (dists[i] as number)) dists[i] = d;
    }
  }
  return centroids;
}

/**
 * k-means clustering. Deterministic for a given `seed` (default = the xoshiro256++ default seed):
 * assignment picks the lowest-index centroid with the strictly smallest squared distance; the update
 * averages member coordinates (summed in point order, then divided by the count); an empty cluster
 * keeps its previous centroid. Stops after `maxIter` iterations or when every centroid moved by a
 * Euclidean distance < `tol`. SPEC §9.5.
 *
 * @throws RangeError for empty input, k < 1, k > n or points of unequal dimension
 */
export function kmeans(
  points: number[][],
  k: number,
  { maxIter = 300, tol = 1e-4, seed }: { maxIter?: number; tol?: number; seed?: bigint } = {},
): KMeansResult {
  const n = points.length;
  if (n === 0) throw new EmptyInputError('kmeans');
  if (!Number.isInteger(k) || k < 1 || k > n) throw new OutOfRangeError('kmeans: need 1 ≤ k ≤ n');
  const d = (points[0] as number[]).length;
  if (points.some((p) => p.length !== d))
    throw new InvalidInputError('kmeans: points of unequal dimension');
  const rng = seed === undefined ? new Xoshiro256pp() : new Xoshiro256pp(seed);
  let centroids = kmeansppInit(points, k, rng);
  let labels = new Array<number>(n).fill(0);
  let iter = 0;
  while (iter < maxIter) {
    iter++;
    labels = points.map((p) => {
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let c = 0; c < k; c++) {
        const dist = sqDist(p, centroids[c] as number[]);
        if (dist < bestDist) {
          bestDist = dist;
          best = c;
        }
      }
      return best;
    });
    const sums = Array.from({ length: k }, () => new Array<number>(d).fill(0));
    const counts = new Array<number>(k).fill(0);
    for (let i = 0; i < n; i++) {
      const c = labels[i] as number;
      const row = sums[c] as number[];
      const p = points[i] as number[];
      for (let j = 0; j < d; j++) row[j] = (row[j] as number) + (p[j] as number);
      counts[c] = (counts[c] as number) + 1;
    }
    let maxShift = 0;
    const next = sums.map((row, c) => {
      const cnt = counts[c] as number;
      if (cnt === 0) return (centroids[c] as number[]).slice();
      const nc = row.map((v) => v / cnt);
      const shift = Math.sqrt(sqDist(centroids[c] as number[], nc));
      if (shift > maxShift) maxShift = shift;
      return nc;
    });
    centroids = next;
    if (maxShift < tol) break;
  }
  let inertia = 0;
  for (let i = 0; i < n; i++) {
    inertia += sqDist(points[i] as number[], centroids[labels[i] as number] as number[]);
  }
  return { centroids, labels, iterations: iter, inertia };
}

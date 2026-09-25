// LombokAlgoritma — Closest pair of points (divide and conquer)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { EmptyInputError } from '../core/errors.js';
import type { Point2D } from './types.js';

const dist = (a: Point2D, b: Point2D): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Closest pair among ≥ 2 points: `[p, q, d]` with d = √(Δx² + Δy²). O(n log n).
 * The distance is normative (SPEC §7.3); which pair is returned on ties is not.
 * v0.1.x used `Math.hypot`, whose last bit differs between libm implementations.
 *
 * @throws RangeError with fewer than 2 points
 */
export function closestPair(points: readonly Point2D[]): [Point2D, Point2D, number] {
  if (points.length < 2) throw new EmptyInputError('closestPair (need ≥ 2 points)');
  const bruteForce = (pts: Point2D[]): [Point2D, Point2D, number] => {
    let best: [Point2D, Point2D, number] = [
      pts[0] as Point2D,
      pts[1] as Point2D,
      Number.POSITIVE_INFINITY,
    ];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = dist(pts[i] as Point2D, pts[j] as Point2D);
        if (d < best[2]) best = [pts[i] as Point2D, pts[j] as Point2D, d];
      }
    }
    return best;
  };
  const solve = (pts: Point2D[]): [Point2D, Point2D, number] => {
    if (pts.length <= 3) return bruteForce(pts);
    const mid = pts.length >> 1;
    const mx = (pts[mid] as Point2D).x;
    const left = solve(pts.slice(0, mid));
    const right = solve(pts.slice(mid));
    let best = left[2] <= right[2] ? left : right;
    const strip = pts.filter((p) => Math.abs(p.x - mx) < best[2]).sort((a, b) => a.y - b.y);
    for (let i = 0; i < strip.length; i++) {
      for (
        let j = i + 1;
        j < strip.length && (strip[j] as Point2D).y - (strip[i] as Point2D).y < best[2];
        j++
      ) {
        const d = dist(strip[i] as Point2D, strip[j] as Point2D);
        if (d < best[2]) best = [strip[i] as Point2D, strip[j] as Point2D, d];
      }
    }
    return best;
  };
  return solve([...points].sort((a, b) => (a.x !== b.x ? a.x - b.x : a.y - b.y)));
}

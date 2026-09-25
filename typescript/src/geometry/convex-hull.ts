// LombokAlgoritma — Convex hull (Andrew's monotone chain)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { cross } from './cross.js';
import type { Point2D } from './types.js';

/**
 * Convex hull in counter-clockwise order starting from the lowest (x, then y) point; collinear
 * boundary points and duplicates are dropped (a turn must be strictly counter-clockwise).
 * Inputs with fewer than 3 points are returned sorted by (x, y). O(n log n). SPEC §7.2.
 *
 * Exported as `convexHull`; `convexHullGraham` is kept as an alias (the v0.1 name — the algorithm
 * has always been the monotone-chain variant of Graham's scan).
 */
export function convexHull(points: readonly Point2D[]): Point2D[] {
  const pts = [...points].sort((a, b) => (a.x !== b.x ? a.x - b.x : a.y - b.y));
  if (pts.length < 3) return pts;
  const chain = (seq: Point2D[]): Point2D[] => {
    const out: Point2D[] = [];
    for (const p of seq) {
      while (
        out.length >= 2 &&
        cross(out[out.length - 2] as Point2D, out[out.length - 1] as Point2D, p) <= 0
      ) {
        out.pop();
      }
      out.push(p);
    }
    out.pop();
    return out;
  };
  const lower = chain(pts);
  const upper = chain(pts.slice().reverse());
  const hull = lower.concat(upper);
  // all points identical → both chains collapse to the same single point
  return hull.length === 2 && hull[0]?.x === hull[1]?.x && hull[0]?.y === hull[1]?.y
    ? [hull[0] as Point2D]
    : hull;
}

/** @deprecated alias of {@link convexHull} (v0.1 name); removed in v0.3.0. */
export const convexHullGraham = convexHull;

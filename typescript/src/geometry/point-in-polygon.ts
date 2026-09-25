// LombokAlgoritma — Point in polygon (even–odd ray casting)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import type { Point2D } from './types.js';

/**
 * `true` when `point` is inside the simple polygon (vertices in order, closing edge implied), by
 * the even–odd rule with a ray towards +x. Points exactly on the boundary may go either way, but
 * the result is deterministic: an edge (i, j) toggles when `(yᵢ > y) ≠ (yⱼ > y)` and
 * `x < (xⱼ − xᵢ)·(y − yᵢ)/(yⱼ − yᵢ) + xᵢ`, evaluated in that order (SPEC §7.4). O(n).
 */
export function pointInPolygon(point: Point2D, polygon: readonly Point2D[]): boolean {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i] as Point2D;
    const pj = polygon[j] as Point2D;
    if (pi.y > y !== pj.y > y && x < ((pj.x - pi.x) * (y - pi.y)) / (pj.y - pi.y) + pi.x) {
      inside = !inside;
    }
  }
  return inside;
}

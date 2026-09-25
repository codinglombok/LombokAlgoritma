// LombokAlgoritma — Bézier curve evaluation (de Casteljau)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { EmptyInputError } from '../core/errors.js';
import type { Point2D } from './types.js';

/**
 * Point of the Bézier curve with the given control points at parameter t, by de Casteljau:
 * each level replaces pᵢ with `pᵢ·(1 − t) + pᵢ₊₁·t` (SPEC §7.5). O(n²).
 *
 * @throws RangeError with no control points
 */
export function bezier(controlPoints: readonly Point2D[], t: number): Point2D {
  if (controlPoints.length === 0) throw new EmptyInputError('bezier (need ≥ 1 control point)');
  let pts = controlPoints.map((p) => ({ x: p.x, y: p.y }));
  const s = 1 - t;
  while (pts.length > 1) {
    const next: Point2D[] = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const p = pts[i] as Point2D;
      const q = pts[i + 1] as Point2D;
      next.push({ x: p.x * s + q.x * t, y: p.y * s + q.y * t });
    }
    pts = next;
  }
  return pts[0] as Point2D;
}

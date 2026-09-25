// LombokAlgoritma — 2-D cross product
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import type { Point2D } from './types.js';

/**
 * z-component of (A − O) × (B − O): > 0 when O→A→B turns counter-clockwise, < 0 clockwise,
 * 0 when collinear. Evaluated exactly as `(A.x − O.x)·(B.y − O.y) − (A.y − O.y)·(B.x − O.x)`
 * (SPEC §7.1).
 */
export function cross(O: Point2D, A: Point2D, B: Point2D): number {
  return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
}

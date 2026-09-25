// LombokAlgoritma — 2-D cross product (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::Point2D;

/// z-component of `(A − O) × (B − O)`, evaluated as `(A.x−O.x)·(B.y−O.y) − (A.y−O.y)·(B.x−O.x)`:
/// `> 0` counter-clockwise, `< 0` clockwise, `0` collinear.
pub fn cross(o: Point2D, a: Point2D, b: Point2D) -> f64 {
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}

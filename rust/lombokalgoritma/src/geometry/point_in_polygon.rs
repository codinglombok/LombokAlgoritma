// LombokAlgoritma — point in polygon, even–odd rule (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::Point2D;

/// `true` when `point` is inside the polygon (vertices in order, closing edge implied) by the
/// even–odd rule with a ray towards +x: edge `(i, j = i − 1)` toggles when `(yᵢ > y) ≠ (yⱼ > y)`
/// and `x < ((xⱼ − xᵢ)·(y − yᵢ))/(yⱼ − yᵢ) + xᵢ`. Boundary points are deterministic. O(n).
pub fn point_in_polygon(point: Point2D, polygon: &[Point2D]) -> bool {
    let (x, y) = (point.x, point.y);
    let mut inside = false;
    let n = polygon.len();
    for i in 0..n {
        let pi = polygon[i];
        let pj = polygon[if i == 0 { n - 1 } else { i - 1 }];
        if (pi.y > y) != (pj.y > y) && x < ((pj.x - pi.x) * (y - pi.y)) / (pj.y - pi.y) + pi.x {
            inside = !inside;
        }
    }
    inside
}

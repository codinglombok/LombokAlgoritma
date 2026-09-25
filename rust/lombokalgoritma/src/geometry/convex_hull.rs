// LombokAlgoritma — convex hull, Andrew's monotone chain (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::types::cmp_xy;
use super::{cross, Point2D};
use crate::sort::mergesort_by;
use alloc::vec::Vec;

fn chain<'a, I: Iterator<Item = &'a Point2D>>(seq: I) -> Vec<Point2D> {
    let mut out: Vec<Point2D> = Vec::new();
    for &p in seq {
        while out.len() >= 2 && cross(out[out.len() - 2], out[out.len() - 1], p) <= 0.0 {
            out.pop();
        }
        out.push(p);
    }
    out.pop();
    out
}

/// Convex hull in counter-clockwise order from the lowest `(x, y)` point; collinear boundary
/// points and duplicates are dropped (turns must be strictly counter-clockwise). Fewer than 3
/// points are returned sorted; all-identical points give a single point. O(n log n).
pub fn convex_hull(points: &[Point2D]) -> Vec<Point2D> {
    let mut pts = points.to_vec();
    mergesort_by(&mut pts, cmp_xy);
    if pts.len() < 3 {
        return pts;
    }
    let mut hull = chain(pts.iter());
    hull.extend(chain(pts.iter().rev()));
    #[allow(clippy::float_cmp)]
    if hull.len() == 2 && hull[0].x == hull[1].x && hull[0].y == hull[1].y {
        hull.truncate(1);
    }
    hull
}

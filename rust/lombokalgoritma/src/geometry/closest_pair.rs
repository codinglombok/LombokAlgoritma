// LombokAlgoritma — closest pair of points (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::types::cmp_xy;
use super::Point2D;
use crate::num::{abs, sqrt};
use crate::sort::mergesort_by;
use crate::{Error, Result};
use alloc::vec::Vec;
use core::cmp::Ordering;

fn dist(a: Point2D, b: Point2D) -> f64 {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    sqrt(dx * dx + dy * dy)
}

type Best = (Point2D, Point2D, f64);

fn brute(pts: &[Point2D]) -> Best {
    let mut best = (pts[0], pts[1], f64::INFINITY);
    for i in 0..pts.len() {
        for j in i + 1..pts.len() {
            let d = dist(pts[i], pts[j]);
            if d < best.2 {
                best = (pts[i], pts[j], d);
            }
        }
    }
    best
}

fn solve(pts: &[Point2D]) -> Best {
    if pts.len() <= 3 {
        return brute(pts);
    }
    let mid = pts.len() >> 1;
    let mx = pts[mid].x;
    let left = solve(&pts[..mid]);
    let right = solve(&pts[mid..]);
    let mut best = if left.2 <= right.2 { left } else { right };
    let mut strip: Vec<Point2D> = pts
        .iter()
        .copied()
        .filter(|p| abs(p.x - mx) < best.2)
        .collect();
    mergesort_by(&mut strip, |a, b| {
        let d = a.y - b.y;
        if d < 0.0 {
            Ordering::Less
        } else if d > 0.0 {
            Ordering::Greater
        } else {
            Ordering::Equal
        }
    });
    for i in 0..strip.len() {
        let mut j = i + 1;
        while j < strip.len() && strip[j].y - strip[i].y < best.2 {
            let d = dist(strip[i], strip[j]);
            if d < best.2 {
                best = (strip[i], strip[j], d);
            }
            j += 1;
        }
    }
    best
}

/// Closest pair among ≥ 2 points: `(p, q, d)` with `d = √(Δx·Δx + Δy·Δy)` (not `hypot`).
/// Divide and conquer, O(n log n). Only the distance is normative on ties.
///
/// # Errors
/// [`Error::EmptyInput`] with fewer than 2 points.
pub fn closest_pair(points: &[Point2D]) -> Result<(Point2D, Point2D, f64)> {
    if points.len() < 2 {
        return Err(Error::EmptyInput);
    }
    let mut pts = points.to_vec();
    mergesort_by(&mut pts, cmp_xy);
    Ok(solve(&pts))
}

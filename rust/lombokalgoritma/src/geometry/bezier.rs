// LombokAlgoritma — Bézier curve evaluation, de Casteljau (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use super::Point2D;
use crate::{Error, Result};
use alloc::vec::Vec;

/// Point of the Bézier curve with the given control points at parameter `t` (de Casteljau):
/// each level replaces `pᵢ` by `pᵢ·s + pᵢ₊₁·t` with `s = 1 − t`. O(n²).
///
/// # Errors
/// [`Error::EmptyInput`] without control points.
pub fn bezier(control_points: &[Point2D], t: f64) -> Result<Point2D> {
    if control_points.is_empty() {
        return Err(Error::EmptyInput);
    }
    let s = 1.0 - t;
    let mut pts: Vec<Point2D> = control_points.to_vec();
    while pts.len() > 1 {
        pts = pts
            .windows(2)
            .map(|w| Point2D::new(w[0].x * s + w[1].x * t, w[0].y * s + w[1].y * t))
            .collect();
    }
    Ok(pts[0])
}

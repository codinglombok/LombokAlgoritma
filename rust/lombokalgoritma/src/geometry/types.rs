// LombokAlgoritma — geometry types
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

/// A point (or vector) in the plane.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Point2D {
    /// x coordinate.
    pub x: f64,
    /// y coordinate.
    pub y: f64,
}

impl Point2D {
    /// Point `(x, y)`.
    pub const fn new(x: f64, y: f64) -> Self {
        Point2D { x, y }
    }
}

/// ECMAScript comparator `a.x − b.x || a.y − b.y` mapped to an `Ordering` (NaN → `Equal`).
pub(crate) fn cmp_xy(a: &Point2D, b: &Point2D) -> core::cmp::Ordering {
    let ord = |d: f64| {
        if d < 0.0 {
            core::cmp::Ordering::Less
        } else if d > 0.0 {
            core::cmp::Ordering::Greater
        } else {
            core::cmp::Ordering::Equal
        }
    };
    #[allow(clippy::float_cmp)]
    if a.x != b.x {
        ord(a.x - b.x)
    } else {
        ord(a.y - b.y)
    }
}

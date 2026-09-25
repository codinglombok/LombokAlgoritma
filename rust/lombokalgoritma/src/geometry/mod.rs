// LombokAlgoritma — computational geometry (SPEC §13.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Planar geometry on [`Point2D`] with the float evaluation order fixed by the SPEC.
mod bezier;
mod closest_pair;
mod convex_hull;
mod cross;
mod point_in_polygon;
mod types;

pub use bezier::bezier;
pub use closest_pair::closest_pair;
pub use convex_hull::convex_hull;
pub use cross::cross;
pub use point_in_polygon::point_in_polygon;
pub use types::Point2D;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Error;
    use alloc::vec;
    use alloc::vec::Vec;

    fn p(x: f64, y: f64) -> Point2D {
        Point2D::new(x, y)
    }

    #[test]
    fn cross_and_hull() {
        assert_eq!(cross(p(0.0, 0.0), p(1.0, 0.0), p(0.0, 1.0)), 1.0);
        assert_eq!(cross(p(1.0, 1.0), p(2.0, 2.0), p(3.0, 3.0)), 0.0);
        assert!(convex_hull(&[]).is_empty());
        assert_eq!(
            convex_hull(&[p(2.0, 1.0), p(1.0, 1.0)]),
            vec![p(1.0, 1.0), p(2.0, 1.0)]
        );
        assert_eq!(convex_hull(&[p(1.0, 1.0); 4]), vec![p(1.0, 1.0)]);
        let sq = [
            p(0.0, 0.0),
            p(2.0, 2.0),
            p(1.0, 1.0),
            p(2.0, 0.0),
            p(0.0, 2.0),
            p(1.0, 0.0),
        ];
        assert_eq!(
            convex_hull(&sq),
            vec![p(0.0, 0.0), p(2.0, 0.0), p(2.0, 2.0), p(0.0, 2.0)]
        );
        let line = [p(0.0, 0.0), p(1.0, 1.0), p(2.0, 2.0)];
        assert_eq!(convex_hull(&line), vec![p(0.0, 0.0), p(2.0, 2.0)]);
    }

    #[test]
    fn closest() {
        assert_eq!(closest_pair(&[p(1.0, 1.0)]), Err(Error::EmptyInput));
        assert_eq!(closest_pair(&[p(0.0, 0.0), p(3.0, 4.0)]).unwrap().2, 5.0);
        let pts = [
            p(0.0, 0.0),
            p(5.0, 5.0),
            p(1.0, 1.0),
            p(9.0, 9.0),
            p(1.5, 1.5),
        ];
        assert_eq!(
            closest_pair(&pts).unwrap().2,
            core::f64::consts::FRAC_1_SQRT_2
        );
        let mut s = 5u64;
        let many: Vec<Point2D> = (0..300)
            .map(|_| {
                s = s.wrapping_mul(6_364_136_223_846_793_005).wrapping_add(1);
                p(
                    ((s >> 20) % 2000) as f64 - 1000.0,
                    ((s >> 40) % 2000) as f64 - 1000.0,
                )
            })
            .collect();
        let mut best = f64::INFINITY;
        for i in 0..many.len() {
            for j in i + 1..many.len() {
                let (dx, dy) = (many[i].x - many[j].x, many[i].y - many[j].y);
                best = best.min((dx * dx + dy * dy).sqrt());
            }
        }
        assert_eq!(closest_pair(&many).unwrap().2, best);
    }

    #[test]
    fn polygon_and_bezier() {
        let sq = [p(0.0, 0.0), p(10.0, 0.0), p(10.0, 10.0), p(0.0, 10.0)];
        assert!(point_in_polygon(p(5.0, 5.0), &sq));
        assert!(!point_in_polygon(p(15.0, 5.0), &sq));
        assert!(!point_in_polygon(p(5.0, 5.0), &[]));
        let ctrl = [p(0.0, 0.0), p(1.0, 2.0), p(3.0, 3.0), p(4.0, 0.0)];
        assert_eq!(bezier(&ctrl, 0.0), Ok(p(0.0, 0.0)));
        assert_eq!(bezier(&ctrl, 0.25), Ok(p(0.906_25, 1.265_625)));
        assert_eq!(bezier(&[p(7.0, 8.0)], 0.5), Ok(p(7.0, 8.0)));
        assert_eq!(bezier(&[], 0.5), Err(Error::EmptyInput));
        assert_eq!(Point2D::default(), p(0.0, 0.0));
    }
}

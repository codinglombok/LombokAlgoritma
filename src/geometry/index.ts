export interface Point2D {
  x: number;
  y: number;
}

/** Cross product of vectors OA and OB */
export function cross(O: Point2D, A: Point2D, B: Point2D): number {
  return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
}

/** Graham scan convex hull. O(n log n). */
export function convexHullGraham(points: Point2D[]): Point2D[] {
  const n = points.length;
  if (n < 3) return [...points];
  const pts = [...points].sort((a, b) => (a.x !== b.x ? a.x - b.x : a.y - b.y));
  const lower: Point2D[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: Point2D[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]!;
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0)
      upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

/** Closest pair of points. O(n log n) divide-and-conquer. */
export function closestPair(points: Point2D[]): [Point2D, Point2D, number] {
  function dist(a: Point2D, b: Point2D): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  function bruteForce(pts: Point2D[]): [Point2D, Point2D, number] {
    let best = Number.POSITIVE_INFINITY,
      p1 = pts[0]!,
      p2 = pts[1]!;
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const d = dist(pts[i]!, pts[j]!);
        if (d < best) {
          best = d;
          p1 = pts[i]!;
          p2 = pts[j]!;
        }
      }
    return [p1, p2, best];
  }
  const sorted = [...points].sort((a, b) => a.x - b.x);
  function solve(pts: Point2D[]): [Point2D, Point2D, number] {
    if (pts.length <= 3) return bruteForce(pts);
    const mid = pts.length >> 1,
      mx = pts[mid]!.x;
    const [l1, l2, ld] = solve(pts.slice(0, mid));
    const [r1, r2, rd] = solve(pts.slice(mid));
    let [best1, best2, d] = ld < rd ? [l1, l2, ld] : [r1, r2, rd];
    const strip = pts.filter((p) => Math.abs(p.x - mx) < d).sort((a, b) => a.y - b.y);
    for (let i = 0; i < strip.length; i++)
      for (let j = i + 1; j < strip.length && strip[j]!.y - strip[i]!.y < d; j++) {
        const dd = dist(strip[i]!, strip[j]!);
        if (dd < d) {
          d = dd;
          best1 = strip[i]!;
          best2 = strip[j]!;
        }
      }
    return [best1, best2, d];
  }
  return solve(sorted);
}

/** Point in polygon — ray casting algorithm. */
export function pointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i]!.x,
      yi = polygon[i]!.y;
    const xj = polygon[j]!.x,
      yj = polygon[j]!.y;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Bezier curve point at parameter t ∈ [0,1] */
export function bezier(controlPoints: Point2D[], t: number): Point2D {
  let pts = [...controlPoints];
  while (pts.length > 1) {
    pts = pts.slice(0, -1).map((p, i) => ({
      x: p.x * (1 - t) + pts[i + 1]!.x * t,
      y: p.y * (1 - t) + pts[i + 1]!.y * t,
    }));
  }
  return pts[0]!;
}

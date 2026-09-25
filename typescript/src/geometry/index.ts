// LombokAlgoritma — Geometry module (one file per algorithm)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

export { bezier } from './bezier.js';
export { closestPair } from './closest-pair.js';
// eslint-disable-next-line @typescript-eslint/no-deprecated -- deprecated alias kept until v0.3.0 (UPGRADE.md)
export { convexHull, convexHullGraham } from './convex-hull.js';
export { cross } from './cross.js';
export { pointInPolygon } from './point-in-polygon.js';
export type { Point2D } from './types.js';

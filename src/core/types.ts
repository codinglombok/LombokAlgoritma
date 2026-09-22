// LombokAlgoritma — Core Type Definitions
// Apache-2.0 — @codinglombok

/** Anything that can be compared for ordering */
export type Comparable<T> = {
  compareTo(other: T): number; // negative = this < other, 0 = equal, positive = this > other
};

/** Primitive types that support < > === natively */
export type Ordered = number | bigint | string;

/** Compare function (standard JS/TS convention) */
export type CompareFn<T> = (a: T, b: T) => number;

/** Default comparator for Ordered types */
export function defaultCompareFn<T extends Ordered>(a: T, b: T): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Key extractor for sort/search on objects */
export type KeyFn<T, K extends Ordered> = (item: T) => K;

/** Hash function interface */
export type HashFn<T> = (item: T) => number;

/** Equality check */
export type EqFn<T> = (a: T, b: T) => boolean;

/** Result type — avoid exceptions for expected failures */
export type Result<T, E = AlgoError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

import type { AlgoError } from './errors.js';

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E extends AlgoError>(error: E): Result<never, E> {
  return { ok: false, error };
}

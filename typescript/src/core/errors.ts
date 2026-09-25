// LombokAlgoritma — error types
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//
// Every error the library throws is an AlgoError whose `code` is one of the canonical codes of
// SPEC §2 — identical in every port. Programs MUST branch on `code`, never on the message text.
// (v0.1.x threw plain RangeError/Error for most of these.)

/** Canonical error codes (SPEC §2). */
export type ErrorCode =
  | 'INVALID_INPUT'
  | 'OUT_OF_RANGE'
  | 'EMPTY_INPUT'
  | 'NEGATIVE_WEIGHT'
  | 'NO_INVERSE'
  | 'NOT_COPRIME'
  | 'OVERFLOW'
  | 'OUT_OF_BOUNDS'
  | 'UNSUPPORTED';

export class AlgoError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AlgoError';
  }
}

/** Index outside a container. */
export class OutOfBoundsError extends AlgoError {
  constructor(index: number, length: number) {
    super('OUT_OF_BOUNDS', `Index ${index} out of bounds [0, ${length})`);
    this.name = 'OutOfBoundsError';
  }
}

/** Integer overflow in a checked operation. */
export class OverflowError extends AlgoError {
  constructor(operation: string, value: bigint | number) {
    super('OVERFLOW', `Integer overflow in ${operation}: ${String(value)}`);
    this.name = 'OverflowError';
  }
}

/** Malformed input: shape/length mismatch, malformed encoded stream, wrong key size. */
export class InvalidInputError extends AlgoError {
  constructor(message: string) {
    super('INVALID_INPUT', message);
    this.name = 'InvalidInputError';
  }
}

/** Too few elements for the operation. */
export class EmptyInputError extends AlgoError {
  constructor(context: string) {
    super('EMPTY_INPUT', `Not enough input elements for ${context}`);
    this.name = 'EmptyInputError';
  }
}

/** A numeric parameter or element outside its permitted range. */
export class OutOfRangeError extends AlgoError {
  constructor(message: string) {
    super('OUT_OF_RANGE', message);
    this.name = 'OutOfRangeError';
  }
}

/** Negative edge weight / capacity where the algorithm requires ≥ 0. */
export class NegativeWeightError extends AlgoError {
  constructor(context: string) {
    super('NEGATIVE_WEIGHT', `${context}: negative edge weight`);
    this.name = 'NegativeWeightError';
  }
}

/** No modular inverse exists (gcd ≠ 1). */
export class NoInverseError extends AlgoError {
  constructor(message: string) {
    super('NO_INVERSE', message);
    this.name = 'NoInverseError';
  }
}

/** CRT moduli are not pairwise coprime. */
export class NotCoprimeError extends AlgoError {
  constructor(message: string) {
    super('NOT_COPRIME', message);
    this.name = 'NotCoprimeError';
  }
}

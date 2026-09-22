// LombokAlgoritma — Core Error Types
// Apache-2.0 — @codinglombok

export class AlgoError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AlgoError';
  }
}

export class OutOfBoundsError extends AlgoError {
  constructor(index: number, length: number) {
    super('OUT_OF_BOUNDS', `Index ${index} out of bounds [0, ${length})`);
    this.name = 'OutOfBoundsError';
  }
}

export class OverflowError extends AlgoError {
  constructor(operation: string, value: bigint | number) {
    super('OVERFLOW', `Integer overflow in ${operation}: ${String(value)}`);
    this.name = 'OverflowError';
  }
}

export class InvalidInputError extends AlgoError {
  constructor(message: string) {
    super('INVALID_INPUT', message);
    this.name = 'InvalidInputError';
  }
}

export class EmptyInputError extends AlgoError {
  constructor(context: string) {
    super('EMPTY_INPUT', `Empty input is not allowed in ${context}`);
    this.name = 'EmptyInputError';
  }
}

// LombokAlgoritma — HyperLogLog Cardinality Estimator
// Apache-2.0 — @codinglombok
// DIPAKAI: LombokSimHash (cardinality estimation for LSH buckets)
// Estimates distinct count with ~2% error using O(m) space

import { InvalidInputError } from '../core/errors.js';
import { wrapMulU32 } from '../core/safe-int.js';
import { fnv1a32 } from '../string/hash/fnv1a.js';

/**
 * MurmurHash3 fmix32 finalizer. FNV-1a alone has weak avalanche in its high bits
 * for short, similar keys ("x1", "x2", …); since HLL takes the register index from
 * the TOP b bits, raw FNV-1a clusters keys into few registers and biases the estimate.
 */
function fmix32(h: number): number {
  let x = h >>> 0;
  x ^= x >>> 16;
  x = wrapMulU32(x, 0x85ebca6b);
  x ^= x >>> 13;
  x = wrapMulU32(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return x >>> 0;
}

export class HyperLogLog {
  private registers: Uint8Array;
  private readonly b: number; // number of register bits
  private readonly m: number; // number of registers = 2^b

  /** @param b precision (4-16). More = more accurate, more memory. 14 → ~0.8% error */
  constructor(b = 14) {
    this.b = Math.min(16, Math.max(4, b));
    this.m = 1 << this.b;
    this.registers = new Uint8Array(this.m);
  }

  add(item: string): void {
    const h = fmix32(fnv1a32(item));
    const j = h >>> (32 - this.b); // register index = top b bits
    const w = (h << this.b) >>> 0; // remaining (32 - b) bits, left-aligned
    // rho = position of the leftmost 1-bit in w (1-based), capped at 32 - b + 1
    const rho = w === 0 ? 32 - this.b + 1 : Math.clz32(w) + 1;
    if (rho > (this.registers[j] ?? 0)) this.registers[j] = rho;
  }

  /** Estimate cardinality */
  count(): number {
    const m = this.m;
    const alpha = m === 16 ? 0.673 : m === 32 ? 0.697 : m === 64 ? 0.709 : 0.7213 / (1 + 1.079 / m);
    let sum = 0;
    let zeros = 0;
    for (const r of this.registers) {
      sum += 2 ** -r;
      if (r === 0) zeros++;
    }
    let estimate = (alpha * m * m) / sum;
    // Small-range bias correction (linear counting), Flajolet et al. 2007 §4
    if (estimate <= 2.5 * m) {
      if (zeros > 0) estimate = m * Math.log(m / zeros);
    } else if (estimate > 2 ** 32 / 30) {
      // Large-range correction for 32-bit hash collisions
      estimate = -(2 ** 32) * Math.log(1 - estimate / 2 ** 32);
    }
    return Math.round(estimate);
  }

  /** Copy of the 2^b registers (one byte each, index order) — SPEC §8.2. */
  registersBytes(): Uint8Array {
    return this.registers.slice();
  }

  /** Merge two HyperLogLog estimators (union cardinality) */
  merge(other: HyperLogLog): HyperLogLog {
    if (this.b !== other.b) throw new InvalidInputError('HyperLogLog.merge: different precision');
    const result = new HyperLogLog(this.b);
    for (let i = 0; i < this.m; i++)
      result.registers[i] = Math.max(this.registers[i] ?? 0, other.registers[i] ?? 0);
    return result;
  }
}

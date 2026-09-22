// LombokAlgoritma — HyperLogLog Cardinality Estimator
// Apache-2.0 — @codinglombok
// DIPAKAI: LombokSimHash (cardinality estimation for LSH buckets)
// Estimates distinct count with ~2% error using O(m) space

import { fnv1a32 } from '../string/string-hash.js';

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
    const h = fnv1a32(item);
    const j = h >>> (32 - this.b);             // register index
    const w = (h << this.b) >>> this.b;        // remaining bits
    const rho = w === 0 ? 32 - this.b + 1 : Math.clz32(w) - this.b + 1;
    if (rho > this.registers[j]!) this.registers[j] = rho;
  }

  /** Estimate cardinality */
  count(): number {
    const m = this.m;
    const alpha = m === 16 ? 0.673 : m === 32 ? 0.697 : m === 64 ? 0.709 : 0.7213 / (1 + 1.079 / m);
    let sum = 0;
    let zeros = 0;
    for (const r of this.registers) { sum += Math.pow(2, -r); if (r === 0) zeros++; }
    let estimate = alpha * m * m / sum;
    // Small range correction
    if (estimate <= 2.5 * m && zeros > 0) estimate = m * Math.log(m / zeros);
    // Large range correction
    else if (estimate > (1 / 30) * Math.pow(2, 32)) estimate = -Math.pow(2, 32) * Math.log(1 - estimate / Math.pow(2, 32));
    return Math.round(estimate);
  }

  /** Merge two HyperLogLog estimators (union cardinality) */
  merge(other: HyperLogLog): HyperLogLog {
    if (this.b !== other.b) throw new Error('Cannot merge HyperLogLogs with different precision');
    const result = new HyperLogLog(this.b);
    for (let i = 0; i < this.m; i++) result.registers[i] = Math.max(this.registers[i]!, other.registers[i]!);
    return result;
  }
}

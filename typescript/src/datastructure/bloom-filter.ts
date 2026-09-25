// LombokAlgoritma — Bloom filter
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
// DIPAKAI: LombokSimHash (dedup pre-filter)
// Space-efficient probabilistic set — O(k) insert/lookup, no false negatives.
import { OutOfRangeError } from '../core/errors.js';
import { fnv1a32, murmurHash3_32 } from '../string/hash/index.js';

/**
 * Bloom filter with m bits and k hash functions using Kirsch–Mitzenmacher double hashing
 * (SPEC §8.1, normative):
 *   h1 = FNV-1a-32(item), h2 = MurmurHash3_x86_32(item, seed 0x9747b28c)   (UTF-8 bytes)
 *   pos_i = (h1 + i·h2) mod m, i = 0 … k − 1   (exact integer arithmetic)
 *   bit p is bit (p mod 8) — LSB first — of byte ⌊p / 8⌋.
 */
export class BloomFilter {
  private readonly bits: Uint8Array;
  private readonly k: number;
  private readonly m: number;

  /**
   * Size the filter for `expectedItems` at `falsePositiveRate`:
   * m = ⌈−n·ln p / ln²2⌉, k = max(1, round(m/n · ln 2)). These use `Math.log`, so m and k are
   * *not* normative across ports — use {@link BloomFilter.withParams} for portable filters.
   */
  constructor(expectedItems: number, falsePositiveRate = 0.01) {
    if (!(expectedItems >= 1) || !(falsePositiveRate > 0 && falsePositiveRate < 1)) {
      throw new OutOfRangeError(
        'BloomFilter: need expectedItems ≥ 1 and 0 < falsePositiveRate < 1',
      );
    }
    const m = Math.ceil((-expectedItems * Math.log(falsePositiveRate)) / (Math.LN2 * Math.LN2));
    const k = Math.max(1, Math.round((m / expectedItems) * Math.LN2));
    this.m = m;
    this.k = k;
    this.bits = new Uint8Array(Math.ceil(m / 8));
  }

  /** Filter with exactly `m` bits (1 ≤ m < 2^32) and `k` hash functions (1 ≤ k ≤ 64). */
  static withParams(m: number, k: number): BloomFilter {
    if (!Number.isInteger(m) || m < 1 || m >= 2 ** 32 || !Number.isInteger(k) || k < 1 || k > 64) {
      throw new OutOfRangeError('BloomFilter.withParams: need integer 1 ≤ m < 2^32 and 1 ≤ k ≤ 64');
    }
    const f = Object.create(BloomFilter.prototype) as BloomFilter;
    Object.assign(f, { m, k, bits: new Uint8Array(Math.ceil(m / 8)) });
    return f;
  }

  private positions(item: string | Uint8Array): number[] {
    const h1 = fnv1a32(item);
    const h2 = murmurHash3_32(item, 0x9747b28c);
    const out = new Array<number>(this.k);
    // h1 + i·h2 < 2^32 · 65 < 2^53: exact in doubles
    for (let i = 0; i < this.k; i++) out[i] = (h1 + i * h2) % this.m;
    return out;
  }

  add(item: string | Uint8Array): void {
    for (const p of this.positions(item))
      this.bits[p >> 3] = (this.bits[p >> 3] as number) | (1 << (p & 7));
  }

  /** `false` ⇒ definitely absent; `true` ⇒ probably present. */
  has(item: string | Uint8Array): boolean {
    for (const p of this.positions(item)) {
      if ((((this.bits[p >> 3] as number) >> (p & 7)) & 1) === 0) return false;
    }
    return true;
  }

  /** Number of set bits. */
  get setBits(): number {
    let c = 0;
    for (const b of this.bits) c += popcount8(b);
    return c;
  }

  /** Estimated false-positive rate from the fill ratio: (setBits / m)^k. */
  get estimatedFPR(): number {
    return (this.setBits / this.m) ** this.k;
  }

  /** Copy of the bit array (SPEC §8.1 layout). */
  toBytes(): Uint8Array {
    return this.bits.slice();
  }

  get size(): number {
    return this.m;
  }

  get hashCount(): number {
    return this.k;
  }
}

function popcount8(n: number): number {
  let x = n - ((n >> 1) & 0x55);
  x = (x & 0x33) + ((x >> 2) & 0x33);
  return (x + (x >> 4)) & 0x0f;
}

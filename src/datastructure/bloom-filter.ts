// LombokAlgoritma — Bloom Filter
// Apache-2.0 — @codinglombok
// DIPAKAI: LombokSimHash (dedup pre-filter), LombokEncryptDecrypt (key existence)
// Space-efficient probabilistic set — O(1) insert/lookup, no false negatives

import { fnv1a32, murmurHash3_32 } from '../string/string-hash.js';

export class BloomFilter {
  private readonly bits: Uint8Array;
  private readonly k: number; // number of hash functions
  private readonly m: number; // bit array size

  /**
   * @param expectedItems expected number of items
   * @param falsePositiveRate target false positive rate (e.g. 0.01 = 1%)
   */
  constructor(expectedItems: number, falsePositiveRate = 0.01) {
    // Optimal bit array size: m = -n*ln(p) / (ln(2)^2)
    this.m = Math.ceil((-expectedItems * Math.log(falsePositiveRate)) / (Math.LN2 * Math.LN2));
    // Optimal k: k = (m/n) * ln(2)
    this.k = Math.max(1, Math.round((this.m / expectedItems) * Math.LN2));
    this.bits = new Uint8Array(Math.ceil(this.m / 8));
  }

  private hashes(item: string): number[] {
    const h1 = fnv1a32(item);
    const h2 = murmurHash3_32(item, 0x9747b28c);
    // Double hashing: h_i(x) = h1(x) + i * h2(x)
    return Array.from({ length: this.k }, (_, i) => Math.abs((h1 + i * h2) % this.m));
  }

  add(item: string): void {
    for (const pos of this.hashes(item)) {
      this.bits[pos >> 3]! |= 1 << (pos & 7);
    }
  }

  has(item: string): boolean {
    for (const pos of this.hashes(item)) {
      if (!((this.bits[pos >> 3]! >> (pos & 7)) & 1)) return false;
    }
    return true;
  }

  /** Estimated false positive rate based on fill ratio */
  get estimatedFPR(): number {
    const setBits = this.bits.reduce((acc, b) => acc + popcount(b), 0);
    return (setBits / this.m) ** this.k;
  }

  get size(): number {
    return this.m;
  }
  get hashCount(): number {
    return this.k;
  }
}

function popcount(n: number): number {
  n = n - ((n >> 1) & 0x55);
  n = (n & 0x33) + ((n >> 2) & 0x33);
  return (n + (n >> 4)) & 0x0f;
}

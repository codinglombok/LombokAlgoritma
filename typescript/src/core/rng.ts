// LombokAlgoritma — Random Number Generators
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
// CSPRNG: Web Crypto `getRandomValues` (platform-provided).
// Non-crypto, deterministic: xoshiro256++ (seeded by SplitMix64) and PCG32 (PCG-XSH-RR 64/32).
// Deterministic generators are NOT suitable for secrets.

import { AlgoError, OutOfRangeError } from './errors.js';
const MASK64 = (1n << 64n) - 1n;

/** Cryptographically secure random bytes — uses the platform Web Crypto API. */
export function randomBytes(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  const c = (globalThis as { crypto?: { getRandomValues(a: Uint8Array): Uint8Array } }).crypto;
  if (c === undefined) {
    throw new AlgoError(
      'UNSUPPORTED',
      'randomBytes: globalThis.crypto.getRandomValues is unavailable',
    );
  }
  // getRandomValues is limited to 65536 bytes per call
  for (let off = 0; off < n; off += 65536) {
    c.getRandomValues(buf.subarray(off, Math.min(n, off + 65536)));
  }
  return buf;
}

/** Cryptographically secure random 32-bit unsigned integer. */
export function randomU32(): number {
  const b = randomBytes(4);
  return new DataView(b.buffer).getUint32(0, false);
}

/**
 * SplitMix64 — used to expand a 64-bit seed into generator state
 * (Steele, Lea, Flood 2014; reference: prng.di.unimi.it/splitmix64.c).
 */
export class SplitMix64 {
  private x: bigint;
  constructor(seed: bigint) {
    this.x = BigInt.asUintN(64, seed);
  }
  next(): bigint {
    this.x = (this.x + 0x9e3779b97f4a7c15n) & MASK64;
    let z = this.x;
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK64;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MASK64;
    return z ^ (z >> 31n);
  }
}

function rotl64(x: bigint, k: bigint): bigint {
  return ((x << k) | (x >> (64n - k))) & MASK64;
}

/**
 * xoshiro256++ — fast non-crypto PRNG (Blackman & Vigna, prng.di.unimi.it/xoshiro256plusplus.c).
 * Period 2^256 − 1. State is initialised with four successive SplitMix64 outputs of `seed`.
 */
export class Xoshiro256pp {
  private readonly s: BigUint64Array;

  constructor(seed = 0x123456789abcdef0n) {
    this.s = new BigUint64Array(4);
    const sm = new SplitMix64(seed);
    for (let i = 0; i < 4; i++) this.s[i] = sm.next();
  }

  /** Next 64-bit output as an unsigned bigint. */
  next(): bigint {
    const s = this.s;
    const s0 = s[0] ?? 0n;
    const s1 = s[1] ?? 0n;
    const s2 = s[2] ?? 0n;
    const s3 = s[3] ?? 0n;
    const result = (rotl64((s0 + s3) & MASK64, 23n) + s0) & MASK64;
    const t = (s1 << 17n) & MASK64;
    const n2 = s2 ^ s0;
    const n3 = s3 ^ s1;
    const n1 = s1 ^ n2;
    const n0 = s0 ^ n3;
    s[0] = n0;
    s[1] = n1;
    s[2] = n2 ^ t;
    s[3] = rotl64(n3, 45n);
    return result;
  }

  /** Random float in [0, 1): top 53 bits / 2^53. */
  nextFloat(): number {
    return Number(this.next() >> 11n) / 2 ** 53;
  }

  /** Unbiased random integer in [0, n) via rejection sampling (1 ≤ n ≤ 2^53 − 1). */
  nextInt(n: number): number {
    if (!Number.isInteger(n) || n < 1 || n > Number.MAX_SAFE_INTEGER) {
      throw new OutOfRangeError('nextInt: n must be an integer in [1, 2^53)');
    }
    const bn = BigInt(n);
    const threshold = (1n << 64n) % bn; // reject the low `threshold` values
    for (;;) {
      const r = this.next();
      if (r >= threshold) return Number(r % bn);
    }
  }
}

/**
 * PCG32 (PCG-XSH-RR, 64-bit state → 32-bit output), per the pcg-c reference
 * `pcg32_srandom_r(initstate, initseq)` (O'Neill 2014, pcg-random.org).
 */
export class Pcg32 {
  private state = 0n;
  private readonly inc: bigint;

  constructor(initState = 0x853c49e6748fea9bn, initSeq = 0xda3e39cb94b95bdbn) {
    this.inc = ((BigInt.asUintN(64, initSeq) << 1n) | 1n) & MASK64;
    this.step();
    this.state = (this.state + BigInt.asUintN(64, initState)) & MASK64;
    this.step();
  }

  private step(): void {
    this.state = (this.state * 6364136223846793005n + this.inc) & MASK64;
  }

  /** Next 32-bit unsigned output. */
  next(): number {
    const old = this.state;
    this.step();
    const xorshifted = Number((((old >> 18n) ^ old) >> 27n) & 0xffffffffn) >>> 0;
    const rot = Number(old >> 59n);
    return ((xorshifted >>> rot) | (xorshifted << ((32 - rot) & 31))) >>> 0;
  }

  /** Unbiased integer in [0, bound) — pcg32_boundedrand_r. */
  nextBounded(bound: number): number {
    if (!Number.isInteger(bound) || bound < 1 || bound > 0xffffffff) {
      throw new OutOfRangeError('nextBounded: bound must be an integer in [1, 2^32)');
    }
    const threshold = (0x100000000 - bound) % bound;
    for (;;) {
      const r = this.next();
      if (r >= threshold) return r % bound;
    }
  }

  /** Random float in [0, 1) with 32 bits of precision. */
  nextFloat(): number {
    return this.next() / 2 ** 32;
  }
}

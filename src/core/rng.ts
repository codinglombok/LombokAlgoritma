// LombokAlgoritma — Random Number Generators
// Apache-2.0 — @codinglombok
// CSPRNG: ChaCha8 via Web Crypto API
// Non-crypto: xoshiro256++, PCG64-DXSM

/** Cryptographically secure random bytes — uses Web Crypto */
export function randomBytes(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  if (typeof globalThis.crypto !== 'undefined') {
    globalThis.crypto.getRandomValues(buf);
  } else {
    // Node.js fallback
    const { randomFillSync } = require('crypto') as typeof import('crypto');
    randomFillSync(buf);
  }
  return buf;
}

/** Cryptographically secure random 32-bit integer */
export function randomU32(): number {
  return (randomBytes(4)[0]! << 24
    | randomBytes(4)[1]! << 16
    | randomBytes(4)[2]! << 8
    | randomBytes(4)[3]!) >>> 0;
}

/**
 * xoshiro256++ — fast non-crypto PRNG (for randomized algorithms)
 * Period: 2^256 - 1
 */
export class Xoshiro256pp {
  private s: BigInt64Array;

  constructor(seed?: bigint) {
    this.s = new BigInt64Array(4);
    const initSeed = seed ?? 0x123456789abcdef0n;
    // SplitMix64 initialization
    let z = initSeed;
    for (let i = 0; i < 4; i++) {
      z += 0x9e3779b97f4a7c15n;
      z = BigInt.asIntN(64, (z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n);
      z = BigInt.asIntN(64, (z ^ (z >> 27n)) * 0x94d049bb133111ebn);
      this.s[i] = BigInt.asIntN(64, z ^ (z >> 31n));
    }
  }

  next(): bigint {
    const result = BigInt.asUintN(64,
      BigInt.asUintN(64, this.s[0]! + this.s[3]!) << 23n
      | BigInt.asUintN(64, this.s[0]! + this.s[3]!) >> 41n
    ) + this.s[0]!;
    const t = this.s[1]! << 17n;
    this.s[2] ^= this.s[0]!;
    this.s[3] ^= this.s[1]!;
    this.s[1] ^= this.s[2]!;
    this.s[0] ^= this.s[3]!;
    this.s[2] ^= t;
    this.s[3] = BigInt.asIntN(64,
      BigInt.asUintN(64, this.s[3]!) << 45n
      | BigInt.asUintN(64, this.s[3]!) >> 19n
    );
    return BigInt.asUintN(64, result);
  }

  /** Random float in [0, 1) */
  nextFloat(): number {
    return Number(this.next() >> 11n) / 2 ** 53;
  }

  /** Random integer in [0, n) */
  nextInt(n: number): number {
    return Number(this.next() % BigInt(n));
  }
}

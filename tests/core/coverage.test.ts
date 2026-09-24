// LombokAlgoritma — unit tests for helpers and math modules without prior coverage
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { describe, expect, it } from 'vitest';
import {
  clz32,
  ctEqual,
  ctSelect32,
  ctz32,
  hammingDistance32,
  hammingDistanceBytes,
  nextPow2,
  popcount32,
  rotl32,
  rotr32,
} from '../../src/core/bit.js';
import {
  AlgoError,
  EmptyInputError,
  InvalidInputError,
  OutOfBoundsError,
  OverflowError,
} from '../../src/core/errors.js';
import {
  absDiff,
  alignUp,
  approxEq,
  ceilDiv,
  clamp,
  isPow2,
  isqrt,
  lerp,
} from '../../src/core/numeric.js';
import { randomBytes, randomU32 } from '../../src/core/rng.js';
import {
  addI32,
  addU32,
  assertSafeInt,
  mulSafe,
  satAddI32,
  wrapAddU32,
  wrapMulU32,
} from '../../src/core/safe-int.js';
import { defaultCompareFn, err, ok } from '../../src/core/types.js';
import { BloomFilter } from '../../src/datastructure/bloom-filter.js';
import { FenwickTree } from '../../src/datastructure/fenwick-tree.js';
import { type Complex, fft, realToComplex } from '../../src/math/fft.js';
import { gcd, gcdNum, lcm, lcmNum } from '../../src/math/gcd.js';
import { karatsuba } from '../../src/math/karatsuba.js';
import { matAdd, matCreate, matMul, matSub, strassenMul } from '../../src/math/matrix.js';
import { modAdd, modMul, modSub } from '../../src/math/modular.js';
import { intt, ntt, polyMulNTT } from '../../src/math/ntt.js';
import { factorize, pollardRho } from '../../src/math/pollard-rho.js';
import { segmentedSieve, sieve } from '../../src/math/sieve.js';
import { exponentialSearch, fibonacciSearch, ternarySearch } from '../../src/search/binary.js';
import { polynomialHash } from '../../src/string/string-hash.js';

const trialDivision = (n: number): number[] => {
  const f: number[] = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) {
      f.push(p);
      m /= p;
    }
  }
  if (m > 1) f.push(m);
  return f;
};

describe('core/bit', () => {
  it('popcount/clz/ctz/rotations against naive definitions', () => {
    for (const x of [0, 1, 2, 3, 0x80000000, 0xffffffff, 0x12345678, 0xdeadbeef]) {
      const naive = (x >>> 0).toString(2).replace(/0/g, '').length;
      expect(popcount32(x)).toBe(naive);
      expect(hammingDistance32(x, 0)).toBe(naive);
      expect(rotr32(rotl32(x, 7), 7)).toBe(x >>> 0);
    }
    expect(clz32(0)).toBe(32);
    expect(clz32(1)).toBe(31);
    expect(ctz32(0)).toBe(32);
    expect(ctz32(0x80000000)).toBe(31);
    expect(nextPow2(0)).toBe(1);
    expect(nextPow2(17)).toBe(32);
    expect(nextPow2(0x40000000)).toBe(0x40000000);
  });
  it('constant-time helpers', () => {
    expect(ctSelect32(1, 5, 9)).toBe(5);
    expect(ctSelect32(0, 5, 9)).toBe(9);
    expect(ctEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBe(1);
    expect(ctEqual(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).toBe(0);
    expect(ctEqual(new Uint8Array([1]), new Uint8Array([1, 3]))).toBe(0);
    expect(hammingDistanceBytes(new Uint8Array([0xff, 0]), new Uint8Array([0, 0]))).toBe(8);
    expect(() => hammingDistanceBytes(new Uint8Array(1), new Uint8Array(2))).toThrow();
  });
});

describe('core/numeric + safe-int + errors + types', () => {
  it('numeric', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(lerp(0, 10, 0.25)).toBe(2.5);
    expect(approxEq(0.1 + 0.2, 0.3)).toBe(true);
    expect(absDiff(3, 7)).toBe(4);
    expect(isPow2(64)).toBe(true);
    expect(isPow2(0)).toBe(false);
    for (let n = 0; n < 2000; n++) expect(isqrt(n)).toBe(Math.floor(Math.sqrt(n)));
    expect(isqrt(2 ** 52 + 1)).toBe(2 ** 26);
    expect(() => isqrt(-1)).toThrow(RangeError);
    expect(ceilDiv(7, 2)).toBe(4);
    expect(alignUp(13, 8)).toBe(16);
    expect(() => ceilDiv(1, 0)).toThrow(RangeError);
  });
  it('safe-int', () => {
    expect(addI32(1, 2)).toBe(3);
    expect(() => addI32(2 ** 31 - 1, 1)).toThrow(OverflowError);
    expect(satAddI32(2 ** 31 - 1, 5)).toBe(2 ** 31 - 1);
    expect(satAddI32(-(2 ** 31), -5)).toBe(-(2 ** 31));
    expect(satAddI32(1, 1)).toBe(2);
    expect(mulSafe(0, 5)).toBe(0);
    expect(mulSafe(3, 4)).toBe(12);
    expect(() => mulSafe(2 ** 40, 2 ** 40)).toThrow(OverflowError);
    expect(addU32(1, 2)).toBe(3);
    expect(() => addU32(0xffffffff, 1)).toThrow(OverflowError);
    expect(wrapAddU32(0xffffffff, 2)).toBe(1);
    expect(wrapMulU32(0xffffffff, 0xffffffff)).toBe(1);
    expect(wrapMulU32(0x12345678, 0x9abcdef0)).toBe(
      Number((0x12345678n * 0x9abcdef0n) & 0xffffffffn),
    );
    expect(() => {
      assertSafeInt(2 ** 60);
    }).toThrow(OverflowError);
    expect(() => {
      assertSafeInt(5);
    }).not.toThrow();
  });
  it('errors carry codes', () => {
    const cases: [AlgoError, string][] = [
      [new OutOfBoundsError(5, 3), 'OUT_OF_BOUNDS'],
      [new OverflowError('op', 1n), 'OVERFLOW'],
      [new InvalidInputError('bad'), 'INVALID_INPUT'],
      [new EmptyInputError('ctx'), 'EMPTY_INPUT'],
    ];
    for (const [e, code] of cases) {
      expect(e).toBeInstanceOf(AlgoError);
      expect(e.code).toBe(code);
    }
    expect(new AlgoError('X', 'm', 'cause').cause).toBe('cause');
  });
  it('types helpers', () => {
    expect(defaultCompareFn(1, 2)).toBe(-1);
    expect(defaultCompareFn('b', 'a')).toBe(1);
    expect(defaultCompareFn(3n, 3n)).toBe(0);
    expect(ok(1)).toEqual({ ok: true, value: 1 });
    const e = new InvalidInputError('x');
    expect(err(e)).toEqual({ ok: false, error: e });
  });
  it('CSPRNG wrappers', () => {
    expect(randomBytes(70_000)).toHaveLength(70_000);
    const u = randomU32();
    expect(Number.isInteger(u) && u >= 0 && u <= 0xffffffff).toBe(true);
  });
});

describe('math — number theory', () => {
  it('gcd/lcm (bigint and number)', () => {
    for (let a = -20; a <= 20; a++) {
      for (let b = -20; b <= 20; b++) {
        expect(gcd(BigInt(a), BigInt(b))).toBe(BigInt(gcdNum(a, b)));
      }
    }
    expect(lcm(-4n, 6n)).toBe(12n);
    expect(lcm(0n, 6n)).toBe(0n);
    expect(lcmNum(4, 6)).toBe(12);
    expect(lcmNum(0, 6)).toBe(0);
  });
  it('modular helpers', () => {
    expect(modAdd(5n, 9n, 7n)).toBe(0n);
    expect(modSub(2n, 5n, 7n)).toBe(4n);
    expect(modMul(6n, 6n, 7n)).toBe(1n);
  });
  it('karatsuba equals native multiply', () => {
    const xs = [0n, 7n, -123456789n, 10n ** 30n + 12345n, -(2n ** 200n) + 1n];
    for (const x of xs) for (const y of xs) expect(karatsuba(x, y)).toBe(x * y);
  });
  it('sieve / segmented sieve', () => {
    const p100 = sieve(100);
    expect(p100).toHaveLength(25);
    expect(sieve(1)).toEqual([]);
    expect(segmentedSieve(0, 100)).toEqual(p100);
    expect(segmentedSieve(90, 110)).toEqual([97, 101, 103, 107, 109]);
    expect(segmentedSieve(1_000_000, 1_000_100)).toEqual(
      sieve(1_000_100).filter((p) => p >= 1_000_000),
    );
  });
  it('factorize matches trial division for 2..3000 (v0.1.0 recursed forever on 25, 49, …)', () => {
    for (let n = 2; n < 3000; n++)
      expect(factorize(BigInt(n)).map(Number)).toEqual(trialDivision(n));
    expect(factorize(600851475143n)).toEqual([71n, 839n, 1471n, 6857n]);
    expect(factorize(1n)).toEqual([]);
    expect(factorize(-12n)).toEqual([2n, 2n, 3n]);
    expect(factorize((2n ** 31n - 1n) * (2n ** 31n - 1n))).toEqual([
      2n ** 31n - 1n,
      2n ** 31n - 1n,
    ]);
  });
  it('pollardRho returns a proper factor and rejects primes', () => {
    for (const n of [25n, 49n, 121n, 8051n, 10403n]) {
      const d = pollardRho(n);
      expect(d > 1n && d < n && n % d === 0n).toBe(true);
    }
    expect(pollardRho(1000n)).toBe(2n);
    expect(() => pollardRho(97n)).toThrow(RangeError);
    expect(() => pollardRho(3n)).toThrow(RangeError);
  });
});

describe('math — transforms and matrices', () => {
  it('fft round-trip and known spectrum', () => {
    const x = realToComplex([1, 2, 3, 4, 5]); // padded to 8
    expect(x).toHaveLength(8);
    const orig = x.map((c) => ({ ...c }));
    fft(x);
    expect(x[0]?.re).toBeCloseTo(15, 12);
    fft(x, true);
    x.forEach((c: Complex, i) => {
      expect(c.re).toBeCloseTo(orig[i]?.re ?? 0, 12);
      expect(c.im).toBeCloseTo(0, 12);
    });
    const three: Complex[] = [
      { re: 1, im: 0 },
      { re: 1, im: 0 },
      { re: 1, im: 0 },
    ];
    expect(() => {
      fft(three);
    }).toThrow(RangeError);
  });
  it('ntt round-trip and polynomial multiplication', () => {
    const a = [1n, 2n, 3n, 4n];
    expect(intt(ntt(a))).toEqual(a);
    // (1 + 2x + 3x²)(4 + 5x) = 4 + 13x + 22x² + 15x³
    expect(polyMulNTT([1n, 2n, 3n], [4n, 5n])).toEqual([4n, 13n, 22n, 15n]);
    expect(() => ntt([1n, 2n, 3n])).toThrow(RangeError);
    expect(() => ntt([1n, 2n], 7n)).not.toThrow();
    expect(() => ntt([1n, 2n, 3n, 4n], 7n)).toThrow(RangeError);
  });
  it('matrix ops and Strassen on non-power-of-two sizes', () => {
    expect(matCreate(2, 3, 1)).toEqual([
      [1, 1, 1],
      [1, 1, 1],
    ]);
    const A = [
      [1, 2],
      [3, 4],
    ];
    expect(matMul(A, A)).toEqual([
      [7, 10],
      [15, 22],
    ]);
    expect(matAdd(A, A)).toEqual([
      [2, 4],
      [6, 8],
    ]);
    expect(matSub(A, A)).toEqual([
      [0, 0],
      [0, 0],
    ]);
    expect(() => matMul([[1, 2]], [[1, 2]])).toThrow(RangeError);
    for (const n of [0, 1, 3, 64, 65, 67, 100, 128]) {
      const M = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => ((i * 7 + j) % 5) - 2),
      );
      expect(strassenMul(M, M)).toEqual(matMul(M, M));
    }
    expect(() => strassenMul([[1, 2]], [[1, 2]])).toThrow(RangeError);
  });
});

describe('search / string / datastructure extras', () => {
  it('exponential, fibonacci and ternary search', () => {
    const arr = Array.from({ length: 500 }, (_, i) => 3 * i);
    for (let i = 0; i < arr.length; i += 7) {
      expect(exponentialSearch(arr, 3 * i)).toBe(i);
      expect(fibonacciSearch(arr, 3 * i)).toBe(i);
    }
    expect(exponentialSearch(arr, 4)).toBe(-1);
    expect(fibonacciSearch(arr, 4)).toBe(-1);
    expect(exponentialSearch([], 4)).toBe(-1);
    expect(ternarySearch(0, 10, (x) => -((x - 3) ** 2))).toBeCloseTo(3, 6);
    expect(ternarySearch(0, 10, (x) => (x - 7) ** 2, { maximize: false })).toBeCloseTo(7, 6);
  });
  it('polynomialHash stays in [0, mod) for any character (v0.1.0 went negative)', () => {
    for (const s of ['', 'abc', 'ABC', '0123', 'Lombok Algoritma!', '日本']) {
      const h = polynomialHash(s);
      expect(h >= 0 && h < 1_000_000_007).toBe(true);
    }
    expect(polynomialHash('abc')).toBe((1 * 31 * 31 + 2 * 31 + 3) % 1_000_000_007);
  });
  it('BloomFilter accessors and FPR estimate', () => {
    const bf = new BloomFilter(100, 0.01);
    expect(bf.size).toBe(959);
    expect(bf.hashCount).toBe(7);
    expect(bf.estimatedFPR).toBe(0);
    for (let i = 0; i < 100; i++) bf.add(`k${i}`);
    expect(bf.estimatedFPR).toBeGreaterThan(0);
    expect(bf.estimatedFPR).toBeLessThan(0.05);
  });
  it('FenwickTree from size and from array', () => {
    const f = new FenwickTree(5);
    f.update(3, 4);
    expect(f.prefixSum(5)).toBe(4);
    const g = new FenwickTree([1, 2, 3, 4, 5]);
    expect(g.rangeSum(2, 4)).toBe(9);
    expect(g.pointQuery(5)).toBe(5);
  });
});

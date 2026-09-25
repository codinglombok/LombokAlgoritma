// LombokAlgoritma — Regression tests for v0.1.1 fixes
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
// Each block pins a defect fixed in v0.1.1 against an independent reference value.

import { describe, expect, it } from 'vitest';
import { AlgoError } from '../src/core/errors.js';
import { Pcg32, SplitMix64, Xoshiro256pp } from '../src/core/rng.js';
import { HyperLogLog } from '../src/datastructure/hyperloglog.js';
import { crt } from '../src/math/modular.js';
import { countingSort } from '../src/sort/counting.js';
import { timsort } from '../src/sort/timsort.js';
import { fnv1a32, fnv1a64, murmurHash3_32, xxHash32 } from '../src/string/hash/index.js';

describe('CRT — inverse coefficient', () => {
  it('returns the canonical solution in [0, M)', () => {
    expect(crt([2n, 3n, 2n], [3n, 5n, 7n])).toBe(23n);
    expect(crt([1n, 2n, 3n], [5n, 7n, 11n])).toBe(366n);
    expect(crt([0n, 0n], [4n, 9n])).toBe(0n);
  });
  it('normalises negative / oversized remainders', () => {
    expect(crt([-1n, 10n], [3n, 7n])).toBe(17n);
  });
  it('rejects non-coprime moduli and length mismatch', () => {
    expect(() => crt([1n, 1n], [4n, 6n])).toThrow(AlgoError);
    expect(() => crt([1n], [3n, 5n])).toThrow(AlgoError);
  });
  it('brute-force agreement for small moduli', () => {
    const mods = [3n, 4n, 5n];
    for (let x = 0n; x < 60n; x++)
      expect(
        crt(
          mods.map((m) => x % m),
          mods,
        ),
      ).toBe(x);
  });
});

describe('Timsort — stability with comparator', () => {
  it('keeps equal-key order (matches stable Array.prototype.sort)', () => {
    const rng = new Xoshiro256pp(7n);
    const items = Array.from({ length: 2000 }, (_, i) => ({ k: rng.nextInt(10), i }));
    const expected = [...items].sort((a, b) => a.k - b.k);
    expect(timsort([...items], (a, b) => a.k - b.k)).toEqual(expected);
  });
  it('small stable case', () => {
    const r = timsort(['bb', 'a', 'cc', 'd', 'ee'], (a, b) => a.length - b.length);
    expect(r).toEqual(['a', 'd', 'bb', 'cc', 'ee']);
  });
});

describe('HyperLogLog — hashing & bias correction', () => {
  it('relative error within 3σ (σ = 1.04/√m) across magnitudes, b=14', () => {
    const sigma = 1.04 / Math.sqrt(1 << 14);
    for (const n of [1_000, 10_000, 100_000]) {
      const h = new HyperLogLog(14);
      for (let i = 0; i < n; i++) h.add(`x${i}`);
      expect(Math.abs(h.count() - n) / n).toBeLessThan(3 * sigma);
    }
  });
  it('merge equals union', () => {
    const a = new HyperLogLog(12);
    const b = new HyperLogLog(12);
    const u = new HyperLogLog(12);
    for (let i = 0; i < 5000; i++) {
      a.add(`k${i}`);
      u.add(`k${i}`);
    }
    for (let i = 2500; i < 7500; i++) {
      b.add(`k${i}`);
      u.add(`k${i}`);
    }
    expect(a.merge(b).count()).toBe(u.count());
  });
  it('empty estimator counts 0', () => {
    expect(new HyperLogLog(10).count()).toBe(0);
  });
});

describe('Non-crypto hashes — reference values', () => {
  const inputs = [
    '',
    'a',
    'abc',
    'hello',
    'abcdefghijklmnop',
    'The quick brown fox jumps over the lazy dog',
  ];
  it('xxHash32 seed 0 / seed 1 (reference: python-xxhash)', () => {
    expect(inputs.map((s) => xxHash32(s))).toEqual([
      0x02cc5d05, 0x550d7456, 0x32d153ff, 0xfb0077f9, 0x9d2d8b62, 0xe85ea4de,
    ]);
    expect(inputs.map((s) => xxHash32(s, 1))).toEqual([
      0x0b2cb792, 0xf514706f, 0xaa3da8ff, 0xfcfffba9, 0x7cfb9556, 0x234f8471,
    ]);
  });
  it('MurmurHash3_x86_32 (reference: mmh3)', () => {
    expect(inputs.map((s) => murmurHash3_32(s))).toEqual([
      0x00000000, 0x3c2569b2, 0xb3dd93fa, 0x248bfa47, 0xe76291ed, 0x2e4ff723,
    ]);
    expect(murmurHash3_32('hello', 42)).toBe(0xe2dbd2e1);
  });
  it('FNV-1a 32/64', () => {
    expect(fnv1a32('a')).toBe(0xe40c292c);
    expect(fnv1a64('a')).toBe(0xaf63dc4c8601ec8cn);
  });
});

describe('PRNG — reference streams', () => {
  it('SplitMix64(0) (reference: prng.di.unimi.it/splitmix64.c)', () => {
    const s = new SplitMix64(0n);
    expect([s.next(), s.next(), s.next()]).toEqual([
      0xe220a8397b1dcdafn,
      0x6e789e6aa1b965f4n,
      0x06c45d188009454fn,
    ]);
  });
  it('xoshiro256++ seeded by SplitMix64 (reference: xoshiro256plusplus.c)', () => {
    const x = new Xoshiro256pp(0n);
    expect([x.next(), x.next(), x.next()]).toEqual([
      5987356902031041503n,
      7051070477665621255n,
      6633766593972829180n,
    ]);
    const y = new Xoshiro256pp(42n);
    expect(y.next()).toBe(15021278609987233951n);
  });
  it('PCG32 srandom(42, 54) (reference: pcg32-demo)', () => {
    const p = new Pcg32(42n, 54n);
    expect(Array.from({ length: 6 }, () => p.next())).toEqual([
      0xa15c02b7, 0x7b47f409, 0xba1d3330, 0x83d2f293, 0xbfa4784b, 0xcbed606e,
    ]);
  });
  it('bounded outputs stay in range', () => {
    const x = new Xoshiro256pp(1n);
    const p = new Pcg32(1n, 1n);
    for (let i = 0; i < 1000; i++) {
      const a = x.nextInt(7);
      const b = p.nextBounded(7);
      expect(a >= 0 && a < 7 && b >= 0 && b < 7).toBe(true);
    }
    expect(() => x.nextInt(0)).toThrow(AlgoError);
  });
});

describe('countingSort — input validation', () => {
  it('rejects negatives and values above maxVal', () => {
    expect(() => countingSort([1, -1])).toThrow(AlgoError);
    expect(() => countingSort([5, 1], 3)).toThrow(AlgoError);
  });
});

describe('hardware — feature probes', () => {
  it('WASM SIMD probe module is well-formed (Node ≥ 16 supports SIMD128)', async () => {
    const { detectSimd } = await import('../src/hardware/index.js');
    const caps = detectSimd();
    expect(caps.environment).toBe('node');
    expect(caps.wasmSimd).toBe(true);
  });
  it('bit helpers', async () => {
    const { popcount, clz, ctz, nextPow2 } = await import('../src/hardware/index.js');
    expect(popcount(0xffffffff)).toBe(32);
    expect(clz(1)).toBe(31);
    expect(ctz(8)).toBe(3);
    expect(nextPow2(17)).toBe(32);
  });
});

describe('SegmentTree — lazy range-add scales by segment length', () => {
  it('range sums after range updates match brute force', async () => {
    const { SegmentTree } = await import('../src/datastructure/segment-tree.js');
    const rng = new Xoshiro256pp(11n);
    const base = Array.from({ length: 37 }, () => rng.nextInt(100));
    const ref = [...base];
    const st = new SegmentTree([...base]);
    for (let step = 0; step < 300; step++) {
      const a = rng.nextInt(ref.length);
      const b = rng.nextInt(ref.length);
      const [l, r] = a <= b ? [a, b] : [b, a];
      if (step % 2 === 0) {
        const v = rng.nextInt(21) - 10;
        st.update(l, r, v);
        for (let i = l; i <= r; i++) ref[i] = (ref[i] ?? 0) + v;
      } else {
        const want = ref.slice(l, r + 1).reduce((x, y) => x + y, 0);
        expect(st.query(l, r)).toBe(want);
      }
    }
  });
  it('update then whole-range query (the v0.1.0 failure case)', async () => {
    const { SegmentTree } = await import('../src/datastructure/segment-tree.js');
    const st = new SegmentTree([1, 3, 5, 7, 9, 11]);
    st.update(1, 3, 10);
    expect(st.query(0, 5)).toBe(66);
    expect(st.query(1, 3)).toBe(45);
  });
  it('empty tree', async () => {
    const { SegmentTree } = await import('../src/datastructure/segment-tree.js');
    expect(new SegmentTree([]).query(0, 0)).toBe(0);
  });
});

describe('jumpSearch — block end is inclusive', () => {
  it('finds targets that sit exactly on a jump boundary', async () => {
    const { jumpSearch } = await import('../src/search/binary.js');
    expect(jumpSearch([0, 1, 2, 3], 2)).toBe(2);
    const arr = Array.from({ length: 1000 }, (_, i) => 2 * i);
    for (let i = 0; i < arr.length; i++) expect(jumpSearch(arr, 2 * i)).toBe(i);
    expect(jumpSearch(arr, 3)).toBe(-1);
    expect(jumpSearch([], 1)).toBe(-1);
    expect(jumpSearch([5], 5)).toBe(0);
  });
});

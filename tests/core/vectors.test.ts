// LombokAlgoritma — TypeScript reference vs. shared JSON vectors (tests/vectors/**)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { gcd } from '../../src/math/gcd.js';
import { isPrime } from '../../src/math/miller-rabin.js';
import { sha256hex } from '../../src/math/sha256.js';
import { cosineSimilarity } from '../../src/ml/similarity.js';
import { binarySearch } from '../../src/search/binary.js';
import { countingSort } from '../../src/sort/counting.js';
import { heapsort } from '../../src/sort/heapsort.js';
import { mergesort } from '../../src/sort/mergesort.js';
import { quicksort } from '../../src/sort/quicksort.js';
import { radixSortLSD } from '../../src/sort/radix-lsd.js';
import { timsort } from '../../src/sort/timsort.js';
import { kmpSearch } from '../../src/string/kmp.js';
import { levenshtein } from '../../src/string/levenshtein.js';
import { fnv1a32 } from '../../src/string/string-hash.js';

interface VectorFile<V> {
  vectors: V[];
  setup?: { sorted_arr: number[] };
  tolerance?: number;
}
const load = <V>(p: string): VectorFile<V> =>
  JSON.parse(readFileSync(join(__dirname, '..', 'vectors', p), 'utf8')) as VectorFile<V>;
const fromHex = (h: string): Uint8Array =>
  Uint8Array.from(h.match(/../g) ?? [], (x) => Number.parseInt(x, 16));

describe('shared vectors — sort', () => {
  const sorts: [string, (a: number[]) => number[]][] = [
    ['timsort', (a) => timsort([...a])],
    ['quicksort', (a) => quicksort([...a])],
    ['mergesort', (a) => mergesort([...a])],
    ['heapsort', (a) => heapsort([...a])],
    ['radix_lsd', (a) => radixSortLSD([...a])],
    ['counting_sort', (a) => countingSort([...a])],
  ];
  for (const [name, fn] of sorts) {
    it(name, () => {
      for (const v of load<{ input: number[]; expected: number[] }>(`sort/${name}.json`).vectors) {
        if (name === 'counting_sort' && v.input.some((x) => x < 0)) {
          expect(() => fn(v.input)).toThrow(RangeError); // counting sort is defined on [0, k]
          continue;
        }
        expect(fn(v.input)).toEqual(v.expected);
      }
    });
  }
});

describe('shared vectors — search/math/string/ml', () => {
  it('binary_search', () => {
    const f = load<{ target: number; expected: number }>('search/binary.json');
    for (const v of f.vectors)
      expect(binarySearch(f.setup?.sorted_arr ?? [], v.target)).toBe(v.expected);
  });
  it('gcd', () => {
    for (const v of load<{ a: string; b: string; expected: string }>('math/gcd.json').vectors)
      expect(gcd(BigInt(v.a), BigInt(v.b))).toBe(BigInt(v.expected));
  });
  it('miller_rabin', () => {
    for (const v of load<{ n: string; expected: boolean }>('math/miller_rabin.json').vectors)
      expect(isPrime(BigInt(v.n))).toBe(v.expected);
  });
  it('sha256 (deprecated)', () => {
    type V = { input_hex?: string; input_utf8?: string; expected_hex: string };
    for (const v of load<V>('crypto/sha256.json').vectors) {
      const input = v.input_utf8 ?? fromHex(v.input_hex ?? '');
      expect(sha256hex(input)).toBe(v.expected_hex);
    }
  });
  it('fnv1a32', () => {
    for (const v of load<{ input_utf8: string; expected: number }>('string/fnv1a32.json').vectors)
      expect(fnv1a32(v.input_utf8)).toBe(v.expected);
  });
  it('kmp', () => {
    for (const v of load<{ text: string; pattern: string; expected: number[] }>('string/kmp.json')
      .vectors)
      expect(kmpSearch(v.text, v.pattern)).toEqual(v.expected);
  });
  it('levenshtein', () => {
    for (const v of load<{ a: string; b: string; expected: number }>('string/levenshtein.json')
      .vectors)
      expect(levenshtein(v.a, v.b)).toBe(v.expected);
  });
  it('cosine_similarity', () => {
    const f = load<{ a: number[]; b: number[]; expected: number }>('ml/cosine_similarity.json');
    for (const v of f.vectors)
      expect(Math.abs(cosineSimilarity(v.a, v.b) - v.expected)).toBeLessThanOrEqual(
        f.tolerance ?? 1e-12,
      );
  });
});

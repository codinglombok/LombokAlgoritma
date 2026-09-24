// LombokAlgoritma — Test Vector Generator
// Apache-2.0 — @codinglombok
// Generates JSON test vectors from TypeScript reference implementation

import { mkdirSync, writeFileSync } from 'node:fs';
import { sha256 } from '../src/math/sha256.js';
import { levenshtein } from '../src/string/levenshtein.js';

function toHex(b: Uint8Array): string {
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

function writeVectors(path: string, data: unknown): void {
  mkdirSync(path.split('/').slice(0, -1).join('/'), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2));
  console.log(`Generated: ${path}`);
}

// SHA-256 vectors (NIST FIPS 180-4)
writeVectors('tests/vectors/crypto/sha256.json', {
  algorithm: 'sha256',
  version: '0.1.0',
  standard: 'FIPS 180-4',
  vectors: [
    {
      id: 'sha256-001',
      input_hex: '',
      expected_hex: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    { id: 'sha256-002', input_utf8: 'abc', expected_hex: toHex(sha256('abc')) },
    { id: 'sha256-003', input_utf8: 'hello world', expected_hex: toHex(sha256('hello world')) },
    {
      id: 'sha256-004',
      input_utf8: 'LombokAlgoritma',
      expected_hex: toHex(sha256('LombokAlgoritma')),
    },
  ],
});

// Sort vectors
const sortCases = [
  { id: 'sort-001', desc: 'empty', input: [], expected: [] },
  { id: 'sort-002', desc: 'single', input: [42], expected: [42] },
  { id: 'sort-003', desc: 'sorted', input: [1, 2, 3, 4, 5], expected: [1, 2, 3, 4, 5] },
  { id: 'sort-004', desc: 'reverse', input: [5, 4, 3, 2, 1], expected: [1, 2, 3, 4, 5] },
  { id: 'sort-005', desc: 'duplicates', input: [3, 1, 2, 1, 3], expected: [1, 1, 2, 3, 3] },
  { id: 'sort-006', desc: 'negative', input: [-3, -1, 0, 2, -2], expected: [-3, -2, -1, 0, 2] },
  { id: 'sort-007', desc: 'all_same', input: [7, 7, 7], expected: [7, 7, 7] },
];

for (const c of sortCases) {
  c.expected = [...c.input].sort((a, b) => a - b);
}

writeVectors('tests/vectors/sort/quicksort.json', {
  algorithm: 'quicksort',
  version: '0.1.0',
  vectors: sortCases,
});
writeVectors('tests/vectors/sort/timsort.json', {
  algorithm: 'timsort',
  version: '0.1.0',
  vectors: sortCases,
});
writeVectors('tests/vectors/sort/mergesort.json', {
  algorithm: 'mergesort',
  version: '0.1.0',
  vectors: sortCases,
});

// Search vectors
writeVectors('tests/vectors/search/binary.json', {
  algorithm: 'binary_search',
  version: '0.1.0',
  setup: { arr: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19] },
  vectors: [
    { id: 'bs-001', target: 7, expected: 3 },
    { id: 'bs-002', target: 1, expected: 0 },
    { id: 'bs-003', target: 19, expected: 9 },
    { id: 'bs-004', target: 4, expected: -1 },
    { id: 'bs-005', target: 20, expected: -1 },
  ],
});

// GCD vectors
writeVectors('tests/vectors/math/gcd.json', {
  algorithm: 'gcd',
  version: '0.1.0',
  vectors: [
    { id: 'gcd-001', a: '12', b: '8', expected: '4' },
    { id: 'gcd-002', a: '0', b: '5', expected: '5' },
    { id: 'gcd-003', a: '1', b: '999', expected: '1' },
    { id: 'gcd-004', a: '100', b: '75', expected: '25' },
    { id: 'gcd-005', a: '17', b: '13', expected: '1' },
  ],
});

// String vectors
writeVectors('tests/vectors/string/levenshtein.json', {
  algorithm: 'levenshtein',
  version: '0.1.0',
  vectors: [
    { id: 'lev-001', a: '', b: '', expected: 0 },
    { id: 'lev-002', a: 'a', b: '', expected: 1 },
    { id: 'lev-003', a: 'kitten', b: 'sitting', expected: levenshtein('kitten', 'sitting') },
    { id: 'lev-004', a: 'hello', b: 'hello', expected: 0 },
    { id: 'lev-005', a: 'sunday', b: 'saturday', expected: levenshtein('sunday', 'saturday') },
  ],
});

// Primality vectors
writeVectors('tests/vectors/math/miller-rabin.json', {
  algorithm: 'miller_rabin',
  version: '0.1.0',
  vectors: [
    { id: 'mr-001', n: '2', expected: true },
    { id: 'mr-002', n: '4', expected: false },
    { id: 'mr-003', n: '97', expected: true },
    { id: 'mr-004', n: '100', expected: false },
    { id: 'mr-005', n: '2147483647', expected: true },
    { id: 'mr-006', n: '2147483648', expected: false },
  ],
});

console.log('\nAll test vectors generated successfully.');

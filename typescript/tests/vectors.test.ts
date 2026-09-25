// LombokAlgoritma — TypeScript reference against vectors/lombokalgoritma-vectors-v1.json
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { describe, expect, it } from 'vitest';
import { canonical, formatNumber } from './vectors/canonical.js';
import { runVectors } from './vectors/runner.js';

describe('shared vectors (lombokalgoritma-vectors-v1)', () => {
  const report = runVectors();
  it('covers every group in the file', () => {
    expect(report.missing).toEqual([]);
  });
  it('reproduces every expected value byte for byte', () => {
    expect(report.failures).toEqual([]);
    expect(report.cases).toBeGreaterThan(1000);
  });
});

describe('canonical JSON (SPEC §3)', () => {
  it('formats numbers like ECMAScript, keeping −0 and naming non-finite values', () => {
    expect([0, -0, 1e21, 1e-7, 123e-20, 5e-324].map(formatNumber)).toEqual([
      '0',
      '-0',
      '1e+21',
      '1e-7',
      '1.23e-18',
      '5e-324',
    ]);
    expect(
      [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].map(formatNumber),
    ).toEqual(['"NaN"', '"Infinity"', '"-Infinity"']);
  });
  it('sorts keys, drops whitespace, escapes like JSON.stringify', () => {
    expect(canonical({ b: [1, 2n], a: 'x\n"é' })).toBe('{"a":"x\\n\\"é","b":[1,2]}');
    expect(canonical({ u: new Uint8Array([0, 255]), n: null, t: true })).toBe(
      '{"n":null,"t":true,"u":"00ff"}',
    );
  });
});

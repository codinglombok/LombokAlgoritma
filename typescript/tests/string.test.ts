// LombokAlgoritma — String Module Tests
// Apache-2.0 — @codinglombok

import { describe, expect, it } from 'vitest';
import { AhoCorasick } from '../src/string/aho-corasick.js';
import { fnv1a32, fnv1a64, murmurHash3_32 } from '../src/string/hash/index.js';
import { kmpFind, kmpSearch } from '../src/string/kmp.js';
import { damerauLevenshtein, jaroWinkler, levenshtein } from '../src/string/levenshtein.js';

describe('KMP Search', () => {
  it('finds single occurrence', () => {
    expect(kmpSearch('abcabc', 'abc')).toEqual([0, 3]);
  });
  it('no match', () => {
    expect(kmpSearch('hello', 'xyz')).toEqual([]);
  });
  it('pattern = text', () => {
    expect(kmpSearch('abc', 'abc')).toEqual([0]);
  });
  it('empty pattern', () => {
    expect(kmpSearch('abc', '')).toEqual([]);
  });
  it('single char pattern', () => {
    expect(kmpSearch('banana', 'a')).toEqual([1, 3, 5]);
  });
  it('kmpFind first', () => {
    expect(kmpFind('abcabc', 'bc')).toBe(1);
  });
  it('kmpFind miss', () => {
    expect(kmpFind('hello', 'xyz')).toBe(-1);
  });
});

describe('Edit Distance', () => {
  it('levenshtein("", "") = 0', () => {
    expect(levenshtein('', '')).toBe(0);
  });
  it('levenshtein("a", "") = 1', () => {
    expect(levenshtein('a', '')).toBe(1);
  });
  it('levenshtein("kitten", "sitting") = 3', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
  });
  it('levenshtein same = 0', () => {
    expect(levenshtein('hello', 'hello')).toBe(0);
  });
  it('damerau includes transpositions', () => {
    expect(damerauLevenshtein('ca', 'abc')).toBeLessThan(levenshtein('ca', 'abc') + 1);
  });
  it('jaroWinkler same string = 1', () => {
    expect(jaroWinkler('hello', 'hello')).toBeCloseTo(1);
  });
  it('jaroWinkler prefix boost', () => {
    const jaro_raw = jaroWinkler('MARTHA', 'MARHTA', 0);
    const jaro_winkler = jaroWinkler('MARTHA', 'MARHTA');
    expect(jaro_winkler).toBeGreaterThan(jaro_raw);
  });
});

describe('Aho-Corasick', () => {
  it('finds all patterns', () => {
    const ac = new AhoCorasick();
    ac.addPattern('he');
    ac.addPattern('she');
    ac.addPattern('his');
    ac.addPattern('hers');
    ac.build();
    const results = ac.search('ushers');
    const patterns = results.map((r) => r.pattern).sort();
    expect(patterns).toContain('she');
    expect(patterns).toContain('he');
    expect(patterns).toContain('hers');
  });
  it('no matches', () => {
    const ac = new AhoCorasick();
    ac.addPattern('xyz');
    ac.build();
    expect(ac.search('hello')).toEqual([]);
  });
});

describe('Hash functions — determinism', () => {
  it('fnv1a32 is deterministic', () => {
    expect(fnv1a32('hello')).toBe(fnv1a32('hello'));
  });
  it('fnv1a32 different inputs differ', () => {
    expect(fnv1a32('hello')).not.toBe(fnv1a32('world'));
  });
  it('fnv1a64 is deterministic', () => {
    expect(fnv1a64('hello')).toBe(fnv1a64('hello'));
  });
  it('fnv1a64 returns bigint', () => {
    expect(typeof fnv1a64('test')).toBe('bigint');
  });
  it('murmur3 deterministic', () => {
    expect(murmurHash3_32('hello')).toBe(murmurHash3_32('hello'));
  });
  it('murmur3 different inputs differ', () => {
    expect(murmurHash3_32('a')).not.toBe(murmurHash3_32('b'));
  });
  it('murmur3 seed changes output', () => {
    expect(murmurHash3_32('hello', 0)).not.toBe(murmurHash3_32('hello', 42));
  });
});

// LombokAlgoritma — Data Structure Tests
// Apache-2.0 — @codinglombok

import { describe, it, expect } from 'vitest';
import { BloomFilter } from '../../src/datastructure/bloom-filter.js';
import { HyperLogLog } from '../../src/datastructure/hyperloglog.js';
import { DisjointSet } from '../../src/datastructure/disjoint-set.js';
import { SegmentTree } from '../../src/datastructure/segment-tree.js';
import { FenwickTree } from '../../src/datastructure/fenwick-tree.js';

describe('BloomFilter', () => {
  it('no false negatives', () => {
    const bf = new BloomFilter(1000, 0.01);
    for (let i = 0; i < 100; i++) bf.add(`item${i}`);
    for (let i = 0; i < 100; i++) expect(bf.has(`item${i}`)).toBe(true);
  });
  it('reasonable false positive rate', () => {
    const bf = new BloomFilter(1000, 0.01);
    for (let i = 0; i < 1000; i++) bf.add(`known${i}`);
    let fp = 0;
    for (let i = 0; i < 1000; i++) if (bf.has(`unknown${i}`)) fp++;
    expect(fp / 1000).toBeLessThan(0.05); // < 5% FPR
  });
});

describe('HyperLogLog', () => {
  it('estimates small cardinality', () => {
    const hll = new HyperLogLog(14);
    for (let i = 0; i < 100; i++) hll.add(`item${i}`);
    expect(Math.abs(hll.count() - 100)).toBeLessThan(20);
  });
  it('estimates large cardinality', () => {
    const hll = new HyperLogLog(14);
    for (let i = 0; i < 10000; i++) hll.add(`x${i}`);
    expect(Math.abs(hll.count() - 10000) / 10000).toBeLessThan(0.05);
  });
});

describe('DisjointSet', () => {
  it('initially all separate', () => {
    const ds = new DisjointSet(5);
    expect(ds.count).toBe(5);
    expect(ds.connected(0, 1)).toBe(false);
  });
  it('union connects', () => {
    const ds = new DisjointSet(5);
    ds.union(0, 1); ds.union(1, 2);
    expect(ds.connected(0, 2)).toBe(true);
    expect(ds.connected(0, 3)).toBe(false);
    expect(ds.count).toBe(3);
  });
  it('union returns false for same component', () => {
    const ds = new DisjointSet(3);
    ds.union(0, 1);
    expect(ds.union(0, 1)).toBe(false);
  });
});

describe('SegmentTree', () => {
  const arr = [1, 3, 5, 7, 9, 11];
  it('range sum query', () => {
    const st = new SegmentTree([...arr]);
    expect(st.query(1, 3)).toBe(15); // 3+5+7
    expect(st.query(0, 5)).toBe(36); // sum all
  });
  it('range update', () => {
    const st = new SegmentTree([...arr]);
    st.update(1, 3, 10);
    expect(st.query(1, 1)).toBe(13); // 3+10
    expect(st.query(3, 3)).toBe(17); // 7+10
  });
});

describe('FenwickTree', () => {
  it('prefix sums', () => {
    const ft = new FenwickTree([1, 3, 5, 7, 9]);
    expect(ft.prefixSum(3)).toBe(9); // 1+3+5
    expect(ft.prefixSum(5)).toBe(25);
  });
  it('range sum', () => {
    const ft = new FenwickTree([1, 3, 5, 7, 9]);
    expect(ft.rangeSum(2, 4)).toBe(15); // 3+5+7
  });
  it('point update', () => {
    const ft = new FenwickTree([1, 3, 5, 7, 9]);
    ft.update(3, 10);
    expect(ft.prefixSum(3)).toBe(19); // 1+3+15
  });
});

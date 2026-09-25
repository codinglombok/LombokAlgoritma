// LombokAlgoritma — Sort Module Tests
// Apache-2.0 — @codinglombok

import { describe, expect, it } from 'vitest';
import {
  countingSort,
  heapsort,
  mergesort,
  quicksort,
  radixSortLSD,
  timsort,
} from '../src/sort/index.js';

const ALGOS = [
  { name: 'quicksort', fn: quicksort },
  { name: 'timsort', fn: timsort },
  { name: 'mergesort', fn: mergesort },
  { name: 'heapsort', fn: heapsort },
] as const;

describe('Sort — correctness', () => {
  for (const { name, fn } of ALGOS) {
    describe(name, () => {
      it('empty array', () => {
        expect(fn([])).toEqual([]);
      });
      it('single element', () => {
        expect(fn([42])).toEqual([42]);
      });
      it('already sorted', () => {
        expect(fn([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
      });
      it('reverse sorted', () => {
        expect(fn([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
      });
      it('duplicates', () => {
        expect(fn([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3]);
      });
      it('all identical', () => {
        expect(fn([7, 7, 7, 7])).toEqual([7, 7, 7, 7]);
      });
      it('two elements', () => {
        expect(fn([2, 1])).toEqual([1, 2]);
      });
      it('negative numbers', () => {
        expect(fn([-3, -1, -2])).toEqual([-3, -2, -1]);
      });
      it('mixed sign', () => {
        expect(fn([3, -1, 0, 2, -2])).toEqual([-2, -1, 0, 2, 3]);
      });
      it('large random (1000 elements)', () => {
        const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000));
        const result = fn([...arr]);
        const expected = [...arr].sort((a, b) => a - b);
        expect(result).toEqual(expected);
      });
    });
  }

  describe('timsort — stability', () => {
    it('preserves relative order of equal elements', () => {
      const arr = [
        { v: 1, i: 0 },
        { v: 2, i: 1 },
        { v: 1, i: 2 },
        { v: 2, i: 3 },
      ];
      const result = timsort([...arr], (a, b) => a.v - b.v);
      expect(result.map((x) => x.i)).toEqual([0, 2, 1, 3]);
    });
  });

  describe('radixSortLSD', () => {
    it('empty', () => {
      expect(radixSortLSD([])).toEqual([]);
    });
    it('positive integers', () => {
      expect(radixSortLSD([170, 45, 75, 90, 802, 24, 2, 66])).toEqual([
        2, 24, 45, 66, 75, 90, 170, 802,
      ]);
    });
    it('with negatives', () => {
      expect(radixSortLSD([-3, -1, 0, 2])).toEqual([-3, -1, 0, 2]);
    });
  });

  describe('countingSort', () => {
    it('basic', () => {
      expect(countingSort([3, 1, 2, 1, 3, 0])).toEqual([0, 1, 1, 2, 3, 3]);
    });
    it('all zeros', () => {
      expect(countingSort([0, 0, 0])).toEqual([0, 0, 0]);
    });
  });
});

describe('Sort — custom comparator', () => {
  it('sort strings by length', () => {
    const arr = ['banana', 'fig', 'apple', 'kiwi'];
    const result = timsort([...arr], (a, b) => a.length - b.length);
    // 'kiwi' has 4 letters: the lengths are 6,3,5,4 → sorted 3,4,5,6
    expect(result).toEqual(['fig', 'kiwi', 'apple', 'banana']);
    expect(result.map((s) => s.length)).toEqual([3, 4, 5, 6]);
  });

  it('sort objects by field', () => {
    const arr = [{ n: 3 }, { n: 1 }, { n: 2 }];
    const result = quicksort([...arr], (a, b) => a.n - b.n);
    expect(result.map((x) => x.n)).toEqual([1, 2, 3]);
  });
});

describe('Sort — in-place vs copy', () => {
  it('inPlace=true modifies original', () => {
    const arr = [3, 1, 2];
    timsort(arr, undefined, { inPlace: true });
    expect(arr).toEqual([1, 2, 3]);
  });

  it('inPlace=false does not modify original', () => {
    const arr = [3, 1, 2];
    timsort(arr, undefined, { inPlace: false });
    expect(arr).toEqual([3, 1, 2]);
  });
});

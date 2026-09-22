// LombokAlgoritma — Search Module Tests
// Apache-2.0 — @codinglombok

import { describe, it, expect } from 'vitest';
import {
  binarySearch, lowerBound, upperBound,
  interpolationSearch, exponentialSearch,
  jumpSearch, fibonacciSearch, linearSearch,
} from '../../src/search/index.js';

const sorted = [1,3,5,7,9,11,13,15,17,19];

describe('binarySearch', () => {
  it('finds existing element', () => { expect(binarySearch(sorted, 7)).toBe(3); });
  it('finds first element', () => { expect(binarySearch(sorted, 1)).toBe(0); });
  it('finds last element', () => { expect(binarySearch(sorted, 19)).toBe(9); });
  it('returns -1 for missing', () => { expect(binarySearch(sorted, 4)).toBe(-1); });
  it('empty array', () => { expect(binarySearch([], 1)).toBe(-1); });
  it('single element match', () => { expect(binarySearch([5], 5)).toBe(0); });
  it('single element miss', () => { expect(binarySearch([5], 6)).toBe(-1); });
});

describe('lowerBound / upperBound', () => {
  const arr = [1,2,2,2,3,4];
  it('lowerBound of 2', () => { expect(lowerBound(arr, 2)).toBe(1); });
  it('upperBound of 2', () => { expect(upperBound(arr, 2)).toBe(4); });
  it('lowerBound past end', () => { expect(lowerBound(arr, 10)).toBe(6); });
  it('lowerBound before start', () => { expect(lowerBound(arr, 0)).toBe(0); });
});

describe('interpolationSearch', () => {
  const uniform = Array.from({length: 100}, (_,i) => i * 2);
  it('finds midpoint', () => { expect(interpolationSearch(uniform, 50)).toBe(25); });
  it('returns -1 for missing', () => { expect(interpolationSearch(uniform, 3)).toBe(-1); });
});

describe('exponentialSearch', () => {
  it('finds element', () => { expect(exponentialSearch(sorted, 13)).toBe(6); });
  it('first element', () => { expect(exponentialSearch(sorted, 1)).toBe(0); });
  it('missing', () => { expect(exponentialSearch(sorted, 8)).toBe(-1); });
});

describe('jumpSearch', () => {
  it('finds element', () => { expect(jumpSearch(sorted, 9)).toBe(4); });
  it('missing', () => { expect(jumpSearch(sorted, 6)).toBe(-1); });
});

describe('fibonacciSearch', () => {
  it('finds element', () => { expect(fibonacciSearch(sorted, 11)).toBe(5); });
  it('missing', () => { expect(fibonacciSearch(sorted, 2)).toBe(-1); });
});

describe('linearSearch', () => {
  it('finds element', () => { expect(linearSearch([3,1,4,1,5], 4)).toBe(2); });
  it('first occurrence', () => { expect(linearSearch([3,1,4,1,5], 1)).toBe(1); });
  it('missing', () => { expect(linearSearch([3,1,4], 2)).toBe(-1); });
});

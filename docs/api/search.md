# LombokAlgoritma — Search API Reference

## Import
```typescript
import { binarySearch, lowerBound, upperBound } from 'lombokalgoritma';
import { interpolationSearch, jumpSearch, fibonacciSearch } from 'lombokalgoritma/search';
```

## Functions

### `binarySearch<T>(arr, target, compareFn?)`
O(log n). Array must be sorted. Returns index or -1.

```typescript
binarySearch([1,3,5,7,9], 5)   // 2
binarySearch([1,3,5,7,9], 4)   // -1
```

### `lowerBound<T>(arr, target, compareFn?)`
First index `i` where `arr[i] >= target`. Returns `arr.length` if none.

```typescript
lowerBound([1,2,2,2,3], 2)  // 1
```

### `upperBound<T>(arr, target, compareFn?)`
First index `i` where `arr[i] > target`.

```typescript
upperBound([1,2,2,2,3], 2)  // 4
```

### `interpolationSearch(arr, target)`
O(log log n) average for uniformly distributed integers.

### `exponentialSearch<T>(arr, target)`
O(log n). Good for unbounded/infinite sorted arrays.

### `jumpSearch<T>(arr, target)`
O(√n). Good for sorted arrays on systems where backward jump is expensive.

### `fibonacciSearch<T>(arr, target)`
O(log n). Cache-friendly. Uses only addition/subtraction (no division).

### `linearSearch<T>(arr, target, eqFn?)`
O(n). Baseline. Works on unsorted arrays.

### `ternarySearch(lo, hi, f, options?)`
Finds `x` in `[lo, hi]` that maximizes/minimizes unimodal function `f`.

```typescript
// Find minimum of x² - 4x + 5 in [0, 10]
ternarySearch(0, 10, x => x*x - 4*x + 5, { maximize: false })  // ≈ 2.0
```

## Algorithm Selection Guide

| Input | Use |
|-------|-----|
| Sorted array, general | `binarySearch` |
| First/last occurrence | `lowerBound` / `upperBound` |
| Uniform integer distribution | `interpolationSearch` |
| Unknown size / streaming | `exponentialSearch` |
| Cache-limited hardware | `fibonacciSearch` |
| Unsorted, small | `linearSearch` |
| Unimodal function | `ternarySearch` |

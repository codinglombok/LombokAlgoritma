# LombokAlgoritma — Sort API Reference

## Import

```typescript
import { Sort, timsort, quicksort, mergesort, heapsort, sort } from 'lombokalgoritma';
// or granular:
import { timsort } from 'lombokalgoritma/sort';
```

## Functions

### `timsort<T>(arr, options?)` / `sort<T>(arr, options?)`
Stable adaptive sort. O(n) best, O(n log n) worst. **Default sort.**

```typescript
timsort([5,3,1,4,2])           // [1,2,3,4,5]
timsort([5,3,1], (a,b)=>b-a)  // [5,3,1] descending
timsort(arr, undefined, { inPlace: true })  // mutates arr
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `arr` | `T[]` | required | Input array |
| `compareFn` | `(a,b)=>number` | `defaultCompareFn` | Custom comparator |
| `options.inPlace` | `boolean` | `true` | Modify array in-place |

**Returns:** `T[]`

---

### `quicksort<T>(arr, options?)`
Dual-pivot quicksort. O(n log n) average. Fastest for large numeric arrays.

```typescript
quicksort([5,3,1,4,2])   // [1,2,3,4,5]
quicksort(arr, undefined, { inPlace: false })  // new array
```

**Note:** Uses random shuffle to prevent adversarial O(n²) input.

---

### `mergesort<T>(arr, options?)`
Bottom-up iterative mergesort. O(n log n) all cases. Stable. No recursion stack.

---

### `heapsort<T>(arr, options?)`
In-place heapsort. O(n log n) all cases. O(1) space. Not stable.

---

### `radixSortLSD(arr)` 
LSD radix sort. O(nk) for integer arrays.

```typescript
import { radixSortLSD } from 'lombokalgoritma/sort';
radixSortLSD([170, 45, 75, 90, 802])  // [45, 75, 90, 170, 802]
```

---

### `countingSort(arr, maxVal?)`
O(n+k). For small non-negative integer ranges.

---

## Algorithm Selection Guide

| Need | Use |
|------|-----|
| Default (stable) | `timsort` / `sort` |
| Fastest numeric | `quicksort` |
| Guaranteed stable + memory | `mergesort` |
| Minimal memory (O(1)) | `heapsort` |
| Integer keys, small range | `countingSort` |
| Integer keys, large range | `radixSortLSD` |
| Nearly sorted input | `timsort` (O(n) best case) |

## Cross-Language

```bash
# Rust:       lombokalgoritma::sort::timsort(&mut arr)
# Python:     from lombokalgoritma.sort import timsort; timsort([5,3,1])
# Go:         la.Timsort([]int{5,3,1})
# PHP:        Sort::timsort([5,3,1])
# Java:       Sort.timsort(new Integer[]{5,3,1})
# C++:        lombok::timsort(std::vector<int>{5,3,1})
# C#:         Sorting.Timsort(new[]{5,3,1})
# Kotlin:     timsort(listOf(5,3,1))
# Swift:      Sort.timsort([5,3,1])
# SQL (PG):   SELECT lombokalgoritma.sort_int_asc(ARRAY[5,3,1])
```

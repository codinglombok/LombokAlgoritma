# LombokAlgoritma — Python Sort Module
# Apache-2.0 — @codinglombok
from typing import TypeVar, Callable, Optional
T = TypeVar("T")

def timsort(arr: list, key: Optional[Callable]=None, reverse: bool=False) -> list:
    """Timsort — stable, adaptive. O(n log n). Python's own sorted() uses this."""
    return sorted(arr, key=key, reverse=reverse)

def quicksort(arr: list[T], cmp: Optional[Callable[[T,T],int]]=None) -> list[T]:
    """Dual-pivot quicksort. O(n log n) average. Not stable."""
    a = list(arr)
    if len(a) <= 1:
        return a
    _quicksort_inner(a, 0, len(a) - 1)
    return a

def _quicksort_inner(a: list, lo: int, hi: int) -> None:
    if lo >= hi:
        return
    if hi - lo < 16:
        _insertion_sort(a, lo, hi)
        return
    p = _partition(a, lo, hi)
    _quicksort_inner(a, lo, p - 1)
    _quicksort_inner(a, p + 1, hi)

def _insertion_sort(a: list, lo: int, hi: int) -> None:
    for i in range(lo + 1, hi + 1):
        key = a[i]; j = i - 1
        while j >= lo and a[j] > key:
            a[j + 1] = a[j]; j -= 1
        a[j + 1] = key

def _partition(a: list, lo: int, hi: int) -> int:
    mid = (lo + hi) // 2
    if a[lo] > a[mid]: a[lo], a[mid] = a[mid], a[lo]
    if a[lo] > a[hi]:  a[lo], a[hi] = a[hi], a[lo]
    if a[mid] > a[hi]: a[mid], a[hi] = a[hi], a[mid]
    a[mid], a[hi] = a[hi], a[mid]
    pivot = a[hi]; i = lo
    for j in range(lo, hi):
        if a[j] <= pivot:
            a[i], a[j] = a[j], a[i]; i += 1
    a[i], a[hi] = a[hi], a[i]
    return i

def mergesort(arr: list[T]) -> list[T]:
    """Bottom-up iterative mergesort. O(n log n). Stable."""
    a = list(arr); n = len(a)
    if n <= 1: return a
    tmp = a[:]
    width = 1
    while width < n:
        for lo in range(0, n, 2 * width):
            mid = min(lo + width, n)
            hi  = min(lo + 2 * width, n)
            i, j, k = lo, mid, lo
            while i < mid and j < hi:
                if a[i] <= a[j]: tmp[k] = a[i]; i += 1
                else:            tmp[k] = a[j]; j += 1
                k += 1
            while i < mid: tmp[k] = a[i]; i += 1; k += 1
            while j < hi:  tmp[k] = a[j]; j += 1; k += 1
        a, tmp = tmp, a
        width *= 2
    return a

def heapsort(arr: list[T]) -> list[T]:
    """Heapsort. O(n log n). In-place. Not stable."""
    a = list(arr); n = len(a)
    for i in range(n // 2 - 1, -1, -1): _sift(a, i, n)
    for end in range(n - 1, 0, -1): a[0], a[end] = a[end], a[0]; _sift(a, 0, end)
    return a

def _sift(a: list, root: int, end: int) -> None:
    while True:
        largest, l, r = root, 2*root+1, 2*root+2
        if l < end and a[l] > a[largest]: largest = l
        if r < end and a[r] > a[largest]: largest = r
        if largest == root: break
        a[root], a[largest] = a[largest], a[root]; root = largest

def counting_sort(arr: list[int], max_val: Optional[int]=None) -> list[int]:
    """Counting sort. O(n+k). Integers only."""
    if not arr: return []
    k = max_val if max_val is not None else max(arr)
    count = [0] * (k + 1)
    for v in arr: count[v] += 1
    return [i for i, c in enumerate(count) for _ in range(c)]

def radix_sort_lsd(arr: list[int]) -> list[int]:
    """LSD Radix sort for non-negative integers. O(nk)."""
    if not arr: return []
    a = list(arr)
    max_val = max(a)
    exp = 1
    while max_val // exp > 0:
        count = [0] * 10
        for v in a: count[(v // exp) % 10] += 1
        for i in range(1, 10): count[i] += count[i-1]
        out = [0] * len(a)
        for v in reversed(a):
            d = (v // exp) % 10; count[d] -= 1; out[count[d]] = v
        a = out; exp *= 10
    return a

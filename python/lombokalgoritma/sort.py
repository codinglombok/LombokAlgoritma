# LombokAlgoritma — Python Sort Module (SPEC §6)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from collections.abc import Callable, Iterable
from functools import cmp_to_key
from typing import Any, TypeVar

from ._types import CT
from .errors import OutOfRangeError

T = TypeVar("T")


def timsort(
    arr: Iterable[T], key: Callable[[T], Any] | None = None, reverse: bool = False
) -> list[T]:
    """Stable, adaptive sort — delegates to CPython's built-in Timsort (``sorted``)."""
    return sorted(arr, key=key, reverse=reverse)  # type: ignore[type-var,arg-type]


def quicksort(arr: Iterable[T], cmp: Callable[[T, T], int] | None = None) -> list[T]:
    """Median-of-three quicksort (insertion sort below 16 items). Not stable.

    ``cmp(a, b)`` returns <0, 0, >0 like a C comparator; natural order when omitted.
    """
    a = list(arr)
    if len(a) <= 1:
        return a
    less: Callable[[T, T], bool]
    if cmp is None:

        def less(x: T, y: T) -> bool:
            return bool(x < y)  # type: ignore[operator]
    else:
        c = cmp

        def less(x: T, y: T) -> bool:
            return c(x, y) < 0

    _quicksort_inner(a, 0, len(a) - 1, less)
    return a


def _quicksort_inner(a: list[T], lo: int, hi: int, less: Callable[[T, T], bool]) -> None:
    while lo < hi:
        if hi - lo < 16:
            _insertion_sort(a, lo, hi, less)
            return
        p = _partition(a, lo, hi, less)
        # recurse into the smaller side, loop on the larger (O(log n) stack)
        if p - lo < hi - p:
            _quicksort_inner(a, lo, p - 1, less)
            lo = p + 1
        else:
            _quicksort_inner(a, p + 1, hi, less)
            hi = p - 1


def _insertion_sort(a: list[T], lo: int, hi: int, less: Callable[[T, T], bool]) -> None:
    for i in range(lo + 1, hi + 1):
        key = a[i]
        j = i - 1
        while j >= lo and less(key, a[j]):
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key


def _partition(a: list[T], lo: int, hi: int, less: Callable[[T, T], bool]) -> int:
    mid = (lo + hi) // 2
    if less(a[mid], a[lo]):
        a[lo], a[mid] = a[mid], a[lo]
    if less(a[hi], a[lo]):
        a[lo], a[hi] = a[hi], a[lo]
    if less(a[hi], a[mid]):
        a[mid], a[hi] = a[hi], a[mid]
    a[mid], a[hi] = a[hi], a[mid]
    pivot = a[hi]
    i = lo
    for j in range(lo, hi):
        if not less(pivot, a[j]):  # a[j] <= pivot
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]
    return i


def mergesort(arr: Iterable[T], key: Callable[[T], Any] | None = None) -> list[T]:
    """Bottom-up iterative mergesort. O(n log n). Stable (equal keys keep their order)."""
    a = list(arr)
    n = len(a)
    if n <= 1:
        return a
    kf: Callable[[T], Any] = key if key is not None else (lambda x: x)
    tmp = a[:]
    width = 1
    while width < n:
        for lo in range(0, n, 2 * width):
            mid = min(lo + width, n)
            hi = min(lo + 2 * width, n)
            i, j, k = lo, mid, lo
            while i < mid and j < hi:
                if kf(a[j]) < kf(a[i]):
                    tmp[k] = a[j]
                    j += 1
                else:  # a[i] <= a[j] → take left first (stability)
                    tmp[k] = a[i]
                    i += 1
                k += 1
            tmp[k : k + mid - i] = a[i:mid]
            k += mid - i
            tmp[k : k + hi - j] = a[j:hi]
        a, tmp = tmp, a
        width *= 2
    return a


def heapsort(arr: Iterable[CT]) -> list[CT]:
    """Heapsort. O(n log n). Not stable. Returns a sorted copy."""
    a = list(arr)
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):
        _sift(a, i, n)
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        _sift(a, 0, end)
    return a


def _sift(a: list[CT], root: int, end: int) -> None:
    while True:
        largest, left, right = root, 2 * root + 1, 2 * root + 2
        if left < end and a[largest] < a[left]:
            largest = left
        if right < end and a[largest] < a[right]:
            largest = right
        if largest == root:
            break
        a[root], a[largest] = a[largest], a[root]
        root = largest


def counting_sort(arr: Iterable[int], max_val: int | None = None) -> list[int]:
    """Counting sort for integers in ``[0, max_val]`` (default ``max(arr)``). O(n + k). Stable.

    Raises:
        OutOfRangeError: a value is negative, not an integer, or above ``max_val``.
    """
    a = list(arr)
    if len(a) <= 1:
        return a
    k = max_val if max_val is not None else max(a)
    count = [0] * (k + 1)
    for v in a:
        if isinstance(v, bool) or not isinstance(v, int) or v < 0 or v > k:
            raise OutOfRangeError(f"counting_sort: value {v} outside integer range [0, {k}]")
        count[v] += 1
    return [i for i, c in enumerate(count) for _ in range(c)]


def radix_sort_lsd(arr: Iterable[int]) -> list[int]:
    """LSD radix sort (base 10) for integers; negatives are handled by offsetting. Stable."""
    arr = list(arr)
    if len(arr) <= 1:
        return arr
    shift = -min(arr) if min(arr) < 0 else 0
    a = [v + shift for v in arr]
    max_val = max(a)
    exp = 1
    while max_val // exp > 0:
        count = [0] * 10
        for v in a:
            count[(v // exp) % 10] += 1
        for i in range(1, 10):
            count[i] += count[i - 1]
        out = [0] * len(a)
        for v in reversed(a):
            d = (v // exp) % 10
            count[d] -= 1
            out[count[d]] = v
        a = out
        exp *= 10
    return [v - shift for v in a]


def sort_with(arr: Iterable[T], cmp: Callable[[T, T], int]) -> list[T]:
    """Stable sort with a C-style comparator."""
    return sorted(arr, key=cmp_to_key(cmp))

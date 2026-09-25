# LombokAlgoritma — Python Search Module
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

import math
from collections.abc import Callable, Sequence
from typing import TypeVar

from ._types import CT

T = TypeVar("T")


def binary_search(arr: Sequence[CT], target: CT) -> int:
    """Index of ``target`` in ascending ``arr`` or -1."""
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) >> 1
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


def lower_bound(arr: Sequence[CT], target: CT) -> int:
    """First index ``i`` with ``arr[i] >= target``."""
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) >> 1
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo


def upper_bound(arr: Sequence[CT], target: CT) -> int:
    """First index ``i`` with ``arr[i] > target``."""
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) >> 1
        if target < arr[mid]:
            hi = mid
        else:
            lo = mid + 1
    return lo


def interpolation_search(arr: Sequence[int], target: int) -> int:
    """Interpolation search for uniformly distributed ascending ints; -1 if absent."""
    lo, hi = 0, len(arr) - 1
    while lo <= hi and arr[lo] <= target <= arr[hi]:
        rng = arr[hi] - arr[lo]
        if lo == hi or rng == 0:
            return lo if arr[lo] == target else -1
        pos = lo + (hi - lo) * (target - arr[lo]) // rng
        if arr[pos] == target:
            return pos
        if arr[pos] < target:
            lo = pos + 1
        else:
            hi = pos - 1
    return -1


def jump_search(arr: Sequence[CT], target: CT) -> int:
    """Jump search with block size ⌊√n⌋; -1 if absent."""
    n = len(arr)
    step = max(1, math.isqrt(n))
    prev, cur = 0, step
    while cur < n and arr[cur] < target:
        prev, cur = cur, cur + step
    for i in range(prev, min(cur + 1, n)):
        if arr[i] == target:
            return i
    return -1


def linear_search(arr: Sequence[T], target: T) -> int:
    """First index of ``target`` or -1."""
    for i, v in enumerate(arr):
        if v == target:
            return i
    return -1


def exponential_search(arr: Sequence[CT], target: CT) -> int:
    """Exponential search: double ``b`` while ``arr[b] < target``, then binary-search the block."""
    n = len(arr)
    if n == 0:
        return -1
    if arr[0] == target:
        return 0
    bound = 1
    while bound < n and arr[bound] < target:
        bound *= 2
    lo = bound // 2
    hi = min(bound, n - 1)
    idx = binary_search(arr[lo : hi + 1], target)
    return -1 if idx == -1 else lo + idx


def fibonacci_search(arr: Sequence[CT], target: CT) -> int:
    """Fibonacci search (Ferguson's classic variant); index or -1."""
    n = len(arr)
    fib_mm2, fib_mm1, fib_m = 0, 1, 1
    while fib_m < n:
        fib_mm2, fib_mm1 = fib_mm1, fib_m
        fib_m = fib_mm1 + fib_mm2
    offset = -1
    while fib_m > 1:
        i = min(offset + fib_mm2, n - 1)
        if arr[i] < target:
            fib_m = fib_mm1
            fib_mm1 = fib_mm2
            fib_mm2 = fib_m - fib_mm1
            offset = i
        elif target < arr[i]:
            fib_m = fib_mm2
            fib_mm1 -= fib_mm2
            fib_mm2 = fib_m - fib_mm1
        else:
            return i
    if fib_mm1 and offset + 1 < n and arr[offset + 1] == target:
        return offset + 1
    return -1


def ternary_search(
    lo: float,
    hi: float,
    f: Callable[[float], float],
    *,
    maximize: bool = True,
    epsilon: float = 1e-9,
) -> float:
    """``x`` in ``[lo, hi]`` that maximises (or minimises) the unimodal ``f``."""
    lo, hi = float(lo), float(hi)
    while hi - lo > epsilon:
        m1 = lo + (hi - lo) / 3
        m2 = hi - (hi - lo) / 3
        if (f(m1) < f(m2)) if maximize else (f(m1) > f(m2)):
            lo = m1
        else:
            hi = m2
    return (lo + hi) / 2

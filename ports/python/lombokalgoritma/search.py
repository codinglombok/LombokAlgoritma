# LombokAlgoritma — Python Search Module
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

import math
from collections.abc import Sequence
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

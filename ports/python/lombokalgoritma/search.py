# LombokAlgoritma — Python Search Module
# Apache-2.0 — @codinglombok
from typing import TypeVar, Optional, Callable
T = TypeVar("T")

def binary_search(arr: list[T], target: T) -> int:
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) >> 1
        if arr[mid] == target: return mid
        if arr[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1

def lower_bound(arr: list[T], target: T) -> int:
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) >> 1
        if arr[mid] < target: lo = mid + 1
        else: hi = mid
    return lo

def upper_bound(arr: list[T], target: T) -> int:
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) >> 1
        if arr[mid] <= target: lo = mid + 1
        else: hi = mid
    return lo

def interpolation_search(arr: list[int], target: int) -> int:
    lo, hi = 0, len(arr) - 1
    while lo <= hi and arr[lo] <= target <= arr[hi]:
        if lo == hi: return lo if arr[lo] == target else -1
        rng = arr[hi] - arr[lo]
        if rng == 0: return lo if arr[lo] == target else -1
        pos = lo + int((hi - lo) * (target - arr[lo]) / rng)
        if arr[pos] == target: return pos
        if arr[pos] < target: lo = pos + 1
        else: hi = pos - 1
    return -1

def jump_search(arr: list[T], target: T) -> int:
    import math
    n, step, prev = len(arr), int(math.sqrt(len(arr))), 0
    cur = step
    while cur < n and arr[cur] < target: prev, cur = cur, cur + step
    for i in range(prev, min(cur, n)):
        if arr[i] == target: return i
    return -1

def linear_search(arr: list[T], target: T) -> int:
    for i, v in enumerate(arr):
        if v == target: return i
    return -1

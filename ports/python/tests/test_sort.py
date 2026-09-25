# LombokAlgoritma — Python Sort Tests
import pytest
from lombokalgoritma.sort import (
    counting_sort,
    heapsort,
    mergesort,
    quicksort,
    radix_sort_lsd,
    timsort,
)


@pytest.mark.parametrize("fn", [timsort, quicksort, mergesort, heapsort])
def test_empty(fn):
    assert fn([]) == []


@pytest.mark.parametrize("fn", [timsort, quicksort, mergesort, heapsort])
def test_single(fn):
    assert fn([42]) == [42]


@pytest.mark.parametrize("fn", [timsort, quicksort, mergesort, heapsort])
def test_sorted(fn):
    assert fn([1, 2, 3, 4, 5]) == [1, 2, 3, 4, 5]


@pytest.mark.parametrize("fn", [timsort, quicksort, mergesort, heapsort])
def test_reverse(fn):
    assert fn([5, 4, 3, 2, 1]) == [1, 2, 3, 4, 5]


@pytest.mark.parametrize("fn", [timsort, quicksort, mergesort, heapsort])
def test_duplicates(fn):
    assert fn([3, 1, 2, 1, 3]) == [1, 1, 2, 3, 3]


@pytest.mark.parametrize("fn", [timsort, quicksort, mergesort, heapsort])
def test_negative(fn):
    assert fn([-3, -1, 0, 2, -2]) == [-3, -2, -1, 0, 2]


def test_counting_sort():
    assert counting_sort([3, 1, 2, 1, 3, 0]) == [0, 1, 1, 2, 3, 3]


def test_radix_sort():
    assert radix_sort_lsd([170, 45, 75, 90, 802, 24, 2, 66]) == [2, 24, 45, 66, 75, 90, 170, 802]

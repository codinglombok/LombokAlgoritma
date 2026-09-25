# LombokAlgoritma — Python String Tests
from lombokalgoritma.string import fnv1a32, fnv1a64, jaro_winkler, kmp_search, levenshtein


def test_kmp_all():
    assert kmp_search("abcabc", "abc") == [0, 3]


def test_kmp_miss():
    assert kmp_search("hello", "xyz") == []


def test_kmp_single():
    assert kmp_search("banana", "a") == [1, 3, 5]


def test_lev_same():
    assert levenshtein("hello", "hello") == 0


def test_lev_kitten():
    assert levenshtein("kitten", "sitting") == 3


def test_lev_empty():
    assert levenshtein("", "abc") == 3


def test_jw_same():
    assert abs(jaro_winkler("hello", "hello") - 1.0) < 1e-9


def test_fnv_det():
    assert fnv1a32("hello") == fnv1a32("hello")


def test_fnv_diff():
    assert fnv1a32("hello") != fnv1a32("world")


def test_fnv64_type():
    assert isinstance(fnv1a64("test"), int)

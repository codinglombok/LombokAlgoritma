# LombokAlgoritma — Python math tests
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import random

import pytest

from lombokalgoritma import math as lm
from lombokalgoritma.errors import AlgoError


def test_gcd_lcm() -> None:
    assert lm.gcd(12, 8) == 4
    assert lm.gcd(0, 5) == 5
    assert lm.gcd(0, 0) == 0
    assert lm.gcd(-12, 18) == 6
    assert lm.lcm(4, 6) == 12
    assert lm.lcm(-4, 6) == 12
    assert lm.lcm(0, 6) == 0


def test_extended_gcd_truncated_division() -> None:
    for a, b in [(240, 46), (-240, 46), (240, -46), (-7, -3), (0, 5), (5, 0)]:
        g, x, y = lm.extended_gcd(a, b)
        assert a * x + b * y == g
    # truncated semantics: egcd(-7, 3) = egcd(3, -1) → g = -1 (sign follows the remainders)
    assert lm.extended_gcd(-7, 3) == (-1, 1, 2)


def test_modular() -> None:
    assert lm.mod_pow(2, 10, 1000) == 24
    assert lm.mod_pow(-2, 3, 5) == 2
    assert lm.mod_pow(5, 0, 1) == 0
    with pytest.raises(AlgoError) as e:
        lm.mod_pow(2, -1, 5)
    assert e.value.code == "OUT_OF_RANGE"
    with pytest.raises(AlgoError):
        lm.mod_pow(2, 1, 0)
    assert lm.mod_inverse(3, 11) == 4
    with pytest.raises(AlgoError) as e:
        lm.mod_inverse(6, 9)
    assert e.value.code == "NO_INVERSE"
    with pytest.raises(AlgoError):
        lm.mod_inverse(3, 0)
    with pytest.raises(AlgoError) as e:
        lm.crt([1, 1], [4, 6])
    assert e.value.code == "NOT_COPRIME"


def test_primes() -> None:
    assert lm.is_prime(2) and lm.is_prime(97) and lm.is_prime(2147483647)
    assert not lm.is_prime(1) and not lm.is_prime(4) and not lm.is_prime(100)
    assert lm.is_prime(2**89 - 1)
    assert lm.sieve(1) == []
    assert lm.sieve(30) == [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    assert lm.segmented_sieve(0, 30) == lm.sieve(30)
    assert lm.segmented_sieve(90, 110) == [97, 101, 103, 107, 109]
    assert lm.segmented_sieve(10, 5) == []


def test_factorize() -> None:
    assert lm.factorize(1) == []
    assert lm.factorize(-12) == [2, 2, 3]
    assert lm.factorize(41 * 41 * 43) == [41, 41, 43]
    n = 1000003 * 998244353
    assert lm.factorize(n) == [1000003, 998244353]
    assert lm.pollard_rho(10) == 2
    with pytest.raises(AlgoError):
        lm.pollard_rho(13)


def test_karatsuba() -> None:
    rng = random.Random(3)
    for _ in range(50):
        x = rng.randrange(-(10**40), 10**40)
        y = rng.randrange(-(10**30), 10**30)
        assert lm.karatsuba(x, y) == x * y


def test_ntt_roundtrip_and_poly() -> None:
    a = [1, 2, 3, 4, 0, 0, 0, 0]
    assert lm.intt(lm.ntt(a)) == a
    assert lm.poly_mul_ntt([1, 2, 3], [4, 5]) == [4, 13, 22, 15]
    with pytest.raises(AlgoError):
        lm.ntt([1, 2, 3])
    with pytest.raises(AlgoError):
        lm.ntt([])
    with pytest.raises(AlgoError):
        lm.ntt([1, 2, 3, 4], mod=7)


def test_matrices() -> None:
    a = [[1, 2], [3, 4]]
    b = [[5, 6], [7, 8]]
    assert lm.mat_mul(a, b) == [[19, 22], [43, 50]]
    with pytest.raises(AlgoError):
        lm.mat_mul([[1, 2]], [[1, 2]])
    assert lm.strassen_mul(a, b) == [[19, 22], [43, 50]]
    assert lm.strassen_mul([], []) == []
    with pytest.raises(AlgoError):
        lm.strassen_mul([[1, 2]], [[1, 2]])
    rng = random.Random(5)
    n = 70  # > 64: exercises the recursive split and padding
    m1 = [[rng.randrange(-9, 10) for _ in range(n)] for _ in range(n)]
    m2 = [[rng.randrange(-9, 10) for _ in range(n)] for _ in range(n)]
    assert lm.strassen_mul(m1, m2) == lm.mat_mul(m1, m2)

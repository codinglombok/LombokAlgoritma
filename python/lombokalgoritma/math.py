# LombokAlgoritma — Python Math Module (SPEC §10)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
"""Number theory, NTT and matrix multiplication — exact integer arithmetic (Python ``int``).

Where the SPEC prescribes truncated division (``quo``/``rem`` as in C / JS BigInt), it is
emulated explicitly — Python's ``//`` and ``%`` floor instead.

Cryptography (SHA-256, HMAC, HKDF) was removed in v0.2.0 → ``lombokencryptdecrypt`` (ADR-016).
"""

from __future__ import annotations

import math as _stdmath
from collections.abc import Sequence
from typing import NamedTuple, TypeVar

from .errors import InvalidInputError, NoInverseError, NotCoprimeError, OutOfRangeError

__all__ = [
    "ExtendedGcd",
    "Matrix",
    "crt",
    "extended_gcd",
    "factorize",
    "gcd",
    "intt",
    "is_prime",
    "karatsuba",
    "lcm",
    "mat_mul",
    "mod_inverse",
    "mod_pow",
    "next_prime",
    "ntt",
    "pollard_rho",
    "poly_mul_ntt",
    "segmented_sieve",
    "sieve",
    "strassen_mul",
]

Num = TypeVar("Num", int, float)
Matrix = list[list[Num]]


def _tquo(a: int, b: int) -> int:
    """Quotient truncated toward zero (C / JS BigInt ``/``)."""
    q = abs(a) // abs(b)
    return q if (a < 0) == (b < 0) else -q


def _trem(a: int, b: int) -> int:
    """Remainder with the sign of the dividend (C / JS BigInt ``%``)."""
    return a - b * _tquo(a, b)


def gcd(a: int, b: int) -> int:
    """Greatest common divisor, always ``>= 0``; ``gcd(0, 0) = 0``."""
    a, b = abs(a), abs(b)
    while b:
        a, b = b, a % b
    return a


def lcm(a: int, b: int) -> int:
    """Least common multiple ``|a / gcd(a, b) · b|``; 0 when either argument is 0."""
    if a == 0 or b == 0:
        return 0
    return abs(_tquo(a, gcd(a, b)) * b)


class ExtendedGcd(NamedTuple):
    """``a·x + b·y = g``."""

    g: int
    x: int
    y: int


def extended_gcd(a: int, b: int) -> ExtendedGcd:
    """Extended Euclid with truncated ``quo`` / ``rem`` (SPEC §10): ``a·x + b·y = g``."""
    # iterative form of: b = 0 → (a, 1, 0); else (g, x1, y1) = egcd(b, a rem b) → (g, y1, x1 − q·y1)
    quotients: list[int] = []
    while b != 0:
        quotients.append(_tquo(a, b))
        a, b = b, _trem(a, b)
    x, y = 1, 0
    for q in reversed(quotients):
        x, y = y, x - q * y
    return ExtendedGcd(a, x, y)


def mod_inverse(a: int, m: int) -> int:
    """Inverse of ``a`` modulo ``m`` in ``[0, m)``.

    Raises:
        NoInverseError: ``gcd(a, m) != 1``.
        OutOfRangeError: ``m == 0``.
    """
    if m == 0:
        raise OutOfRangeError("mod_inverse: modulus must be non-zero")
    g, x, _ = extended_gcd(_trem(_trem(a, m) + m, m), m)
    if g != 1:
        raise NoInverseError(f"no modular inverse: gcd({a}, {m}) = {g}")
    return _trem(_trem(x, m) + m, m)


def mod_pow(base: int, exp: int, m: int) -> int:
    """``base^exp mod m`` in ``[0, m)`` (a negative base is normalised first).

    Raises:
        OutOfRangeError: ``m < 1`` or ``exp < 0``.
    """
    if m < 1 or exp < 0:
        raise OutOfRangeError("mod_pow: need m >= 1 and exp >= 0")
    if m == 1:
        return 0
    return pow(base % m, exp, m)


def crt(remainders: Sequence[int], moduli: Sequence[int]) -> int:
    """Chinese Remainder Theorem: the unique ``x`` in ``[0, Π m_i)``.

    Raises:
        InvalidInputError: the sequences differ in length.
        NotCoprimeError: the moduli are not pairwise coprime.
    """
    if len(remainders) != len(moduli):
        raise InvalidInputError("crt: remainders and moduli must have equal length")
    big_m = 1
    for m in moduli:
        big_m *= m
    x = 0
    for r, mi in zip(remainders, moduli, strict=True):
        big_mi = _tquo(big_m, mi)
        g, inv, _ = extended_gcd(_trem(big_mi, mi), mi)
        if g not in (1, -1):
            raise NotCoprimeError("crt: moduli must be pairwise coprime")
        inv_mi = _trem(_trem(inv, mi) + mi, mi)
        ri = _trem(_trem(r, mi) + mi, mi)
        x = _trem(x + _trem(ri * big_mi, big_m) * inv_mi, big_m)
    return _trem(_trem(x, big_m) + big_m, big_m)


_WITNESSES = (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37)


def is_prime(n: int) -> bool:
    """Deterministic Miller–Rabin (witnesses 2 … 37); exact for n < 3.3·10^24."""
    if n < 2:
        return False
    if n in (2, 3, 5, 7):
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    d, r = n - 1, 0
    while d % 2 == 0:
        d //= 2
        r += 1
    for a in _WITNESSES:
        if a >= n:
            continue
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(r - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False
    return True


def next_prime(n: int) -> int:
    """Smallest prime ``>= n`` (``n <= 2 → 2``)."""
    if n <= 2:
        return 2
    candidate = n + 1 if n % 2 == 0 else n
    while not is_prime(candidate):
        candidate += 2
    return candidate


def sieve(n: int) -> list[int]:
    """All primes ``<= n`` ascending (Eratosthenes)."""
    if n < 2:
        return []
    composite = bytearray(n + 1)
    composite[0] = composite[1] = 1
    i = 2
    while i * i <= n:
        if not composite[i]:
            composite[i * i :: i] = b"\x01" * len(range(i * i, n + 1, i))
        i += 1
    return [i for i in range(2, n + 1) if not composite[i]]


def _ceil_sqrt(n: int) -> int:
    if n <= 0:
        return 0
    r = _stdmath.isqrt(n)
    return r if r * r == n else r + 1


def segmented_sieve(lo: int, hi: int) -> list[int]:
    """All primes in ``[lo, hi]`` ascending."""
    size = hi - lo + 1
    if size <= 0:
        return []
    composite = bytearray(size)
    for p in sieve(_ceil_sqrt(hi)):
        start = max(p * p, -(-lo // p) * p)
        if start == p:
            start += p
        for j in range(start, hi + 1, p):
            composite[j - lo] = 1
    return [lo + i for i in range(size) if not composite[i] and lo + i > 1]


def pollard_rho(n: int) -> int:
    """A non-trivial factor of composite ``n`` (Floyd cycle, ``x0 = 2``, ``c = 1, 2, …``).

    Raises:
        InvalidInputError: ``n < 4`` or ``n`` is prime.
    """
    if n < 4 or is_prime(n):
        raise InvalidInputError("pollard_rho: n must be composite")
    if n % 2 == 0:
        return 2
    c = 1
    while True:
        x = y = 2
        d = 1
        while d == 1:
            x = (x * x + c) % n
            y = (y * y + c) % n
            y = (y * y + c) % n
            d = gcd(x - y, n)
        if d != n:
            return d
        c += 1


def factorize(n: int) -> list[int]:
    """Prime factors ascending with multiplicity; ``|n| <= 1 → []`` (sign ignored)."""
    n = abs(n)
    out: list[int] = []
    for p in _WITNESSES:
        while n % p == 0:
            out.append(p)
            n //= p
    stack = [n] if n > 1 else []
    while stack:
        m = stack.pop()
        if is_prime(m):
            out.append(m)
            continue
        d = pollard_rho(m)
        stack += [d, m // d]
    return sorted(out)


def karatsuba(x: int, y: int) -> int:
    """Exact product by Karatsuba (decimal split, base case below 1000)."""
    if x < 0:
        return -karatsuba(-x, y)
    if y < 0:
        return -karatsuba(x, -y)
    if x < 1000 or y < 1000:
        return x * y
    n = max(len(str(x)), len(str(y)))
    b: int = pow(10, (n + 1) // 2)
    x1, x0 = divmod(x, b)
    y1, y0 = divmod(y, b)
    z0 = karatsuba(x0, y0)
    z2 = karatsuba(x1, y1)
    z1 = karatsuba(x0 + x1, y0 + y1) - z2 - z0
    return z2 * b * b + z1 * b + z0


NTT_MOD = 998244353
NTT_G = 3


def ntt(a: Sequence[int], mod: int = NTT_MOD, g: int = NTT_G) -> list[int]:
    """Forward NTT ``A_k = Σ a_j·ω^{jk} mod p`` in natural order (iterative Cooley–Tukey).

    Raises:
        InvalidInputError: the length is not a power of two dividing ``mod − 1``.
    """
    n = len(a)
    if n == 0 or n & (n - 1):
        raise InvalidInputError("ntt: length must be a power of two")
    if (mod - 1) % n != 0:
        raise InvalidInputError("ntt: length must divide mod - 1")
    res = list(a)
    j = 0
    for i in range(1, n):
        bit = n >> 1
        while j & bit:
            j ^= bit
            bit >>= 1
        j ^= bit
        if i < j:
            res[i], res[j] = res[j], res[i]
    length = 2
    while length <= n:
        w = mod_pow(g, (mod - 1) // length, mod)
        half = length // 2
        for i in range(0, n, length):
            wn = 1
            for k in range(half):
                u = res[i + k]
                v = _trem(res[i + k + half] * wn, mod)
                res[i + k] = _trem(u + v, mod)
                res[i + k + half] = _trem(u - v + mod, mod)
                wn = wn * w % mod
        length <<= 1
    return res


def intt(a: Sequence[int], mod: int = NTT_MOD, g: int = NTT_G) -> list[int]:
    """Inverse NTT."""
    res = ntt(a, mod, mod_pow(g, mod - 2, mod))
    n_inv = mod_pow(len(a), mod - 2, mod)
    return [_trem(x * n_inv, mod) for x in res]


def poly_mul_ntt(a: Sequence[int], b: Sequence[int], mod: int = NTT_MOD) -> list[int]:
    """Coefficients of ``a·b`` mod ``p`` (length ``|a| + |b| − 1``) via NTT."""
    n = 1
    while n < len(a) + len(b):
        n <<= 1
    ta = ntt(list(a) + [0] * (n - len(a)), mod)
    tb = ntt(list(b) + [0] * (n - len(b)), mod)
    tc = [_trem(x * y, mod) for x, y in zip(ta, tb, strict=True)]
    return intt(tc, mod)[: max(0, len(a) + len(b) - 1)]


def mat_mul(a: Sequence[Sequence[Num]], b: Sequence[Sequence[Num]]) -> list[list[Num]]:
    """Naive product ``C_ij = Σ_l A_il·B_lj`` (``l`` ascending from 0).

    Raises:
        InvalidInputError: the inner dimensions differ.
    """
    n, k = len(a), len(b)
    m = len(b[0]) if k else 0
    if any(len(row) != k for row in a):
        raise InvalidInputError("mat_mul: inner dimensions differ")
    out: list[list[Num]] = []
    for i in range(n):
        ai = a[i]
        row: list[Num] = []
        for j in range(m):
            s: Num = 0
            for lx in range(k):
                s += ai[lx] * b[lx][j]
            row.append(s)
        out.append(row)
    return out


def _add(a: list[list[Num]], b: list[list[Num]]) -> list[list[Num]]:
    return [[x + y for x, y in zip(ra, rb, strict=True)] for ra, rb in zip(a, b, strict=True)]


def _sub(a: list[list[Num]], b: list[list[Num]]) -> list[list[Num]]:
    return [[x - y for x, y in zip(ra, rb, strict=True)] for ra, rb in zip(a, b, strict=True)]


def _strassen(a: list[list[Num]], b: list[list[Num]]) -> list[list[Num]]:
    n = len(a)
    if n <= 64:
        return mat_mul(a, b)
    h = n >> 1

    def split(m: list[list[Num]]) -> tuple[list[list[Num]], ...]:
        return (
            [r[:h] for r in m[:h]],
            [r[h:] for r in m[:h]],
            [r[:h] for r in m[h:]],
            [r[h:] for r in m[h:]],
        )

    a11, a12, a21, a22 = split(a)
    b11, b12, b21, b22 = split(b)
    m1 = _strassen(_add(a11, a22), _add(b11, b22))
    m2 = _strassen(_add(a21, a22), b11)
    m3 = _strassen(a11, _sub(b12, b22))
    m4 = _strassen(a22, _sub(b21, b11))
    m5 = _strassen(_add(a11, a12), b22)
    m6 = _strassen(_sub(a21, a11), _add(b11, b12))
    m7 = _strassen(_sub(a12, a22), _add(b21, b22))
    c11 = _add(_sub(_add(m1, m4), m5), m7)
    c12 = _add(m3, m5)
    c21 = _add(m2, m4)
    c22 = _add(_sub(_add(m1, m3), m2), m6)
    return [r1 + r2 for r1, r2 in zip(c11, c12, strict=True)] + [
        r1 + r2 for r1, r2 in zip(c21, c22, strict=True)
    ]


def strassen_mul(a: Sequence[Sequence[Num]], b: Sequence[Sequence[Num]]) -> list[list[Num]]:
    """Strassen product of two ``n×n`` matrices (zero-padded to a power of two).

    Raises:
        InvalidInputError: ``a`` or ``b`` is not ``n×n``.
    """
    n = len(a)

    def square(m: Sequence[Sequence[Num]]) -> bool:
        return len(m) == n and all(len(r) == n for r in m)

    if not square(a) or not square(b):
        raise InvalidInputError("strassen_mul: a and b must both be n×n")
    if n == 0:
        return []
    p = 1
    while p < n:
        p <<= 1

    def pad(m: Sequence[Sequence[Num]]) -> list[list[Num]]:
        return [[m[i][j] if i < n and j < n else 0 for j in range(p)] for i in range(p)]

    return [r[:n] for r in _strassen(pad(a), pad(b))[:n]]

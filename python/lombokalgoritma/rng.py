# LombokAlgoritma — deterministic PRNGs (SPEC §5)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
"""SplitMix64, xoshiro256++ and PCG32 (PCG-XSH-RR 64/32). Deterministic — NOT for secrets."""

from __future__ import annotations

from .errors import OutOfRangeError

_M64 = (1 << 64) - 1
_M32 = 0xFFFFFFFF
_MAX_SAFE = (1 << 53) - 1


def _is_int(x: object) -> bool:
    return isinstance(x, int) and not isinstance(x, bool)


class SplitMix64:
    """SplitMix64 (Steele, Lea, Flood 2014); state starts at ``seed`` (mod 2^64)."""

    def __init__(self, seed: int) -> None:
        self._x = seed & _M64

    def next(self) -> int:
        """Next 64-bit output (unsigned int)."""
        self._x = (self._x + 0x9E3779B97F4A7C15) & _M64
        z = self._x
        z = ((z ^ (z >> 30)) * 0xBF58476D1CE4E5B9) & _M64
        z = ((z ^ (z >> 27)) * 0x94D049BB133111EB) & _M64
        return z ^ (z >> 31)


def _rotl64(x: int, k: int) -> int:
    return ((x << k) | (x >> (64 - k))) & _M64


class Xoshiro256pp:
    """xoshiro256++ (Blackman & Vigna); state = four SplitMix64(seed) outputs."""

    def __init__(self, seed: int = 0x123456789ABCDEF0) -> None:
        sm = SplitMix64(seed)
        self._s = [sm.next() for _ in range(4)]

    def next(self) -> int:
        """Next 64-bit output (unsigned int)."""
        s0, s1, s2, s3 = self._s
        result = (_rotl64((s0 + s3) & _M64, 23) + s0) & _M64
        t = (s1 << 17) & _M64
        n2 = s2 ^ s0
        n3 = s3 ^ s1
        n1 = s1 ^ n2
        n0 = s0 ^ n3
        self._s = [n0, n1, n2 ^ t, _rotl64(n3, 45)]
        return result

    def next_float(self) -> float:
        """Float in [0, 1): ``(next() >> 11) / 2^53`` (exact)."""
        return (self.next() >> 11) / 9007199254740992.0

    def next_int(self, n: int) -> int:
        """Unbiased integer in ``[0, n)``, ``1 <= n <= 2^53 - 1`` (rejection sampling)."""
        if not _is_int(n) or n < 1 or n > _MAX_SAFE:
            raise OutOfRangeError("next_int: n must be an integer in [1, 2^53)")
        threshold = (1 << 64) % n
        while True:
            r = self.next()
            if r >= threshold:
                return r % n


class Pcg32:
    """PCG32 (PCG-XSH-RR 64/32) per pcg-c ``pcg32_srandom_r(initstate, initseq)``."""

    def __init__(
        self, init_state: int = 0x853C49E6748FEA9B, init_seq: int = 0xDA3E39CB94B95BDB
    ) -> None:
        self._inc = (((init_seq & _M64) << 1) | 1) & _M64
        self._state = 0
        self._step()
        self._state = (self._state + (init_state & _M64)) & _M64
        self._step()

    def _step(self) -> None:
        self._state = (self._state * 6364136223846793005 + self._inc) & _M64

    def next(self) -> int:
        """Next 32-bit output (unsigned int)."""
        old = self._state
        self._step()
        xs = (((old >> 18) ^ old) >> 27) & _M32
        rot = old >> 59
        return ((xs >> rot) | (xs << ((32 - rot) & 31))) & _M32

    def next_bounded(self, bound: int) -> int:
        """Unbiased integer in ``[0, bound)``, ``1 <= bound <= 2^32 - 1`` (pcg32_boundedrand_r)."""
        if not _is_int(bound) or bound < 1 or bound > _M32:
            raise OutOfRangeError("next_bounded: bound must be an integer in [1, 2^32)")
        threshold = ((1 << 32) - bound) % bound
        while True:
            r = self.next()
            if r >= threshold:
                return r % bound

    def next_float(self) -> float:
        """Float in [0, 1) with 32 bits of precision: ``next() / 2^32``."""
        return self.next() / 4294967296.0

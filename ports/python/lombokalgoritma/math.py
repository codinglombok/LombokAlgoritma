# LombokAlgoritma — Python Math Module
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

import hashlib
import hmac as _hmac
import warnings

_DEPRECATED = "moved to lombokencryptdecrypt; removed in lombokalgoritma v0.2.0"


def _warn(name: str) -> None:
    warnings.warn(
        f"lombokalgoritma.{name} is deprecated: {_DEPRECATED}", DeprecationWarning, stacklevel=3
    )


def sha256(data: bytes | str) -> bytes:
    """SHA-256 via ``hashlib``. Deprecated: moved to lombokencryptdecrypt (removed in v0.2.0)."""
    _warn("sha256")
    if isinstance(data, str):
        data = data.encode()
    return hashlib.sha256(data).digest()


def sha256_hex(data: bytes | str) -> str:
    """SHA-256 as hex. Deprecated: moved to lombokencryptdecrypt (removed in v0.2.0)."""
    _warn("sha256_hex")
    if isinstance(data, str):
        data = data.encode()
    return hashlib.sha256(data).hexdigest()


def hmac_sha256(key: bytes, data: bytes) -> bytes:
    """HMAC-SHA-256. Deprecated: moved to lombokencryptdecrypt (removed in v0.2.0)."""
    _warn("hmac_sha256")
    return _hmac.new(key, data, hashlib.sha256).digest()


def hkdf(ikm: bytes, length: int, *, salt: bytes | None = None, info: bytes = b"") -> bytes:
    """HKDF-SHA-256 (RFC 5869). Deprecated: moved to lombokencryptdecrypt (removed in v0.2.0)."""
    _warn("hkdf")
    if not 0 <= length <= 255 * 32:
        raise ValueError("hkdf: length must be in [0, 8160]")
    prk = _hmac.new(salt if salt is not None else bytes(32), ikm, hashlib.sha256).digest()
    okm = b""
    prev = b""
    for i in range(1, -(-length // 32) + 1):
        prev = _hmac.new(prk, prev + info + bytes([i]), hashlib.sha256).digest()
        okm += prev
    return okm[:length]


def gcd(a: int, b: int) -> int:
    """Greatest common divisor (non-negative)."""
    while b:
        a, b = b, a % b
    return abs(a)


def lcm(a: int, b: int) -> int:
    """Least common multiple (non-negative); ``lcm(0, x) = 0``."""
    return abs(a * b) // gcd(a, b) if a and b else 0


def mod_pow(base: int, exp: int, m: int) -> int:
    """``base**exp % m`` (built-in three-argument ``pow``)."""
    return pow(base, exp, m)


def mod_inverse(a: int, m: int) -> int | None:
    """Inverse of ``a`` modulo ``m``, or ``None`` when gcd(a, m) != 1."""
    g, x, _ = _ext_gcd(a % m, m)
    return x % m if g == 1 else None


def _ext_gcd(a: int, b: int) -> tuple[int, int, int]:
    x0, x1, y0, y1 = 1, 0, 0, 1
    while b:
        q, a, b = a // b, b, a % b
        x0, x1 = x1, x0 - q * x1
        y0, y1 = y1, y0 - q * y1
    return a, x0, y0


def crt(remainders: list[int], moduli: list[int]) -> int:
    """Chinese Remainder Theorem for pairwise-coprime moduli; result in ``[0, Π m_i)``."""
    if len(remainders) != len(moduli):
        raise ValueError("crt: remainders and moduli must have equal length")
    big_m = 1
    for m in moduli:
        big_m *= m
    x = 0
    for r, m in zip(remainders, moduli, strict=True):
        mi = big_m // m
        inv = mod_inverse(mi, m)
        if inv is None:
            raise ValueError("crt: moduli must be pairwise coprime")
        x = (x + (r % m) * mi * inv) % big_m
    return x


_MR_BASES = (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37)


def is_prime(n: int) -> bool:
    """Deterministic Miller-Rabin for n < 3.3·10^24 (first 12 prime bases)."""
    if n < 2:
        return False
    for p in _MR_BASES:
        if n % p == 0:
            return n == p
    d, r = n - 1, 0
    while d % 2 == 0:
        d //= 2
        r += 1
    for a in _MR_BASES:
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
    """Smallest prime ``>= n``."""
    if n <= 2:
        return 2
    candidate = n if n % 2 else n + 1
    while not is_prime(candidate):
        candidate += 2
    return candidate

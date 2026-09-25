# LombokAlgoritma — non-cryptographic hashes (SPEC §12)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
"""FNV-1a 32/64, MurmurHash3_x86_32, xxHash32, xxHash64 and SipHash-2-4.

Strings are hashed as their UTF-8 encoding. None of these is a cryptographic hash or MAC —
SHA-2 / HMAC / HKDF moved to ``lombokencryptdecrypt`` in v0.2.0 (ADR-016).
"""

from __future__ import annotations

from .errors import InvalidInputError

_M32 = 0xFFFFFFFF
_M64 = 0xFFFFFFFFFFFFFFFF

__all__ = [
    "fmix32",
    "fnv1a32",
    "fnv1a64",
    "murmur3_32",
    "siphash24",
    "xxhash32",
    "xxhash64",
]


def _bytes(data: bytes | bytearray | str) -> bytes:
    return data.encode("utf-8") if isinstance(data, str) else bytes(data)


def fnv1a32(data: bytes | bytearray | str) -> int:
    """FNV-1a 32-bit."""
    h = 0x811C9DC5
    for b in _bytes(data):
        h = ((h ^ b) * 0x01000193) & _M32
    return h


def fnv1a64(data: bytes | bytearray | str) -> int:
    """FNV-1a 64-bit (unsigned int)."""
    h = 0xCBF29CE484222325
    for b in _bytes(data):
        h = ((h ^ b) * 0x00000100000001B3) & _M64
    return h


def _rotl32(x: int, r: int) -> int:
    return ((x << r) | (x >> (32 - r))) & _M32


def _rotl64(x: int, r: int) -> int:
    return ((x << r) | (x >> (64 - r))) & _M64


def fmix32(h: int) -> int:
    """MurmurHash3 32-bit finalizer."""
    h &= _M32
    h ^= h >> 16
    h = (h * 0x85EBCA6B) & _M32
    h ^= h >> 13
    h = (h * 0xC2B2AE35) & _M32
    return h ^ (h >> 16)


def murmur3_32(data: bytes | bytearray | str, seed: int = 0) -> int:
    """MurmurHash3_x86_32 (Appleby) with a u32 ``seed``."""
    d = _bytes(data)
    c1, c2 = 0xCC9E2D51, 0x1B873593
    h = seed & _M32
    n4 = len(d) & ~3
    for i in range(0, n4, 4):
        k = int.from_bytes(d[i : i + 4], "little")
        k = (_rotl32((k * c1) & _M32, 15) * c2) & _M32
        h ^= k
        h = (_rotl32(h, 13) * 5 + 0xE6546B64) & _M32
    tail = d[n4:]
    if tail:
        k = int.from_bytes(tail, "little")
        h ^= (_rotl32((k * c1) & _M32, 15) * c2) & _M32
    return fmix32(h ^ len(d))


_P1, _P2, _P3, _P4, _P5 = 0x9E3779B1, 0x85EBCA77, 0xC2B2AE3D, 0x27D4EB2F, 0x165667B1


def xxhash32(data: bytes | bytearray | str, seed: int = 0) -> int:
    """xxHash32 (XXH32) per the reference specification."""
    d = _bytes(data)
    n = len(d)
    s = seed & _M32
    i = 0
    if n >= 16:
        v = [(s + _P1 + _P2) & _M32, (s + _P2) & _M32, s, (s - _P1) & _M32]
        while i + 16 <= n:
            for lane in range(4):
                w = int.from_bytes(d[i + 4 * lane : i + 4 * lane + 4], "little")
                v[lane] = (_rotl32((v[lane] + w * _P2) & _M32, 13) * _P1) & _M32
            i += 16
        h = (_rotl32(v[0], 1) + _rotl32(v[1], 7) + _rotl32(v[2], 12) + _rotl32(v[3], 18)) & _M32
    else:
        h = (s + _P5) & _M32
    h = (h + n) & _M32
    while i + 4 <= n:
        w = int.from_bytes(d[i : i + 4], "little")
        h = (_rotl32((h + w * _P3) & _M32, 17) * _P4) & _M32
        i += 4
    while i < n:
        h = (_rotl32((h + d[i] * _P5) & _M32, 11) * _P1) & _M32
        i += 1
    h ^= h >> 15
    h = (h * _P2) & _M32
    h ^= h >> 13
    h = (h * _P3) & _M32
    return h ^ (h >> 16)


_Q1 = 0x9E3779B185EBCA87
_Q2 = 0xC2B2AE3D27D4EB4F
_Q3 = 0x165667B19E3779F9
_Q4 = 0x85EBCA77C2B2AE63
_Q5 = 0x27D4EB2F165667C5


def _xx64_round(acc: int, lane: int) -> int:
    return (_rotl64((acc + lane * _Q2) & _M64, 31) * _Q1) & _M64


def _xx64_merge(acc: int, val: int) -> int:
    return (((acc ^ _xx64_round(0, val)) * _Q1) + _Q4) & _M64


def xxhash64(data: bytes | bytearray | str, seed: int = 0) -> int:
    """xxHash64 (XXH64) per the reference specification; unsigned 64-bit result."""
    b = _bytes(data)
    n = len(b)
    s = seed & _M64
    i = 0
    if n >= 32:
        v1 = (s + _Q1 + _Q2) & _M64
        v2 = (s + _Q2) & _M64
        v3 = s
        v4 = (s - _Q1) & _M64
        while i <= n - 32:
            v1 = _xx64_round(v1, int.from_bytes(b[i : i + 8], "little"))
            v2 = _xx64_round(v2, int.from_bytes(b[i + 8 : i + 16], "little"))
            v3 = _xx64_round(v3, int.from_bytes(b[i + 16 : i + 24], "little"))
            v4 = _xx64_round(v4, int.from_bytes(b[i + 24 : i + 32], "little"))
            i += 32
        h = (_rotl64(v1, 1) + _rotl64(v2, 7) + _rotl64(v3, 12) + _rotl64(v4, 18)) & _M64
        for v in (v1, v2, v3, v4):
            h = _xx64_merge(h, v)
    else:
        h = (s + _Q5) & _M64
    h = (h + n) & _M64
    while i + 8 <= n:
        h ^= _xx64_round(0, int.from_bytes(b[i : i + 8], "little"))
        h = (_rotl64(h, 27) * _Q1 + _Q4) & _M64
        i += 8
    if i + 4 <= n:
        h ^= (int.from_bytes(b[i : i + 4], "little") * _Q1) & _M64
        h = (_rotl64(h, 23) * _Q2 + _Q3) & _M64
        i += 4
    while i < n:
        h ^= (b[i] * _Q5) & _M64
        h = (_rotl64(h, 11) * _Q1) & _M64
        i += 1
    h ^= h >> 33
    h = (h * _Q2) & _M64
    h ^= h >> 29
    h = (h * _Q3) & _M64
    return h ^ (h >> 32)


def siphash24(key: bytes | bytearray, data: bytes | bytearray | str) -> int:
    """SipHash-2-4 of ``data`` under a 16-byte ``key``; the LE output read as an unsigned u64.

    A keyed PRF for hash tables — not a protocol MAC.

    Raises:
        InvalidInputError: the key is not 16 bytes.
    """
    if len(key) != 16:
        raise InvalidInputError("siphash24: key must be 16 bytes")
    m = _bytes(data)
    k0 = int.from_bytes(key[0:8], "little")
    k1 = int.from_bytes(key[8:16], "little")
    v = [
        k0 ^ 0x736F6D6570736575,
        k1 ^ 0x646F72616E646F6D,
        k0 ^ 0x6C7967656E657261,
        k1 ^ 0x7465646279746573,
    ]

    def sip_round() -> None:
        v0, v1, v2, v3 = v
        v0 = (v0 + v1) & _M64
        v1 = _rotl64(v1, 13) ^ v0
        v0 = _rotl64(v0, 32)
        v2 = (v2 + v3) & _M64
        v3 = _rotl64(v3, 16) ^ v2
        v0 = (v0 + v3) & _M64
        v3 = _rotl64(v3, 21) ^ v0
        v2 = (v2 + v1) & _M64
        v1 = _rotl64(v1, 17) ^ v2
        v2 = _rotl64(v2, 32)
        v[:] = [v0, v1, v2, v3]

    n = len(m)
    end = n - (n % 8)
    for i in range(0, end, 8):
        w = int.from_bytes(m[i : i + 8], "little")
        v[3] ^= w
        sip_round()
        sip_round()
        v[0] ^= w
    last = ((n & 0xFF) << 56) | int.from_bytes(m[end:], "little")
    v[3] ^= last
    sip_round()
    sip_round()
    v[0] ^= last
    v[2] ^= 0xFF
    for _ in range(4):
        sip_round()
    return v[0] ^ v[1] ^ v[2] ^ v[3]

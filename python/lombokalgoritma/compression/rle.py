# LombokAlgoritma — run-length encoding (SPEC §13.3)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from ..errors import InvalidInputError


def rle_encode(data: bytes | bytearray) -> bytes:
    """``(count, value)`` pairs with ``1 <= count <= 255`` (longer runs are split)."""
    out = bytearray()
    i, n = 0, len(data)
    while i < n:
        val = data[i]
        run = 1
        while i + run < n and data[i + run] == val and run < 255:
            run += 1
        out += bytes((run, val))
        i += run
    return bytes(out)


def rle_decode(data: bytes | bytearray) -> bytes:
    """Inverse of :func:`rle_encode`.

    Raises:
        InvalidInputError: odd length or a zero count.
    """
    if len(data) % 2:
        raise InvalidInputError("rle_decode: input length must be even")
    out = bytearray()
    for i in range(0, len(data), 2):
        run = data[i]
        if run == 0:
            raise InvalidInputError("rle_decode: zero run length")
        out += bytes((data[i + 1],)) * run
    return bytes(out)

# LombokAlgoritma — LZ77, byte-oriented, window <= 255 (SPEC §13.3)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from ..errors import InvalidInputError, OutOfRangeError


def lz77_compress(data: bytes | bytearray, window: int = 255) -> bytes:
    """Tokens ``00 lit`` / ``01 off len`` (``3 <= len <= 255``, ``1 <= off <= window``).

    Greedy longest match; among equally long matches the largest offset wins.

    Raises:
        OutOfRangeError: ``window`` not an integer in [1, 255].
    """
    if isinstance(window, bool) or not isinstance(window, int) or not 1 <= window <= 255:
        raise OutOfRangeError("lz77_compress: window must be an integer in [1, 255]")
    out = bytearray()
    i, n = 0, len(data)
    while i < n:
        best_len = best_off = 0
        for j in range(max(0, i - window), i):
            length = 0
            while i + length < n and data[j + length] == data[i + length] and length < 255:
                length += 1
            if length > best_len:
                best_len, best_off = length, i - j
        if best_len >= 3:
            out += bytes((1, best_off, best_len))
            i += best_len
        else:
            out += bytes((0, data[i]))
            i += 1
    return bytes(out)


def lz77_decompress(data: bytes | bytearray) -> bytes:
    """Inverse of :func:`lz77_compress`.

    Raises:
        InvalidInputError: bad flag, truncated token, or an offset of 0 / beyond the output.
    """
    out = bytearray()
    i, n = 0, len(data)
    while i < n:
        flag = data[i]
        i += 1
        if flag == 0:
            if i >= n:
                raise InvalidInputError("lz77_decompress: truncated literal")
            out.append(data[i])
            i += 1
        elif flag == 1:
            if i + 1 >= n:
                raise InvalidInputError("lz77_decompress: truncated match")
            off, length = data[i], data[i + 1]
            i += 2
            if off == 0 or off > len(out):
                raise InvalidInputError("lz77_decompress: bad offset")
            start = len(out) - off
            for j in range(length):
                out.append(out[start + j])
        else:
            raise InvalidInputError(f"lz77_decompress: bad token flag {flag}")
    return bytes(out)

# LombokAlgoritma — static Huffman coding (SPEC §13.3)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

import heapq
from dataclasses import dataclass

from ..errors import InvalidInputError


@dataclass
class HuffNode:
    """Huffman tree node: a leaf carries ``symbol``; an internal node has both children."""

    freq: int
    symbol: int | None = None
    left: HuffNode | None = None
    right: HuffNode | None = None


@dataclass
class HuffmanResult:
    """Packed code bits (MSB first, zero-padded), bit length, per-byte codes and the tree."""

    encoded: bytes
    bit_length: int
    codes: dict[int, str]
    tree: HuffNode


def huffman_encode(data: bytes | bytearray) -> HuffmanResult:
    """Deterministic static Huffman code: min-heap keyed ``(freq, id)``, leaves by byte value.

    Left edge = '0', right = '1'; a single-symbol input uses code "0".
    """
    codes: dict[int, str] = {}
    if len(data) == 0:
        return HuffmanResult(b"", 0, codes, HuffNode(0))
    freq = [0] * 256
    for b in data:
        freq[b] += 1
    heap: list[tuple[int, int, HuffNode]] = []
    nid = 0
    for s in range(256):
        if freq[s]:
            heap.append((freq[s], nid, HuffNode(freq[s], s)))
            nid += 1
    heapq.heapify(heap)
    while len(heap) > 1:
        fl, _, left = heapq.heappop(heap)
        fr, _, right = heapq.heappop(heap)
        heapq.heappush(heap, (fl + fr, nid, HuffNode(fl + fr, None, left, right)))
        nid += 1
    tree = heap[0][2]
    stack: list[tuple[HuffNode, str]] = [(tree, "")]
    while stack:
        node, code = stack.pop()
        if node.symbol is not None:
            codes[node.symbol] = code or "0"
            continue
        assert node.left is not None and node.right is not None  # noqa: S101 — internal node
        stack.append((node.right, code + "1"))
        stack.append((node.left, code + "0"))
    bits = "".join(codes[b] for b in data)
    bit_length = len(bits)
    padded = bits + "0" * (-bit_length % 8)
    encoded = int(padded, 2).to_bytes(len(padded) // 8, "big") if padded else b""
    return HuffmanResult(encoded, bit_length, dict(sorted(codes.items())), tree)


def huffman_decode(encoded: bytes | bytearray, bit_length: int, tree: HuffNode) -> bytes:
    """Decode ``bit_length`` bits of ``encoded`` with ``tree``.

    Raises:
        InvalidInputError: ``bit_length`` exceeds the input, or an invalid / truncated code.
    """
    if bit_length > len(encoded) * 8:
        raise InvalidInputError("huffman_decode: bit_length exceeds input")
    if bit_length == 0:
        return b""
    if tree.symbol is not None:
        return bytes((tree.symbol,)) * bit_length
    out = bytearray()
    node = tree
    for i in range(bit_length):
        bit = (encoded[i >> 3] >> (7 - (i & 7))) & 1
        nxt = node.right if bit else node.left
        if nxt is None:
            raise InvalidInputError("huffman_decode: invalid code")
        node = nxt
        if node.symbol is not None:
            out.append(node.symbol)
            node = tree
    if node is not tree:
        raise InvalidInputError("huffman_decode: truncated code")
    return bytes(out)

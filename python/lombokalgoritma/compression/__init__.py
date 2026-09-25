# LombokAlgoritma — compression (SPEC §13.3), one module per algorithm
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
"""Byte RLE, LZ77 and static Huffman coding."""

from .huffman import HuffmanResult, HuffNode, huffman_decode, huffman_encode
from .lz77 import lz77_compress, lz77_decompress
from .rle import rle_decode, rle_encode

__all__ = [
    "HuffNode",
    "HuffmanResult",
    "huffman_decode",
    "huffman_encode",
    "lz77_compress",
    "lz77_decompress",
    "rle_decode",
    "rle_encode",
]

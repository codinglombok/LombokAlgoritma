<?php

// LombokAlgoritma — result of Huffman encoding
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Compression;

final class HuffmanResult
{
    /**
     * @param string $encoded code bits packed MSB-first, last byte zero-padded
     * @param int $bitLength number of meaningful bits in `$encoded`
     * @param array<int, string> $codes '0'/'1' code per byte value, ascending by byte
     */
    public function __construct(
        public readonly string $encoded,
        public readonly int $bitLength,
        public readonly array $codes,
        public readonly HuffmanNode $tree,
    ) {
    }
}

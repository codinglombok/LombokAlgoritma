<?php

// LombokAlgoritma — Huffman tree node
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Compression;

/** A leaf carries `symbol`; an internal node has both children. */
final class HuffmanNode
{
    public function __construct(
        public readonly int $freq,
        public readonly ?int $symbol = null,
        public readonly ?HuffmanNode $left = null,
        public readonly ?HuffmanNode $right = null,
    ) {
    }
}

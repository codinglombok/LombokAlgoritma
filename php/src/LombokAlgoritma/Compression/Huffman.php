<?php

// LombokAlgoritma — static Huffman coding (SPEC §13.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Compression;

use LombokAlgoritma\AlgoException;
use LombokAlgoritma\Core\MinHeap;

/**
 * Deterministic Huffman code: leaves get ids 0, 1, … by ascending byte value, internal nodes the
 * next ids in creation order; a min-heap keyed by (freq, id) pops `left` then `right`. Left = '0',
 * right = '1'; a single-symbol input uses code "0"; bits are packed MSB-first.
 */
final class Huffman
{
    public static function encode(string $data): HuffmanResult
    {
        $n = strlen($data);
        if ($n === 0) {
            return new HuffmanResult('', 0, [], new HuffmanNode(0));
        }
        /** @var array<int, int> $freq */
        $freq = count_chars($data, 1);
        ksort($freq);
        /** @var MinHeap<array{int, int, HuffmanNode}> $heap */
        $heap = new MinHeap(
            static fn (array $a, array $b): bool => $a[0] < $b[0] || ($a[0] === $b[0] && $a[1] < $b[1]),
        );
        $id = 0;
        foreach ($freq as $sym => $f) {
            $heap->push([$f, $id++, new HuffmanNode($f, $sym)]);
        }
        while ($heap->size() > 1) {
            /** @var array{int, int, HuffmanNode} $l */
            $l = $heap->pop();
            /** @var array{int, int, HuffmanNode} $r */
            $r = $heap->pop();
            $heap->push([$l[0] + $r[0], $id++, new HuffmanNode($l[0] + $r[0], null, $l[2], $r[2])]);
        }
        /** @var array{int, int, HuffmanNode} $root */
        $root = $heap->pop();
        $tree = $root[2];
        $codes = [];
        self::walk($tree, '', $codes);
        ksort($codes);
        $bits = '';
        for ($i = 0; $i < $n; $i++) {
            $bits .= $codes[ord($data[$i])];
        }
        $bitLength = strlen($bits);
        $encoded = '';
        foreach (str_split(str_pad($bits, intdiv($bitLength + 7, 8) * 8, '0'), 8) as $byte) {
            $encoded .= chr((int) bindec($byte));
        }
        return new HuffmanResult($encoded, $bitLength, $codes, $tree);
    }

    /** @param array<int, string> $codes */
    private static function walk(HuffmanNode $node, string $code, array &$codes): void
    {
        if ($node->symbol !== null) {
            $codes[$node->symbol] = $code === '' ? '0' : $code;
            return;
        }
        if ($node->left !== null) {
            self::walk($node->left, $code . '0', $codes);
        }
        if ($node->right !== null) {
            self::walk($node->right, $code . '1', $codes);
        }
    }

    /**
     * Decode `$bitLength` bits of `$encoded` with `$tree`.
     *
     * @throws AlgoException INVALID_INPUT for a stream that is too short, invalid or truncated
     */
    public static function decode(string $encoded, int $bitLength, HuffmanNode $tree): string
    {
        if ($bitLength > strlen($encoded) * 8) {
            throw AlgoException::invalidInput('huffmanDecode: bitLength exceeds input');
        }
        if ($bitLength <= 0) {
            return '';
        }
        if ($tree->symbol !== null) {
            return str_repeat(chr($tree->symbol), $bitLength);
        }
        $out = '';
        $node = $tree;
        for ($i = 0; $i < $bitLength; $i++) {
            $bit = (ord($encoded[$i >> 3]) >> (7 - ($i & 7))) & 1;
            $next = $bit === 1 ? $node->right : $node->left;
            if ($next === null) {
                throw AlgoException::invalidInput('huffmanDecode: invalid code');
            }
            $node = $next;
            if ($node->symbol !== null) {
                $out .= chr($node->symbol);
                $node = $tree;
            }
        }
        if ($node !== $tree) {
            throw AlgoException::invalidInput('huffmanDecode: truncated code');
        }
        return $out;
    }
}

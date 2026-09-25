<?php

// SPDX-License-Identifier: Apache-2.0 OR MIT

declare(strict_types=1);

namespace LombokAlgoritma\Tests;

use LombokAlgoritma\String\StringAlgo;
use PHPUnit\Framework\TestCase;

final class StringTest extends TestCase
{
    private const INPUTS = ['', 'a', 'abc', 'hello', 'abcdefghijklmnop', 'The quick brown fox jumps over the lazy dog'];

    public function testKmp(): void
    {
        $this->assertSame([0, 3, 6], StringAlgo::kmpSearch('abcabcabc', 'abc'));
        $this->assertSame([], StringAlgo::kmpSearch('hello', 'xyz'));
        $this->assertSame([0, 1, 2], StringAlgo::kmpSearch('aaaa', 'aa'));
        $this->assertSame([], StringAlgo::kmpSearch('abc', ''));
    }

    public function testLevenshtein(): void
    {
        $this->assertSame(3, StringAlgo::levenshtein('kitten', 'sitting'));
        $this->assertSame(0, StringAlgo::levenshtein('', ''));
        $this->assertSame(3, StringAlgo::levenshtein('', 'abc'));
        $this->assertSame(1, StringAlgo::levenshtein('café', 'cafe'));
    }

    public function testFnv1a32Reference(): void
    {
        $this->assertSame(0x811c9dc5, StringAlgo::fnv1a32(''));
        $this->assertSame(0xe40c292c, StringAlgo::fnv1a32('a'));
        $this->assertNotSame(StringAlgo::fnv1a32('hello'), StringAlgo::fnv1a32('world'));
    }

    public function testMurmur3Reference(): void
    {
        $want = [0, 0x3c2569b2, 0xb3dd93fa, 0x248bfa47, 0xe76291ed, 0x2e4ff723];
        foreach (self::INPUTS as $i => $s) {
            $this->assertSame($want[$i], StringAlgo::murmur3_32($s), $s);
        }
        $this->assertSame(0xe2dbd2e1, StringAlgo::murmur3_32('hello', 42));
    }

    public function testXxhash32Reference(): void
    {
        $s0 = [0x02cc5d05, 0x550d7456, 0x32d153ff, 0xfb0077f9, 0x9d2d8b62, 0xe85ea4de];
        $s1 = [0x0b2cb792, 0xf514706f, 0xaa3da8ff, 0xfcfffba9, 0x7cfb9556, 0x234f8471];
        foreach (self::INPUTS as $i => $s) {
            $this->assertSame($s0[$i], StringAlgo::xxhash32($s), $s);
            $this->assertSame($s1[$i], StringAlgo::xxhash32($s, 1), $s);
        }
    }
}

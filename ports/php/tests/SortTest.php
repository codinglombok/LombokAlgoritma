<?php

// SPDX-License-Identifier: Apache-2.0 OR MIT

declare(strict_types=1);

namespace LombokAlgoritma\Tests;

use LombokAlgoritma\Sort\Sort;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class SortTest extends TestCase
{
    /** @return list<array{string}> */
    public static function fns(): array
    {
        return [['timsort'], ['quicksort'], ['mergesort'], ['heapsort']];
    }

    #[DataProvider('fns')]
    public function testEmpty(string $f): void
    {
        $this->assertSame([], Sort::$f([]));
    }

    #[DataProvider('fns')]
    public function testReverse(string $f): void
    {
        $this->assertSame([1, 2, 3, 4, 5], Sort::$f([5, 4, 3, 2, 1]));
    }

    #[DataProvider('fns')]
    public function testNeg(string $f): void
    {
        $this->assertSame([-3, -2, -1, 0, 2], Sort::$f([-3, -1, 0, 2, -2]));
    }

    #[DataProvider('fns')]
    public function testMatchesBuiltinOnRandomData(string $f): void
    {
        mt_srand(1);
        foreach ([2, 3, 4, 8, 15, 16, 17, 33, 100, 1000] as $n) {
            $data = [];
            for ($i = 0; $i < $n; $i++) {
                $data[] = mt_rand(-50, 50);
            }
            $want = $data;
            sort($want);
            $this->assertSame($want, Sort::$f($data), "{$f} n={$n}");
        }
    }

    public function testMergesortRegressionEightDescending(): void
    {
        // v0.1.0 doubled the run width twice per pass → wrong for n ≥ 4 (and failed to parse).
        $this->assertSame([1, 2, 3, 4, 5, 6, 7, 8], Sort::mergesort([8, 7, 6, 5, 4, 3, 2, 1]));
    }

    public function testTimsortStableWithComparator(): void
    {
        $items = [];
        for ($i = 0; $i < 60; $i++) {
            $items[] = [$i % 3, $i];
        }
        $got = Sort::timsort($items, static fn (array $x, array $y): int => $x[0] <=> $y[0]);
        $prev = [-1, -1];
        foreach ($got as $it) {
            $this->assertTrue($it[0] > $prev[0] || ($it[0] === $prev[0] && $it[1] > $prev[1]));
            $prev = $it;
        }
    }

    public function testCounting(): void
    {
        $this->assertSame([0, 1, 1, 2, 3, 3], Sort::countingSort([3, 1, 2, 1, 3, 0]));
        $this->assertSame([], Sort::countingSort([]));
    }

    public function testCountingRejectsNegative(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Sort::countingSort([1, -1]);
    }
}

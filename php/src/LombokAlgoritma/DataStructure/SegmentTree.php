<?php

// LombokAlgoritma — segment tree with lazy propagation, range add / range sum (SPEC §8.5)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\DataStructure;

/** Lazy segment tree over a 0-based array: O(log n) range add and range sum (inclusive bounds). */
final class SegmentTree
{
    /** @var array<int, int|float> */
    private array $tree = [];
    /** @var array<int, int|float> */
    private array $lazy = [];
    private readonly int $n;

    /** @param list<int|float> $arr */
    public function __construct(array $arr)
    {
        $this->n = count($arr);
        if ($this->n > 0) {
            $this->build($arr, 1, 0, $this->n - 1);
        }
    }

    /** @param list<int|float> $arr */
    private function build(array $arr, int $node, int $lo, int $hi): void
    {
        if ($lo === $hi) {
            $this->tree[$node] = $arr[$lo];
            return;
        }
        $mid = ($lo + $hi) >> 1;
        $this->build($arr, 2 * $node, $lo, $mid);
        $this->build($arr, 2 * $node + 1, $mid + 1, $hi);
        $this->tree[$node] = $this->tree[2 * $node] + $this->tree[2 * $node + 1];
    }

    private function apply(int $node, int $lo, int $hi, int|float $val): void
    {
        $this->tree[$node] = ($this->tree[$node] ?? 0) + $val * ($hi - $lo + 1);
        $this->lazy[$node] = ($this->lazy[$node] ?? 0) + $val;
    }

    private function push(int $node, int $lo, int $hi): void
    {
        $pending = $this->lazy[$node] ?? 0;
        if ($pending != 0) {
            $mid = ($lo + $hi) >> 1;
            $this->apply(2 * $node, $lo, $mid, $pending);
            $this->apply(2 * $node + 1, $mid + 1, $hi, $pending);
            $this->lazy[$node] = 0;
        }
    }

    /** Sum of a[l..r]. */
    public function query(int $l, int $r): int|float
    {
        return $this->queryRec($l, $r, 1, 0, $this->n - 1);
    }

    private function queryRec(int $l, int $r, int $node, int $lo, int $hi): int|float
    {
        if ($this->n === 0 || $r < $lo || $hi < $l) {
            return 0;
        }
        if ($l <= $lo && $hi <= $r) {
            return $this->tree[$node] ?? 0;
        }
        $this->push($node, $lo, $hi);
        $mid = ($lo + $hi) >> 1;
        return $this->queryRec($l, $r, 2 * $node, $lo, $mid) + $this->queryRec($l, $r, 2 * $node + 1, $mid + 1, $hi);
    }

    /** Add `$val` to every a[l..r]. */
    public function update(int $l, int $r, int|float $val): void
    {
        $this->updateRec($l, $r, $val, 1, 0, $this->n - 1);
    }

    private function updateRec(int $l, int $r, int|float $val, int $node, int $lo, int $hi): void
    {
        if ($this->n === 0 || $r < $lo || $hi < $l) {
            return;
        }
        if ($l <= $lo && $hi <= $r) {
            $this->apply($node, $lo, $hi, $val);
            return;
        }
        $this->push($node, $lo, $hi);
        $mid = ($lo + $hi) >> 1;
        $this->updateRec($l, $r, $val, 2 * $node, $lo, $mid);
        $this->updateRec($l, $r, $val, 2 * $node + 1, $mid + 1, $hi);
        $this->tree[$node] = ($this->tree[2 * $node] ?? 0) + ($this->tree[2 * $node + 1] ?? 0);
    }
}

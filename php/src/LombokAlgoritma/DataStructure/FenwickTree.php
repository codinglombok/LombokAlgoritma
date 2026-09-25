<?php

// LombokAlgoritma — Fenwick tree / binary indexed tree (SPEC §8.4)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\DataStructure;

/** 1-based Fenwick tree: O(log n) point update and prefix sum. */
final class FenwickTree
{
    /** @var array<int, int|float> */
    private array $tree;
    private readonly int $n;

    /** @param int|list<int|float> $init size (all zeros) or initial values (added in order) */
    public function __construct(int|array $init)
    {
        $this->n = is_int($init) ? $init : count($init);
        $this->tree = array_fill(0, $this->n + 1, 0);
        if (is_array($init)) {
            foreach ($init as $i => $v) {
                $this->update($i + 1, $v);
            }
        }
    }

    /** Add `$val` at index `$i` (1-based). */
    public function update(int $i, int|float $val): void
    {
        for (; $i > 0 && $i <= $this->n; $i += $i & -$i) {
            $this->tree[$i] += $val;
        }
    }

    /** Sum of [1, i] (1-based); 0 for i ≤ 0. */
    public function prefixSum(int $i): int|float
    {
        $s = 0;
        for ($i = min($i, $this->n); $i > 0; $i -= $i & -$i) {
            $s += $this->tree[$i];
        }
        return $s;
    }

    /** Sum of [l, r] (1-based, inclusive). */
    public function rangeSum(int $l, int $r): int|float
    {
        return $this->prefixSum($r) - $this->prefixSum($l - 1);
    }

    /** Value at index i (1-based). */
    public function pointQuery(int $i): int|float
    {
        return $this->rangeSum($i, $i);
    }

    public function size(): int
    {
        return $this->n;
    }
}

<?php

// LombokAlgoritma — disjoint set / union-find (SPEC §8.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\DataStructure;

use LombokAlgoritma\AlgoException;

/** Union by rank + full path compression; `find` returns the (normative) root. */
final class DisjointSet
{
    /** @var array<int, int> */
    private array $parent;
    /** @var array<int, int> */
    private array $rank;
    private int $count;

    public function __construct(int $n)
    {
        $this->parent = $n > 0 ? range(0, $n - 1) : [];
        $this->rank = $n > 0 ? array_fill(0, $n, 0) : [];
        $this->count = max(0, $n);
    }

    /** @throws AlgoException OUT_OF_BOUNDS for an element outside [0, n) */
    public function find(int $x): int
    {
        if ($x < 0 || $x >= count($this->parent)) {
            throw new AlgoException(
                AlgoException::OUT_OF_BOUNDS,
                "Index {$x} out of bounds [0, " . count($this->parent) . ')',
            );
        }
        $root = $x;
        while ($this->parent[$root] !== $root) {
            $root = $this->parent[$root];
        }
        while ($this->parent[$x] !== $root) {
            $next = $this->parent[$x];
            $this->parent[$x] = $root;
            $x = $next;
        }
        return $root;
    }

    /** Merge the sets of x and y; false when already joined. */
    public function union(int $x, int $y): bool
    {
        $rx = $this->find($x);
        $ry = $this->find($y);
        if ($rx === $ry) {
            return false;
        }
        if ($this->rank[$rx] < $this->rank[$ry]) {
            $this->parent[$rx] = $ry;
        } elseif ($this->rank[$rx] > $this->rank[$ry]) {
            $this->parent[$ry] = $rx;
        } else {
            $this->parent[$ry] = $rx;
            $this->rank[$rx]++;
        }
        $this->count--;
        return true;
    }

    public function connected(int $x, int $y): bool
    {
        return $this->find($x) === $this->find($y);
    }

    /** Number of disjoint sets. */
    public function count(): int
    {
        return $this->count;
    }
}

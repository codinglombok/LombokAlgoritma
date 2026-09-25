<?php

// LombokAlgoritma — array-backed binary min-heap
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Core;

/**
 * Binary min-heap ordered by a `less` predicate. SPEC §9.0 requires graph heaps to use a *total*
 * lexicographic key (e.g. `[distance, node]`) so the pop order does not depend on the heap.
 *
 * @template T
 */
final class MinHeap
{
    /** @var array<int, T> */
    private array $items = [];

    /** @var \Closure(T, T): bool */
    private readonly \Closure $less;

    /** @param \Closure(T, T): bool $less */
    public function __construct(\Closure $less)
    {
        $this->less = $less;
    }

    public function size(): int
    {
        return count($this->items);
    }

    /** @param T $item */
    public function push(mixed $item): void
    {
        $a = &$this->items;
        $a[] = $item;
        $i = count($a) - 1;
        while ($i > 0) {
            $p = ($i - 1) >> 1;
            if (!($this->less)($a[$i], $a[$p])) {
                break;
            }
            [$a[$i], $a[$p]] = [$a[$p], $a[$i]];
            $i = $p;
        }
    }

    /**
     * Remove and return the minimum, or null when empty.
     *
     * @return T|null
     */
    public function pop(): mixed
    {
        $n = count($this->items);
        if ($n === 0) {
            return null;
        }
        $top = $this->items[0];
        $last = $this->items[$n - 1];
        array_pop($this->items);
        $n--;
        if ($n > 0) {
            $a = $this->items;
            $a[0] = $last;
            $i = 0;
            while (true) {
                $l = 2 * $i + 1;
                $r = $l + 1;
                $m = $i;
                if ($l < $n && ($this->less)($a[$l], $a[$m])) {
                    $m = $l;
                }
                if ($r < $n && ($this->less)($a[$r], $a[$m])) {
                    $m = $r;
                }
                if ($m === $i) {
                    break;
                }
                [$a[$i], $a[$m]] = [$a[$m], $a[$i]];
                $i = $m;
            }
            $this->items = $a;
        }
        return $top;
    }

    /**
     * Lexicographic `<` on equal-length numeric tuples (int and float compare numerically).
     *
     * @param array<int, int|float> $a
     * @param array<int, int|float> $b
     */
    public static function tupleLess(array $a, array $b): bool
    {
        foreach ($a as $i => $x) {
            $y = $b[$i];
            if ($x < $y) {
                return true;
            }
            if ($x > $y) {
                return false;
            }
        }
        return false;
    }
}

<?php

// LombokAlgoritma — A* search (SPEC §9.4)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

use LombokAlgoritma\AlgoException;
use LombokAlgoritma\Core\MinHeap;

/** A* with a frontier keyed by `[g + h, node]`. */
final class AStar
{
    /**
     * Cheapest path `$source … $target` under an admissible heuristic (default 0 ⇒ Dijkstra).
     * Stale entries (f > g(u) + h(u)) are skipped; a predecessor changes only on a strict
     * improvement. Unreachable → `['path' => [], 'cost' => INF]`.
     *
     * @param (callable(int): (int|float))|null $heuristic
     * @return array{path: list<int>, cost: int|float}
     * @throws AlgoException OUT_OF_RANGE for bad endpoints, NEGATIVE_WEIGHT for a negative edge
     */
    public static function search(Graph $g, int $source, int $target, ?callable $heuristic = null): array
    {
        $h = $heuristic ?? static fn (int $v): int => 0;
        $adj = $g->adjacency();
        $g->assertNode($source, 'source');
        $g->assertNode($target, 'target');
        if ($g->hasNegativeWeight()) {
            throw AlgoException::negativeWeight('aStar');
        }
        $gScore = array_fill(0, $g->nodes, INF);
        $prev = array_fill(0, $g->nodes, -1);
        $gScore[$source] = 0;
        /** @var MinHeap<array{int|float, int}> $heap */
        $heap = new MinHeap(MinHeap::tupleLess(...));
        $heap->push([$h($source), $source]);
        while (($top = $heap->pop()) !== null) {
            [$f, $u] = $top;
            $gu = $gScore[$u];
            if ($f > $gu + $h($u)) {
                continue;
            }
            if ($u === $target) {
                $path = [$target];
                for ($cur = $prev[$target]; $cur !== -1; $cur = $prev[$cur]) {
                    $path[] = $cur;
                }
                return ['path' => array_reverse($path), 'cost' => $gu];
            }
            foreach ($adj[$u] as [$to, $w]) {
                $ng = $gu + $w;
                if ($ng < $gScore[$to]) {
                    $gScore[$to] = $ng;
                    $prev[$to] = $u;
                    $heap->push([$ng + $h($to), $to]);
                }
            }
        }
        return ['path' => [], 'cost' => INF];
    }
}

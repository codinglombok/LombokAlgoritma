<?php

// LombokAlgoritma — Dijkstra single-source shortest paths (SPEC §9.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

use LombokAlgoritma\AlgoException;
use LombokAlgoritma\Core\MinHeap;

/** Dijkstra with a binary heap keyed by `[distance, node]`. O((V + E) log V). */
final class Dijkstra
{
    /**
     * Shortest distance from `$source` to every node (INF when unreachable).
     *
     * @return list<int|float>
     * @throws AlgoException OUT_OF_RANGE for a bad source, NEGATIVE_WEIGHT for any negative edge
     */
    public static function distances(Graph $g, int $source): array
    {
        $adj = $g->adjacency();
        $g->assertNode($source, 'source');
        if ($g->hasNegativeWeight()) {
            throw AlgoException::negativeWeight('dijkstra');
        }
        $dist = array_fill(0, $g->nodes, INF);
        $dist[$source] = 0;
        /** @var MinHeap<array{int|float, int}> $heap */
        $heap = new MinHeap(MinHeap::tupleLess(...));
        $heap->push([0, $source]);
        while (($top = $heap->pop()) !== null) {
            [$d, $u] = $top;
            if ($d > $dist[$u]) {
                continue;
            }
            foreach ($adj[$u] as [$to, $w]) {
                $nd = $d + $w;
                if ($nd < $dist[$to]) {
                    $dist[$to] = $nd;
                    $heap->push([$nd, $to]);
                }
            }
        }
        return array_values($dist);
    }
}

<?php

// LombokAlgoritma — breadth-first search (SPEC §9.1)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

use LombokAlgoritma\AlgoException;

/** Breadth-first search, FIFO queue, neighbours in edge-list order. O(V + E). */
final class Bfs
{
    /**
     * Hop distance from `$source` to every node (−1 when unreachable).
     *
     * @return list<int>
     * @throws AlgoException OUT_OF_RANGE for a source outside the graph
     */
    public static function distances(Graph $g, int $source): array
    {
        $adj = $g->adjacency();
        $g->assertNode($source, 'source');
        $dist = array_fill(0, $g->nodes, -1);
        $dist[$source] = 0;
        $queue = [$source];
        for ($head = 0; $head < count($queue); $head++) {
            $u = $queue[$head];
            foreach ($adj[$u] as [$to]) {
                if ($dist[$to] === -1) {
                    $dist[$to] = $dist[$u] + 1;
                    $queue[] = $to;
                }
            }
        }
        return array_values($dist);
    }
}

<?php

// LombokAlgoritma — depth-first search (SPEC §9.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

use LombokAlgoritma\AlgoException;

/** Iterative depth-first search. O(V + E). */
final class Dfs
{
    /**
     * Pre-order from `$source`: pop a node, skip it if visited, else emit it and push its unvisited
     * neighbours in *reverse* edge-list order (so they are explored in edge-list order).
     *
     * @return list<int>
     * @throws AlgoException OUT_OF_RANGE for a source outside the graph
     */
    public static function order(Graph $g, int $source): array
    {
        $adj = $g->adjacency();
        $g->assertNode($source, 'source');
        $visited = array_fill(0, $g->nodes, false);
        $order = [];
        $stack = [$source];
        while ($stack !== []) {
            $u = array_pop($stack);
            if ($visited[$u]) {
                continue;
            }
            $visited[$u] = true;
            $order[] = $u;
            for ($i = count($adj[$u]) - 1; $i >= 0; $i--) {
                $to = $adj[$u][$i][0];
                if (!$visited[$to]) {
                    $stack[] = $to;
                }
            }
        }
        return $order;
    }
}

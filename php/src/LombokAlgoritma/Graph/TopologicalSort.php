<?php

// LombokAlgoritma — topological sort, Kahn (SPEC §9.7)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

/** Kahn's algorithm with a FIFO queue. O(V + E). */
final class TopologicalSort
{
    /**
     * Queue seeded with the in-degree-0 nodes ascending; neighbours released in edge-list order.
     * Returns `[]` when the graph has a cycle.
     *
     * @return list<int>
     */
    public static function sort(Graph $g): array
    {
        $adj = $g->adjacency();
        $indegree = $g->nodes > 0 ? array_fill(0, $g->nodes, 0) : [];
        foreach ($g->edges as $e) {
            $indegree[$e->to]++;
        }
        $queue = [];
        for ($i = 0; $i < $g->nodes; $i++) {
            if ($indegree[$i] === 0) {
                $queue[] = $i;
            }
        }
        for ($head = 0; $head < count($queue); $head++) {
            foreach ($adj[$queue[$head]] as [$to]) {
                $indegree[$to]--;
                if ($indegree[$to] === 0) {
                    $queue[] = $to;
                }
            }
        }
        return count($queue) === $g->nodes ? $queue : [];
    }
}

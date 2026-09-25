<?php

// LombokAlgoritma — Bellman–Ford (SPEC §9.5)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

use LombokAlgoritma\AlgoException;

/** Bellman–Ford single-source shortest paths; negative weights allowed. O(V·E). */
final class BellmanFord
{
    /**
     * Up to V − 1 rounds relaxing every edge in edge-list order (from finite distances only),
     * stopping early on a round without change, then one detection round.
     *
     * @return array{distances: list<int|float>, hasNegativeCycle: bool}
     * @throws AlgoException OUT_OF_RANGE for a source outside the graph
     */
    public static function run(Graph $g, int $source): array
    {
        $g->assertNode($source, 'source');
        $dist = array_fill(0, $g->nodes, INF);
        $dist[$source] = 0;
        for ($round = 1; $round < $g->nodes; $round++) {
            $changed = false;
            foreach ($g->edges as $e) {
                $du = $dist[$e->from];
                if ($du !== INF && $du + $e->weight < $dist[$e->to]) {
                    $dist[$e->to] = $du + $e->weight;
                    $changed = true;
                }
            }
            if (!$changed) {
                break;
            }
        }
        $neg = false;
        foreach ($g->edges as $e) {
            $du = $dist[$e->from];
            if ($du !== INF && $du + $e->weight < $dist[$e->to]) {
                $neg = true;
                break;
            }
        }
        return ['distances' => array_values($dist), 'hasNegativeCycle' => $neg];
    }
}

<?php

// LombokAlgoritma — Kruskal minimum spanning forest (SPEC §9.8)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

use LombokAlgoritma\DataStructure\DisjointSet;

/** Kruskal on the graph read as undirected. O(E log E). */
final class Kruskal
{
    /**
     * Edges sorted *stably* by ascending weight (ties keep edge-list order); an edge is taken when
     * it joins two components. Returns the chosen edges in the order taken, original orientation.
     *
     * @return list<Edge>
     */
    public static function minimumSpanningForest(Graph $g): array
    {
        $order = array_keys($g->edges);
        usort($order, static fn (int $a, int $b): int => ($g->edges[$a]->weight <=> $g->edges[$b]->weight)
            ?: ($a <=> $b));
        $ds = new DisjointSet($g->nodes);
        $out = [];
        foreach ($order as $i) {
            $e = $g->edges[$i];
            if ($ds->union($e->from, $e->to)) {
                $out[] = $e;
            }
        }
        return $out;
    }
}

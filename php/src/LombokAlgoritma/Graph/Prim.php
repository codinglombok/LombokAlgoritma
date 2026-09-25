<?php

// LombokAlgoritma — Prim minimum spanning forest, lazy (SPEC §9.9)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

use LombokAlgoritma\Core\MinHeap;

/** Lazy Prim on the graph read as undirected; heap keyed by `[weight, to, from, edgeIndex]`. */
final class Prim
{
    /**
     * Trees are grown from the lowest-numbered unvisited node; each chosen edge is returned oriented
     * tree → new node, in the order taken. Forests (disconnected graphs) are supported.
     *
     * @return list<Edge>
     */
    public static function minimumSpanningForest(Graph $g): array
    {
        $n = $g->nodes;
        /** @var list<list<array{int, int|float, int}>> $adj */
        $adj = $n > 0 ? array_fill(0, $n, []) : [];
        foreach ($g->edges as $i => $e) {
            $adj[$e->from][] = [$e->to, $e->weight, $i];
            if ($e->from !== $e->to) {
                $adj[$e->to][] = [$e->from, $e->weight, $i];
            }
        }
        $inTree = $n > 0 ? array_fill(0, $n, false) : [];
        $out = [];
        /** @var MinHeap<array{int|float, int, int, int}> $heap */
        $heap = new MinHeap(MinHeap::tupleLess(...));
        $visit = static function (int $u) use (&$inTree, $adj, $heap): void {
            $inTree[$u] = true;
            foreach ($adj[$u] as [$to, $w, $i]) {
                if (!$inTree[$to]) {
                    $heap->push([$w, $to, $u, $i]);
                }
            }
        };
        for ($root = 0; $root < $n; $root++) {
            if ($inTree[$root]) {
                continue;
            }
            $visit($root);
            while (($top = $heap->pop()) !== null) {
                [$w, $to, $from] = $top;
                if ($inTree[$to]) {
                    continue;
                }
                $out[] = new Edge($from, $to, $w);
                $visit($to);
            }
        }
        return $out;
    }
}

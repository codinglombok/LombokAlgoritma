<?php

// LombokAlgoritma — maximum flow, Dinic (SPEC §9.11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

use LombokAlgoritma\AlgoException;

/** Dinic's algorithm: BFS level graph + blocking flow with current-arc pointers. O(V²·E). */
final class Dinic
{
    /**
     * Value of a maximum `$source → $sink` flow; edge weights are capacities (parallel edges add
     * up). Only the value is normative (exact for integer capacities below 2^53).
     *
     * @throws AlgoException OUT_OF_RANGE for bad nodes, INVALID_INPUT when source = sink,
     *                       NEGATIVE_WEIGHT for a negative capacity
     */
    public static function maxFlow(Graph $g, int $source, int $sink): int|float
    {
        $g->assertNode($source, 'source');
        $g->assertNode($sink, 'sink');
        if ($source === $sink) {
            throw AlgoException::invalidInput('dinic: source and sink must differ');
        }
        $n = $g->nodes;
        $to = [];
        $cap = [];
        $head = array_fill(0, $n, []);
        foreach ($g->edges as $e) {
            if ($e->weight < 0) {
                throw AlgoException::negativeWeight('dinic');
            }
            $head[$e->from][] = count($to);
            $to[] = $e->to;
            $cap[] = $e->weight;
            $head[$e->to][] = count($to);
            $to[] = $e->from;
            $cap[] = 0;
        }
        $flow = 0;
        while (true) {
            $level = array_fill(0, $n, -1);
            $level[$source] = 0;
            $q = [$source];
            for ($h = 0; $h < count($q); $h++) {
                $u = $q[$h];
                foreach ($head[$u] as $id) {
                    $v = $to[$id];
                    if ($cap[$id] > 0 && $level[$v] === -1) {
                        $level[$v] = $level[$u] + 1;
                        $q[] = $v;
                    }
                }
            }
            if ($level[$sink] === -1) {
                return $flow;
            }
            $it = array_fill(0, $n, 0);
            while (($f = self::augment($source, $sink, $head, $to, $cap, $level, $it)) > 0) {
                $flow += $f;
            }
        }
    }

    /**
     * One augmenting path along the level graph (iterative DFS); 0 when blocked.
     *
     * @param array<int, list<int>> $head
     * @param list<int> $to
     * @param array<int, int|float> $cap
     * @param array<int, int> $level
     * @param array<int, int> $it
     */
    private static function augment(
        int $source,
        int $sink,
        array $head,
        array $to,
        array &$cap,
        array &$level,
        array &$it,
    ): int|float {
        $path = [];
        $u = $source;
        while (true) {
            if ($u === $sink) {
                $f = INF;
                foreach ($path as $id) {
                    $f = min($f, $cap[$id]);
                }
                foreach ($path as $id) {
                    $cap[$id] -= $f;
                    $cap[$id ^ 1] += $f;
                }
                return $f;
            }
            $advanced = false;
            while ($it[$u] < count($head[$u])) {
                $id = $head[$u][$it[$u]];
                $v = $to[$id];
                if ($cap[$id] > 0 && $level[$v] === $level[$u] + 1) {
                    $path[] = $id;
                    $u = $v;
                    $advanced = true;
                    break;
                }
                $it[$u]++;
            }
            if ($advanced) {
                continue;
            }
            if ($u === $source) {
                return 0;
            }
            $level[$u] = -1;
            $back = (int) array_pop($path);
            $u = $to[$back ^ 1];
            $it[$u]++;
        }
    }
}

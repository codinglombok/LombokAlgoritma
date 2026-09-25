<?php

// LombokAlgoritma — strongly connected components, Tarjan (SPEC §9.10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

/** Tarjan's SCC algorithm, iterative but visiting exactly like the recursive version. O(V + E). */
final class TarjanScc
{
    /**
     * Roots ascending, neighbours in edge-list order; components in completion order (reverse
     * topological order of the condensation), members sorted ascending.
     *
     * @return list<list<int>>
     */
    public static function components(Graph $g): array
    {
        $adj = $g->adjacency();
        $n = $g->nodes;
        $index = $n > 0 ? array_fill(0, $n, -1) : [];
        $low = $n > 0 ? array_fill(0, $n, 0) : [];
        $onStack = $n > 0 ? array_fill(0, $n, false) : [];
        $stack = [];
        $out = [];
        $counter = 0;
        for ($root = 0; $root < $n; $root++) {
            if ($index[$root] !== -1) {
                continue;
            }
            $call = [[$root, 0]];
            $index[$root] = $low[$root] = $counter++;
            $stack[] = $root;
            $onStack[$root] = true;
            while ($call !== []) {
                $top = count($call) - 1;
                [$v, $pos] = $call[$top];
                if ($pos < count($adj[$v])) {
                    $call[$top][1] = $pos + 1;
                    $w = $adj[$v][$pos][0];
                    if ($index[$w] === -1) {
                        $index[$w] = $low[$w] = $counter++;
                        $stack[] = $w;
                        $onStack[$w] = true;
                        $call[] = [$w, 0];
                    } elseif ($onStack[$w]) {
                        $low[$v] = min($low[$v], $index[$w]);
                    }
                    continue;
                }
                array_pop($call);
                if ($call !== []) {
                    $parent = $call[count($call) - 1][0];
                    $low[$parent] = min($low[$parent], $low[$v]);
                }
                if ($low[$v] === $index[$v]) {
                    $comp = [];
                    do {
                        $w = (int) array_pop($stack);
                        $onStack[$w] = false;
                        $comp[] = $w;
                    } while ($w !== $v);
                    sort($comp);
                    $out[] = $comp;
                }
            }
        }
        return $out;
    }
}

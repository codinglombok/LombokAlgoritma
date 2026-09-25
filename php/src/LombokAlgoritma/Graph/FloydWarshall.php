<?php

// LombokAlgoritma — Floyd–Warshall all-pairs shortest paths (SPEC §9.6)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

/** Floyd–Warshall, loop order k → i → j with a strict `<` update. O(V³). */
final class FloydWarshall
{
    /**
     * All-pairs distances (INF when unreachable); parallel edges keep the minimum weight.
     *
     * @return list<list<int|float>>
     */
    public static function allPairs(Graph $g): array
    {
        $n = $g->nodes;
        $dist = [];
        for ($i = 0; $i < $n; $i++) {
            $row = array_fill(0, $n, INF);
            $row[$i] = 0;
            $dist[] = $row;
        }
        foreach ($g->edges as $e) {
            $dist[$e->from][$e->to] = min($dist[$e->from][$e->to], $e->weight);
        }
        for ($k = 0; $k < $n; $k++) {
            for ($i = 0; $i < $n; $i++) {
                $dik = $dist[$i][$k];
                if ($dik === INF) {
                    continue;
                }
                for ($j = 0; $j < $n; $j++) {
                    $cand = $dik + $dist[$k][$j];
                    if ($cand < $dist[$i][$j]) {
                        $dist[$i][$j] = $cand;
                    }
                }
            }
        }
        return $dist;
    }
}

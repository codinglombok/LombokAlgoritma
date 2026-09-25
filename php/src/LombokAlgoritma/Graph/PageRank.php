<?php

// LombokAlgoritma — PageRank by power iteration (SPEC §9.13)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

use LombokAlgoritma\AlgoException;

/** PageRank with uniform redistribution of dangling mass; evaluation order is normative. */
final class PageRank
{
    /**
     * `$iterations` power iterations from 1/n:
     *   dangling = Σ rank[u] (out-degree 0, u ascending); base = (1 − d)/n + (d·dangling)/n;
     *   next[v] = base, then for u ascending, each edge u→v in order: next[v] += (d·rank[u]) / deg(u).
     *
     * @return list<float>
     * @throws AlgoException OUT_OF_RANGE for damping outside [0, 1]
     */
    public static function compute(Graph $g, float $damping = 0.85, int $iterations = 50): array
    {
        $n = $g->nodes;
        if ($n === 0) {
            return [];
        }
        if (!($damping >= 0 && $damping <= 1)) {
            throw AlgoException::outOfRange('pageRank: damping must be in [0, 1]');
        }
        $outs = array_fill(0, $n, []);
        foreach ($g->edges as $e) {
            $outs[$e->from][] = $e->to;
        }
        $rank = array_fill(0, $n, 1 / $n);
        for ($it = 0; $it < $iterations; $it++) {
            $dangling = 0.0;
            for ($u = 0; $u < $n; $u++) {
                if ($outs[$u] === []) {
                    $dangling += $rank[$u];
                }
            }
            $base = (1 - $damping) / $n + ($damping * $dangling) / $n;
            $next = array_fill(0, $n, $base);
            for ($u = 0; $u < $n; $u++) {
                $deg = count($outs[$u]);
                if ($deg === 0) {
                    continue;
                }
                $contrib = ($damping * $rank[$u]) / $deg;
                foreach ($outs[$u] as $v) {
                    $next[$v] += $contrib;
                }
            }
            $rank = $next;
        }
        return array_map(static fn (int|float $x): float => (float) $x, $rank);
    }
}

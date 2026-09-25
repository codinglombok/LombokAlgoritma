<?php

// LombokAlgoritma — maximum bipartite matching, Hopcroft–Karp (SPEC §9.12)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

use LombokAlgoritma\AlgoException;

/** Hopcroft–Karp, O(E·√V). Only the matching *size* is normative. */
final class BipartiteMatching
{
    /**
     * Maximum matching between left vertices 0 … nLeft−1 and right vertices 0 … nRight−1.
     *
     * @param list<array{int, int}> $pairs `[left, right]` edges
     * @return array{size: int, matchLeft: list<int>, matchRight: list<int>}
     * @throws AlgoException OUT_OF_RANGE for a pair outside the vertex ranges
     */
    public static function hopcroftKarp(int $nLeft, int $nRight, array $pairs): array
    {
        $adj = $nLeft > 0 ? array_fill(0, $nLeft, []) : [];
        foreach ($pairs as [$u, $v]) {
            if ($u < 0 || $u >= $nLeft || $v < 0 || $v >= $nRight) {
                throw AlgoException::outOfRange("bipartiteMatching: edge [{$u}, {$v}] out of range");
            }
            $adj[$u][] = $v;
        }
        $matchLeft = $nLeft > 0 ? array_fill(0, $nLeft, -1) : [];
        $matchRight = $nRight > 0 ? array_fill(0, $nRight, -1) : [];
        $dist = $nLeft > 0 ? array_fill(0, $nLeft, 0) : [];
        $size = 0;
        while (self::bfs($nLeft, $adj, $matchLeft, $matchRight, $dist)) {
            $it = $nLeft > 0 ? array_fill(0, $nLeft, 0) : [];
            for ($u = 0; $u < $nLeft; $u++) {
                if ($matchLeft[$u] === -1 && self::augment($u, $adj, $matchLeft, $matchRight, $dist, $it)) {
                    $size++;
                }
            }
        }
        return ['size' => $size, 'matchLeft' => array_values($matchLeft), 'matchRight' => array_values($matchRight)];
    }

    /**
     * @param array<int, list<int>> $adj
     * @param array<int, int> $matchLeft
     * @param array<int, int> $matchRight
     * @param array<int, int|float> $dist
     */
    private static function bfs(int $nLeft, array $adj, array $matchLeft, array $matchRight, array &$dist): bool
    {
        $q = [];
        for ($u = 0; $u < $nLeft; $u++) {
            if ($matchLeft[$u] === -1) {
                $dist[$u] = 0;
                $q[] = $u;
            } else {
                $dist[$u] = INF;
            }
        }
        $found = false;
        for ($h = 0; $h < count($q); $h++) {
            $u = $q[$h];
            foreach ($adj[$u] as $v) {
                $w = $matchRight[$v];
                if ($w === -1) {
                    $found = true;
                } elseif ($dist[$w] === INF) {
                    $dist[$w] = $dist[$u] + 1;
                    $q[] = $w;
                }
            }
        }
        return $found;
    }

    /**
     * Iterative DFS along the layered graph.
     *
     * @param array<int, list<int>> $adj
     * @param array<int, int> $matchLeft
     * @param array<int, int> $matchRight
     * @param array<int, int|float> $dist
     * @param array<int, int> $it
     */
    private static function augment(
        int $root,
        array $adj,
        array &$matchLeft,
        array &$matchRight,
        array &$dist,
        array &$it,
    ): bool {
        $stack = [$root];
        $via = [];
        while ($stack !== []) {
            $u = $stack[count($stack) - 1];
            $pushed = false;
            while ($it[$u] < count($adj[$u])) {
                $v = $adj[$u][$it[$u]];
                $it[$u]++;
                $w = $matchRight[$v];
                if ($w === -1) {
                    $via[] = $v;
                    for ($k = count($stack) - 1; $k >= 0; $k--) {
                        $matchLeft[$stack[$k]] = $via[$k];
                        $matchRight[$via[$k]] = $stack[$k];
                    }
                    return true;
                }
                if ($dist[$w] === $dist[$u] + 1) {
                    $via[] = $v;
                    $stack[] = $w;
                    $pushed = true;
                    break;
                }
            }
            if ($pushed) {
                continue;
            }
            $dist[$u] = INF;
            array_pop($stack);
            array_pop($via);
        }
        return false;
    }
}

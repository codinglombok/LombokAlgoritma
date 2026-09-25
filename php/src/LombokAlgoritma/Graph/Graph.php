<?php

// LombokAlgoritma — graph model (SPEC §9.0)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

use LombokAlgoritma\AlgoException;

/**
 * Directed multigraph on nodes 0 … n−1 given as an ordered edge list (parallel edges and loops are
 * allowed). Every traversal is defined in terms of the edge-list order. Kruskal, Prim and
 * bipartite matching read edges as undirected. The graph is validated on construction.
 */
final class Graph
{
    /** @var list<Edge> */
    public readonly array $edges;

    /**
     * @param list<Edge|array{int, int, int|float}> $edges `Edge` objects or `[from, to, weight]`
     * @throws AlgoException INVALID_INPUT for nodes < 0, OUT_OF_RANGE for an endpoint outside [0, n)
     */
    public function __construct(public readonly int $nodes, array $edges = [])
    {
        if ($nodes < 0) {
            throw AlgoException::invalidInput('graph: nodes must be a non-negative integer');
        }
        $list = [];
        foreach ($edges as $e) {
            $e = $e instanceof Edge ? $e : new Edge($e[0], $e[1], $e[2]);
            if ($e->from < 0 || $e->to < 0 || $e->from >= $nodes || $e->to >= $nodes) {
                throw AlgoException::outOfRange("graph: edge {$e->from}→{$e->to} outside [0, {$nodes})");
            }
            $list[] = $e;
        }
        $this->edges = $list;
    }

    /**
     * Outgoing neighbours of every node in edge-list order.
     *
     * @return list<list<array{int, int|float}>> `[to, weight]` per node
     */
    public function adjacency(): array
    {
        $adj = $this->nodes > 0 ? array_fill(0, $this->nodes, []) : [];
        foreach ($this->edges as $e) {
            $adj[$e->from][] = [$e->to, $e->weight];
        }
        return $adj;
    }

    /** @throws AlgoException OUT_OF_RANGE unless `$v` is a node */
    public function assertNode(int $v, string $name = 'node'): void
    {
        if ($v < 0 || $v >= $this->nodes) {
            throw AlgoException::outOfRange("graph: {$name} {$v} outside [0, {$this->nodes})");
        }
    }

    /** True when any edge weight is negative. */
    public function hasNegativeWeight(): bool
    {
        foreach ($this->edges as $e) {
            if ($e->weight < 0) {
                return true;
            }
        }
        return false;
    }
}

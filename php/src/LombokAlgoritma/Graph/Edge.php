<?php

// LombokAlgoritma — directed weighted edge
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Graph;

/** Directed edge `from → to` with a numeric weight (capacity for Dinic). */
final class Edge
{
    public function __construct(
        public readonly int $from,
        public readonly int $to,
        public readonly int|float $weight,
    ) {
    }

    /** @return array{int, int, int|float} */
    public function toArray(): array
    {
        return [$this->from, $this->to, $this->weight];
    }
}

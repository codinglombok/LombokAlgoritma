<?php

// SPDX-License-Identifier: Apache-2.0 OR MIT

declare(strict_types=1);

namespace LombokAlgoritma\Tests;

use LombokAlgoritma\ML\VectorOps;
use PHPUnit\Framework\TestCase;

final class VectorOpsTest extends TestCase
{
    public function testBasics(): void
    {
        $this->assertSame(32.0, VectorOps::dot([1, 2, 3], [4, 5, 6]));
        $this->assertSame(5.0, VectorOps::norm([3, 4]));
        $this->assertSame(5.0, VectorOps::l2([0, 0], [3, 4]));
        $this->assertSame(0.0, VectorOps::cosine([1, 0], [0, 0]));
        $this->assertEqualsWithDelta(1.0, VectorOps::cosine([1, 1], [2, 2]), 1e-12);
        $this->assertSame([0.6, 0.8], VectorOps::normalize([3, 4]));
        $this->assertSame([0.0, 0.0], VectorOps::normalize([0, 0]));
    }

    public function testLengthMismatch(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        VectorOps::dot([1], [1, 2]);
    }
}

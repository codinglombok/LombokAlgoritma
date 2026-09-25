<?php

// LombokAlgoritma — shared-vector conformance test (SPEC §1, §4)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Tests;

use LombokAlgoritma\Vectors\Dispatch;
use LombokAlgoritma\Vectors\Runner;
use PHPUnit\Framework\TestCase;

final class VectorsTest extends TestCase
{
    public function testAllVectorsPass(): void
    {
        $report = Runner::run();
        self::assertSame([], $report['missing'], 'unknown vector groups');
        self::assertSame([], $report['failures'], 'vector mismatches');
        self::assertSame(1059, $report['cases']);
    }

    public function testOutputMatchesTypeScriptReference(): void
    {
        $reference = dirname(__DIR__, 2) . '/out/typescript.txt';
        if (!is_file($reference)) {
            self::markTestSkipped('out/typescript.txt not generated');
        }
        $report = Runner::run();
        self::assertSame((string) file_get_contents($reference), implode("\n", $report['lines']) . "\n");
    }

    public function testDispatchCoversAllGroups(): void
    {
        self::assertCount(92, Dispatch::table());
        self::assertTrue(Dispatch::has('sort.timsort'));
        self::assertFalse(Dispatch::has('hash.sha256'));
    }

    public function testUnreadableFileThrows(): void
    {
        $this->expectException(\UnexpectedValueException::class);
        Runner::run('/nonexistent/vectors.json');
    }

    public function testUnsupportedFormatThrows(): void
    {
        $tmp = (string) tempnam(sys_get_temp_dir(), 'lav');
        file_put_contents($tmp, '{"format":"other","version":1,"groups":{}}');
        try {
            $this->expectException(\UnexpectedValueException::class);
            Runner::run($tmp);
        } finally {
            unlink($tmp);
        }
    }

    public function testMismatchAndUnknownGroupAreReported(): void
    {
        $tmp = (string) tempnam(sys_get_temp_dir(), 'lav');
        file_put_contents(
            $tmp,
            '{"format":"lombokalgoritma-vectors","version":1,"groups":{'
            . '"math.gcd":[{"id":"001","input":{"a":12,"b":18},"expected":5}],'
            . '"nope.nope":[{"id":"001","input":{},"expected":null}]}}',
        );
        try {
            $report = Runner::run($tmp);
        } finally {
            unlink($tmp);
        }
        self::assertSame(['nope.nope'], $report['missing']);
        self::assertCount(1, $report['failures']);
        self::assertSame(["math.gcd\t001\t6"], $report['lines']);
    }
}

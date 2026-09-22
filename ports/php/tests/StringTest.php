<?php
declare(strict_types=1);
use PHPUnit\Framework\TestCase;
use LombokAlgoritma\String\StringAlgo;
class StringTest extends TestCase {
    public function testKmpFound(): void { $this->assertSame([0,3,6],StringAlgo::kmpSearch('abcabcabc','abc')); }
    public function testKmpMiss(): void { $this->assertSame([],StringAlgo::kmpSearch('hello','xyz')); }
    public function testLev(): void { $this->assertSame(3,StringAlgo::levenshtein('kitten','sitting')); $this->assertSame(0,StringAlgo::levenshtein('',''));}
    public function testFnvDet(): void { $this->assertSame(StringAlgo::fnv1a32('hello'),StringAlgo::fnv1a32('hello')); }
    public function testFnvDiff(): void { $this->assertNotSame(StringAlgo::fnv1a32('hello'),StringAlgo::fnv1a32('world')); }
}

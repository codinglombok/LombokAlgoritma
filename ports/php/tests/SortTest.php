<?php
declare(strict_types=1);
use PHPUnit\Framework\TestCase;
use LombokAlgoritma\Sort\Sort;
class SortTest extends TestCase {
    /** @dataProvider fns */
    public function testEmpty(string $f): void { $this->assertSame([],Sort::$f([])); }
    /** @dataProvider fns */
    public function testReverse(string $f): void { $this->assertSame([1,2,3,4,5],array_values(Sort::$f([5,4,3,2,1]))); }
    /** @dataProvider fns */
    public function testNeg(string $f): void { $this->assertSame([-3,-2,-1,0,2],array_values(Sort::$f([-3,-1,0,2,-2]))); }
    public static function fns(): array { return [['timsort'],['quicksort'],['mergesort'],['heapsort']]; }
    public function testCounting(): void { $this->assertSame([0,1,1,2,3,3],Sort::countingSort([3,1,2,1,3,0])); }
}

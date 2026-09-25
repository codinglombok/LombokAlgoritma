<?php

// LombokAlgoritma — unit tests for public APIs not fully exercised by the shared vectors
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Tests;

use LombokAlgoritma\AlgoException;
use LombokAlgoritma\Compression\Huffman;
use LombokAlgoritma\Compression\HuffmanNode;
use LombokAlgoritma\Compression\Lz77;
use LombokAlgoritma\Compression\Rle;
use LombokAlgoritma\Core\BigInt;
use LombokAlgoritma\Core\MinHeap;
use LombokAlgoritma\Core\U32;
use LombokAlgoritma\Core\U64;
use LombokAlgoritma\DataStructure\BloomFilter;
use LombokAlgoritma\DataStructure\DisjointSet;
use LombokAlgoritma\DataStructure\FenwickTree;
use LombokAlgoritma\DataStructure\HyperLogLog;
use LombokAlgoritma\Geometry\ClosestPair;
use LombokAlgoritma\Geometry\Point;
use LombokAlgoritma\Graph\AStar;
use LombokAlgoritma\Graph\Edge;
use LombokAlgoritma\Graph\Graph;
use LombokAlgoritma\Graph\PageRank;
use LombokAlgoritma\Hash\Fnv1a;
use LombokAlgoritma\Hash\SipHash;
use LombokAlgoritma\Hash\XxHash64;
use LombokAlgoritma\Math\Ntt;
use LombokAlgoritma\Math\NumberTheory;
use LombokAlgoritma\Math\Primes;
use LombokAlgoritma\Ml\KMeans;
use LombokAlgoritma\Ml\Similarity;
use LombokAlgoritma\Rng\Pcg32;
use LombokAlgoritma\Rng\SplitMix64;
use LombokAlgoritma\Rng\Xoshiro256pp;
use LombokAlgoritma\Search\Search;
use LombokAlgoritma\Sort\Sort;
use LombokAlgoritma\String\AhoCorasick;
use LombokAlgoritma\String\StringAlgo;
use LombokAlgoritma\Vectors\Json;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class LibraryTest extends TestCase
{
    /** @return array<string, array{\Closure(): mixed, string}> */
    public static function errorCases(): array
    {
        $g = new Graph(2, [[0, 1, -1]]);
        return [
            'bloom m=0' => [static fn () => BloomFilter::withParams(0, 1), AlgoException::OUT_OF_RANGE],
            'bloom capacity' => [static fn () => BloomFilter::forCapacity(0), AlgoException::OUT_OF_RANGE],
            'hll merge precision' => [
                static fn () => (new HyperLogLog(10))->merge(new HyperLogLog(12)),
                AlgoException::INVALID_INPUT,
            ],
            'disjoint set index' => [static fn () => (new DisjointSet(2))->find(5), AlgoException::OUT_OF_BOUNDS],
            'graph nodes' => [static fn () => new Graph(-1), AlgoException::INVALID_INPUT],
            'graph endpoint' => [static fn () => new Graph(2, [[0, 3, 1]]), AlgoException::OUT_OF_RANGE],
            'astar negative' => [static fn () => AStar::search($g, 0, 1), AlgoException::NEGATIVE_WEIGHT],
            'pagerank damping' => [static fn () => PageRank::compute($g, 1.5), AlgoException::OUT_OF_RANGE],
            'mod inverse' => [static fn () => NumberTheory::modInverse(6, 9), AlgoException::NO_INVERSE],
            'crt coprime' => [static fn () => NumberTheory::crt([1, 1], [4, 6]), AlgoException::NOT_COPRIME],
            'mod pow exp' => [static fn () => NumberTheory::modPow(2, -1, 5), AlgoException::OUT_OF_RANGE],
            'ntt length' => [static fn () => Ntt::transform([1, 2, 3]), AlgoException::INVALID_INPUT],
            'siphash key' => [static fn () => SipHash::hash24('short', ''), AlgoException::INVALID_INPUT],
            'rle decode' => [static fn () => Rle::decode("\x03"), AlgoException::INVALID_INPUT],
            'lz77 window' => [static fn () => Lz77::compress('abc', 0), AlgoException::OUT_OF_RANGE],
            'lz77 flag' => [static fn () => Lz77::decompress("\x02a"), AlgoException::INVALID_INPUT],
            'huffman short' => [
                static fn () => Huffman::decode('', 9, new HuffmanNode(1, 65)),
                AlgoException::INVALID_INPUT,
            ],
            'counting negative' => [static fn () => Sort::countingSort([1, -1]), AlgoException::OUT_OF_RANGE],
            'pcg bound' => [static fn () => (new Pcg32())->nextBounded(0), AlgoException::OUT_OF_RANGE],
            'xoshiro bound' => [static fn () => (new Xoshiro256pp())->nextInt(0), AlgoException::OUT_OF_RANGE],
            'dot length' => [static fn () => Similarity::dot([1, 2], [1]), AlgoException::INVALID_INPUT],
            'kmeans empty' => [static fn () => KMeans::fit([], 1), AlgoException::EMPTY_INPUT],
            'kmeans k' => [static fn () => KMeans::fit([[0.0]], 2), AlgoException::OUT_OF_RANGE],
            'closest pair' => [static fn () => ClosestPair::of([new Point(0, 0)]), AlgoException::EMPTY_INPUT],
            'bigint parse' => [static fn () => BigInt::parse('12x'), AlgoException::INVALID_INPUT],
        ];
    }

    /**
     * @dataProvider errorCases
     * @param \Closure(): mixed $fn
     */
    #[DataProvider('errorCases')]
    public function testCanonicalErrorCodes(\Closure $fn, string $code): void
    {
        try {
            $fn();
        } catch (AlgoException $e) {
            self::assertSame($code, $e->getErrorCode());
            return;
        }
        self::fail("expected AlgoException {$code}");
    }

    public function testUnknownErrorCodeIsRejected(): void
    {
        $this->expectException(\LogicException::class);
        new AlgoException('NOPE', 'x');
    }

    public function testHuffmanRoundTrip(): void
    {
        foreach (['', 'a', 'aaaa', 'abracadabra abracadabra', "\x00\xff\x00\x10"] as $data) {
            $r = Huffman::encode($data);
            self::assertSame($data, Huffman::decode($r->encoded, $r->bitLength, $r->tree), bin2hex($data));
        }
        $r = Huffman::encode('ab');
        self::assertSame([97 => '0', 98 => '1'], $r->codes);
    }

    public function testHuffmanRejectsTruncatedStream(): void
    {
        $r = Huffman::encode('abcabcaab');
        $this->expectException(AlgoException::class);
        Huffman::decode($r->encoded, $r->bitLength - 1, $r->tree);
    }

    public function testRleAndLz77RoundTrip(): void
    {
        $data = str_repeat('ab', 300) . str_repeat("\x00", 600) . 'xyz';
        self::assertSame($data, Rle::decode(Rle::encode($data)));
        self::assertSame($data, Lz77::decompress(Lz77::compress($data)));
        self::assertSame($data, Lz77::decompress(Lz77::compress($data, 7)));
    }

    public function testBloomFilter(): void
    {
        $bf = BloomFilter::forCapacity(100, 0.01);
        self::assertGreaterThan(0, $bf->size());
        self::assertGreaterThan(0, $bf->hashCount());
        $bf->add('lombok');
        self::assertTrue($bf->has('lombok'));
        self::assertGreaterThan(0.0, $bf->estimatedFpr());
        self::assertSame(intdiv($bf->size() + 7, 8), strlen($bf->toBytes()));
    }

    public function testHyperLogLogMerge(): void
    {
        $a = new HyperLogLog(10);
        $b = new HyperLogLog(10);
        for ($i = 0; $i < 500; $i++) {
            $a->add("a{$i}");
            $b->add("b{$i}");
        }
        $m = $a->merge($b);
        self::assertSame(10, $m->precision());
        self::assertEqualsWithDelta(1000, $m->count(), 100);
        self::assertSame(1024, strlen($m->registersBytes()));
        self::assertSame(16, strlen((new HyperLogLog(1))->registersBytes()));
    }

    public function testDataStructures(): void
    {
        $ds = new DisjointSet(4);
        self::assertTrue($ds->union(0, 1));
        self::assertFalse($ds->union(1, 0));
        self::assertTrue($ds->connected(0, 1));
        self::assertSame(3, $ds->count());
        self::assertSame($ds->find(0), $ds->find(1));
        $ft = new FenwickTree([1, 2, 3, 4]);
        self::assertSame(4, $ft->size());
        self::assertSame(2, $ft->pointQuery(2));
        self::assertSame(6, $ft->rangeSum(1, 3));
    }

    public function testHashes(): void
    {
        self::assertSame('cbf29ce484222325', Fnv1a::hash64(''));
        self::assertSame(Fnv1a::hash64('a'), U64::toHex(Fnv1a::hash64Int('a')));
        self::assertSame('ef46db3751d8e999', XxHash64::hash(''));
        self::assertSame(XxHash64::hash('abc', 7), U64::toHex(XxHash64::hashInt('abc', 7)));
        $key = (string) hex2bin('000102030405060708090a0b0c0d0e0f');
        self::assertSame(SipHash::hash24($key, 'x'), U64::toHex(SipHash::hash24Int($key, 'x')));
    }

    public function testU64AndBigInt(): void
    {
        self::assertSame(-1, U64::sub(0, 1));
        self::assertSame(1, U64::compare(-1, 1));
        self::assertSame('18446744073709551615', U64::toDecimal(-1));
        self::assertSame(-1, U64::from('18446744073709551615'));
        self::assertSame(5, U64::from(gmp_init(5)));
        self::assertSame(15, U64::mod(-1, 16));
        self::assertSame(0x80000000, U32::rotr(1, 1));
        self::assertSame(32, U32::clz(0));
        self::assertSame('9007199254740992', BigInt::out(gmp_pow(2, 53)));
        self::assertSame(-3, gmp_intval(BigInt::rem(gmp_init(-7), gmp_init(4))));
        self::assertSame(1, gmp_intval(BigInt::modPos(gmp_init(-7), gmp_init(4))));
    }

    public function testRng(): void
    {
        $sm = new SplitMix64(0);
        self::assertSame('e220a8397b1dcdaf', U64::toHex($sm->next()));
        $p = new Pcg32(42, 54);
        self::assertSame(0xa15c02b7, $p->next());
        $f = (new Pcg32())->nextFloat();
        self::assertTrue($f >= 0.0 && $f < 1.0);
        $x = new Xoshiro256pp();
        $v = $x->nextFloat();
        self::assertTrue($v >= 0.0 && $v < 1.0);
        self::assertLessThan(10, $x->nextInt(10));
    }

    public function testMath(): void
    {
        self::assertSame('0', gmp_strval(NumberTheory::gcd(0, 0)));
        self::assertSame('0', gmp_strval(NumberTheory::modPow(5, 3, 1)));
        self::assertSame(
            ['g' => '3', 'x' => '1', 'y' => '1'],
            array_map('gmp_strval', NumberTheory::extendedGcd(12, -9)),
        );
        $f = Primes::pollardRho('600851475143');
        self::assertSame(0, gmp_intval(gmp_mod(gmp_init('600851475143'), $f)));
        self::assertSame([1, 2, 3, 0], Ntt::inverse(Ntt::transform([1, 2, 3, 0])));
        self::assertSame([5, 11, 5, 6], Ntt::polyMul([1, 2], [5, 1, 3]));
    }

    public function testSortSearchString(): void
    {
        $desc = static fn (int $a, int $b): int => $b <=> $a;
        self::assertSame([3, 2, 1], Sort::heapsort([1, 3, 2], $desc));
        self::assertSame([3, 2, 1], Sort::quicksort([1, 3, 2], $desc));
        self::assertSame([0, 1, 2], Sort::countingSort([2, 1, 0], 5));
        $parabola = static fn (float $x): float => ($x - 2) * ($x - 2);
        self::assertEqualsWithDelta(2.0, Search::ternary(0, 5, $parabola, false), 1e-6);
        self::assertSame(-1, Search::exponential([], 1));
        self::assertSame(['a', '😀', 'b'], StringAlgo::codePoints('a😀b'));
        self::assertSame([0, 2], StringAlgo::kmpSearch('😀a😀a', '😀'));
        $ac = new AhoCorasick();
        $ac->addPattern('he');
        $ac->addPattern('she');
        $ac->build();
        self::assertSame([['pattern' => 'she', 'index' => 0], ['pattern' => 'he', 'index' => 1]], $ac->search('she'));
    }

    public function testGraphAndGeometry(): void
    {
        $g = new Graph(3, [new Edge(0, 1, 1), [1, 2, 2]]);
        self::assertSame([[0, 1, 1], [1, 2, 2]], array_map(static fn (Edge $e): array => $e->toArray(), $g->edges));
        $r = AStar::search($g, 0, 2, static fn (int $n): int => 0);
        self::assertSame([0, 1, 2], $r['path']);
        self::assertSame([], PageRank::compute(new Graph(0)));
        self::assertSame([1.5, -2.0], Point::of([1.5, -2])->toArray());
    }

    /** @return array<string, array{float, string}> */
    public static function numberCases(): array
    {
        return [
            'zero' => [0.0, '0'],
            'neg zero' => [-0.0, '-0'],
            'tenth' => [0.1, '0.1'],
            'big' => [1e21, '1e+21'],
            'small' => [1.5e-7, '1.5e-7'],
            'nan' => [NAN, '"NaN"'],
            'inf' => [-INF, '"-Infinity"'],
            'int valued' => [2.0, '2'],
        ];
    }

    /** @dataProvider numberCases */
    #[DataProvider('numberCases')]
    public function testCanonicalNumber(float $x, string $want): void
    {
        self::assertSame($want, Json::canonical($x));
    }

    public function testCanonicalJson(): void
    {
        self::assertSame('{"a":[1,"\u0001\n"],"b":null}', Json::canonical(['b' => null, 'a' => [1, "\x01\n"]]));
        self::assertSame('"9007199254740993"', Json::canonical(gmp_add(gmp_pow(2, 53), 1)));
        self::assertTrue(Json::canonical(Json::parse('-0')) === '-0');
    }

    public function testMinHeap(): void
    {
        /** @var MinHeap<array<int, int|float>> $h */
        $h = new MinHeap(MinHeap::tupleLess(...));
        self::assertNull($h->pop());
        foreach ([[3, 1], [1, 2], [1, 1], [2, 0]] as $t) {
            $h->push($t);
        }
        self::assertSame([1, 1], $h->pop());
        self::assertSame([1, 2], $h->pop());
        self::assertSame(2, $h->size());
    }
}

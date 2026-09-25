<?php

// LombokAlgoritma — vector dispatch table: group + input → output value (SPEC §4.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Vectors;

use LombokAlgoritma\AlgoException;
use LombokAlgoritma\Compression\Huffman;
use LombokAlgoritma\Compression\Lz77;
use LombokAlgoritma\Compression\Rle;
use LombokAlgoritma\Core\BigInt;
use LombokAlgoritma\Core\U64;
use LombokAlgoritma\DataStructure\BloomFilter;
use LombokAlgoritma\DataStructure\DisjointSet;
use LombokAlgoritma\DataStructure\FenwickTree;
use LombokAlgoritma\DataStructure\HyperLogLog;
use LombokAlgoritma\DataStructure\SegmentTree;
use LombokAlgoritma\Geometry\Bezier;
use LombokAlgoritma\Geometry\ClosestPair;
use LombokAlgoritma\Geometry\ConvexHull;
use LombokAlgoritma\Geometry\Cross;
use LombokAlgoritma\Geometry\Point;
use LombokAlgoritma\Geometry\PointInPolygon;
use LombokAlgoritma\Graph\AStar;
use LombokAlgoritma\Graph\BellmanFord;
use LombokAlgoritma\Graph\Bfs;
use LombokAlgoritma\Graph\BipartiteMatching;
use LombokAlgoritma\Graph\Dfs;
use LombokAlgoritma\Graph\Dijkstra;
use LombokAlgoritma\Graph\Dinic;
use LombokAlgoritma\Graph\Edge;
use LombokAlgoritma\Graph\FloydWarshall;
use LombokAlgoritma\Graph\Kruskal;
use LombokAlgoritma\Graph\PageRank;
use LombokAlgoritma\Graph\Prim;
use LombokAlgoritma\Graph\TarjanScc;
use LombokAlgoritma\Graph\TopologicalSort;
use LombokAlgoritma\Hash\Fnv1a;
use LombokAlgoritma\Hash\Murmur3;
use LombokAlgoritma\Hash\SipHash;
use LombokAlgoritma\Hash\XxHash32;
use LombokAlgoritma\Hash\XxHash64;
use LombokAlgoritma\Math\Karatsuba;
use LombokAlgoritma\Math\Matrix;
use LombokAlgoritma\Math\NumberTheory;
use LombokAlgoritma\Math\Ntt;
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

/**
 * The same table as typescript/tests/vectors/dispatch.ts (field names per group). An AlgoException
 * becomes `['error' => code]`; any other throwable is a bug and propagates.
 */
final class Dispatch
{
    /** @var array<string, \Closure(array<array-key, mixed>): mixed>|null */
    private static ?array $table = null;

    /** @return array<string, \Closure(array<array-key, mixed>): mixed> */
    public static function table(): array
    {
        return self::$table ??= self::build();
    }

    public static function has(string $group): bool
    {
        return isset(self::table()[$group]);
    }

    /** Run one case; AlgoException → `['error' => code]` (SPEC §2, §4.2). */
    public static function run(string $group, mixed $input): mixed
    {
        $fn = self::table()[$group] ?? null;
        if ($fn === null) {
            throw new \UnexpectedValueException("unknown vector group {$group}");
        }
        try {
            return $fn(Input::obj($input));
        } catch (AlgoException $e) {
            return ['error' => $e->getErrorCode()];
        }
    }

    /**
     * @param array<array-key, mixed> $i
     * @param callable(): mixed $f
     * @return list<mixed>
     */
    private static function repeat(array $i, callable $f): array
    {
        $out = [];
        $count = Input::int(Input::get($i, 'count'));
        for ($c = 0; $c < $count; $c++) {
            $out[] = $f();
        }
        return $out;
    }

    /**
     * HyperLogLog item stream: prefix + decimal(i) for i in [0, count).
     *
     * @return list<string>
     */
    private static function items(mixed $spec): array
    {
        $o = Input::obj($spec);
        $prefix = Input::str(Input::get($o, 'prefix'));
        $out = [];
        $count = Input::int(Input::get($o, 'count'));
        for ($k = 0; $k < $count; $k++) {
            $out[] = $prefix . $k;
        }
        return $out;
    }

    /**
     * @param list<Edge> $es
     * @return list<array{int, int, int|float}>
     */
    private static function edgesOut(array $es): array
    {
        return array_map(static fn (Edge $e): array => $e->toArray(), $es);
    }

    /**
     * @param list<\GMP> $xs
     * @return list<int|string>
     */
    private static function intsOut(array $xs): array
    {
        return array_map(BigInt::out(...), $xs);
    }

    /**
     * Indices of `keys` in the order a stable sorter puts `(key, index)` pairs sorted by key.
     *
     * @param bool $merge true → Sort::mergesort, false → Sort::timsort
     * @param array<array-key, mixed> $i
     * @return list<int>
     */
    private static function stablePerm(bool $merge, array $i): array
    {
        $pairs = [];
        foreach (Input::nums(Input::get($i, 'keys')) as $idx => $k) {
            $pairs[] = [$k, $idx];
        }
        $cmp = static fn (array $x, array $y): int => $x[0] <=> $y[0];
        $sorted = $merge ? Sort::mergesort($pairs, $cmp) : Sort::timsort($pairs, $cmp);
        return array_map(static fn (array $p): int => $p[1], $sorted);
    }

    /** @return array<string, \Closure(array<array-key, mixed>): mixed> */
    private static function build(): array
    {
        $g = Input::get(...);
        return [
            // §3 canonical number formatting
            'canon.number' => static function (array $i) use ($g): float {
                $v = unpack('E', Input::bytes($g($i, 'bits')));
                if ($v === false || !is_float($v[1])) {
                    throw new \UnexpectedValueException('canon.number: bits must be 8 bytes');
                }
                return $v[1];
            },

            // §5 PRNG
            'rng.splitmix64' => static function (array $i) use ($g): array {
                $r = new SplitMix64(Input::big($g($i, 'seed')));
                return self::repeat($i, static fn (): string => U64::toHex($r->next()));
            },
            'rng.xoshiro256pp' => static function (array $i) use ($g): array {
                $r = new Xoshiro256pp(Input::big($g($i, 'seed')));
                return self::repeat($i, static fn (): string => U64::toHex($r->next()));
            },
            'rng.xoshiro256pp_float' => static function (array $i) use ($g): array {
                $r = new Xoshiro256pp(Input::big($g($i, 'seed')));
                return self::repeat($i, static fn (): float => $r->nextFloat());
            },
            'rng.xoshiro256pp_int' => static function (array $i) use ($g): array {
                $r = new Xoshiro256pp(Input::big($g($i, 'seed')));
                $n = Input::int($g($i, 'n'));
                return self::repeat($i, static fn (): int => $r->nextInt($n));
            },
            'rng.pcg32' => static function (array $i) use ($g): array {
                $r = new Pcg32(Input::big($g($i, 'state')), Input::big($g($i, 'seq')));
                return self::repeat($i, static fn (): int => $r->next());
            },
            'rng.pcg32_bounded' => static function (array $i) use ($g): array {
                $r = new Pcg32(Input::big($g($i, 'state')), Input::big($g($i, 'seq')));
                $bound = Input::int($g($i, 'bound'));
                return self::repeat($i, static fn (): int => $r->nextBounded($bound));
            },

            // §6 sort
            'sort.quicksort' => static fn (array $i): array => Sort::quicksort(Input::nums($g($i, 'input'))),
            'sort.timsort' => static fn (array $i): array => Sort::timsort(Input::nums($g($i, 'input'))),
            'sort.mergesort' => static fn (array $i): array => Sort::mergesort(Input::nums($g($i, 'input'))),
            'sort.heapsort' => static fn (array $i): array => Sort::heapsort(Input::nums($g($i, 'input'))),
            'sort.radix_lsd' => static fn (array $i): array => Sort::radixSortLsd(Input::ints($g($i, 'input'))),
            'sort.counting' => static fn (array $i): array => Sort::countingSort(Input::nums($g($i, 'input'))),
            'sort.timsort_stable' => static fn (array $i): array => self::stablePerm(false, $i),
            'sort.mergesort_stable' => static fn (array $i): array => self::stablePerm(true, $i),

            // §7 search
            'search.binary' => static fn (array $i): int
                => Search::binary(Input::nums($g($i, 'arr')), Input::num($g($i, 'target'))),
            'search.lower_bound' => static fn (array $i): int
                => Search::lowerBound(Input::nums($g($i, 'arr')), Input::num($g($i, 'target'))),
            'search.upper_bound' => static fn (array $i): int
                => Search::upperBound(Input::nums($g($i, 'arr')), Input::num($g($i, 'target'))),
            'search.interpolation' => static fn (array $i): int
                => Search::interpolation(Input::nums($g($i, 'arr')), Input::num($g($i, 'target'))),
            'search.exponential' => static fn (array $i): int
                => Search::exponential(Input::nums($g($i, 'arr')), Input::num($g($i, 'target'))),
            'search.jump' => static fn (array $i): int
                => Search::jump(Input::nums($g($i, 'arr')), Input::num($g($i, 'target'))),
            'search.fibonacci' => static fn (array $i): int
                => Search::fibonacci(Input::nums($g($i, 'arr')), Input::num($g($i, 'target'))),
            'search.linear' => static fn (array $i): int
                => Search::linear(Input::nums($g($i, 'arr')), Input::num($g($i, 'target'))),
            'search.ternary' => static function (array $i) use ($g): float {
                $c = Input::num($g($i, 'c'));
                $max = Input::bool($g($i, 'maximize'));
                $f = $max
                    ? static fn (float $x): float => -(($x - $c) * ($x - $c))
                    : static fn (float $x): float => ($x - $c) * ($x - $c);
                return Search::ternary(
                    Input::num($g($i, 'lo')),
                    Input::num($g($i, 'hi')),
                    $f,
                    $max,
                    (float) Input::num($g($i, 'epsilon')),
                );
            },

            // §10 math
            'math.gcd' => static fn (array $i): int|string
                => BigInt::out(NumberTheory::gcd(Input::big($g($i, 'a')), Input::big($g($i, 'b')))),
            'math.lcm' => static fn (array $i): int|string
                => BigInt::out(NumberTheory::lcm(Input::big($g($i, 'a')), Input::big($g($i, 'b')))),
            'math.extended_gcd' => static function (array $i) use ($g): array {
                $r = NumberTheory::extendedGcd(Input::big($g($i, 'a')), Input::big($g($i, 'b')));
                return ['g' => BigInt::out($r['g']), 'x' => BigInt::out($r['x']), 'y' => BigInt::out($r['y'])];
            },
            'math.mod_inverse' => static fn (array $i): int|string
                => BigInt::out(NumberTheory::modInverse(Input::big($g($i, 'a')), Input::big($g($i, 'm')))),
            'math.mod_pow' => static fn (array $i): int|string => BigInt::out(NumberTheory::modPow(
                Input::big($g($i, 'base')),
                Input::big($g($i, 'exp')),
                Input::big($g($i, 'mod')),
            )),
            'math.crt' => static fn (array $i): int|string
                => BigInt::out(NumberTheory::crt(Input::bigs($g($i, 'r')), Input::bigs($g($i, 'm')))),
            'math.is_prime' => static fn (array $i): bool => Primes::isPrime(Input::big($g($i, 'n'))),
            'math.next_prime' => static fn (array $i): int|string
                => BigInt::out(Primes::nextPrime(Input::big($g($i, 'n')))),
            'math.sieve' => static fn (array $i): array => Primes::sieve(Input::int($g($i, 'n'))),
            'math.segmented_sieve' => static fn (array $i): array
                => Primes::segmentedSieve(Input::int($g($i, 'lo')), Input::int($g($i, 'hi'))),
            'math.factorize' => static fn (array $i): array
                => self::intsOut(Primes::factorize(Input::big($g($i, 'n')))),
            'math.karatsuba' => static fn (array $i): int|string
                => BigInt::out(Karatsuba::multiply(Input::big($g($i, 'x')), Input::big($g($i, 'y')))),
            'math.ntt' => static fn (array $i): array => Ntt::transform(Input::bigs($g($i, 'a'))),
            'math.poly_mul_ntt' => static fn (array $i): array
                => Ntt::polyMul(Input::bigs($g($i, 'a')), Input::bigs($g($i, 'b'))),
            'math.mat_mul' => static fn (array $i): array
                => Matrix::multiply(Input::matrix($g($i, 'a')), Input::matrix($g($i, 'b'))),
            'math.strassen' => static fn (array $i): array
                => Matrix::strassen(Input::matrix($g($i, 'a')), Input::matrix($g($i, 'b'))),

            // §11 string
            'string.kmp' => static fn (array $i): array
                => StringAlgo::kmpSearch(Input::str($g($i, 'text')), Input::str($g($i, 'pattern'))),
            'string.levenshtein' => static fn (array $i): int
                => StringAlgo::levenshtein(Input::str($g($i, 'a')), Input::str($g($i, 'b'))),
            'string.damerau_levenshtein' => static fn (array $i): int
                => StringAlgo::damerauLevenshtein(Input::str($g($i, 'a')), Input::str($g($i, 'b'))),
            'string.jaro' => static fn (array $i): float
                => StringAlgo::jaro(Input::str($g($i, 'a')), Input::str($g($i, 'b'))),
            'string.jaro_winkler' => static fn (array $i): float => StringAlgo::jaroWinkler(
                Input::str($g($i, 'a')),
                Input::str($g($i, 'b')),
                (float) Input::num($i['p'] ?? 0.1),
            ),
            'string.aho_corasick' => static function (array $i) use ($g): array {
                $ac = new AhoCorasick();
                foreach (Input::strs($g($i, 'patterns')) as $p) {
                    $ac->addPattern($p);
                }
                return array_map(
                    static fn (array $m): array => [$m['pattern'], $m['index']],
                    $ac->search(Input::str($g($i, 'text'))),
                );
            },
            'string.polynomial_hash' => static fn (array $i): int => StringAlgo::polynomialHash(
                Input::str($g($i, 's')),
                Input::int($i['base'] ?? 31),
                Input::int($i['mod'] ?? 1_000_000_007),
            ),

            // §12 non-cryptographic hashes (bytes as hex)
            'hash.fnv1a32' => static fn (array $i): int => Fnv1a::hash32(Input::bytes($g($i, 'data'))),
            'hash.fnv1a64' => static fn (array $i): string => Fnv1a::hash64(Input::bytes($g($i, 'data'))),
            'hash.murmur3_32' => static fn (array $i): int
                => Murmur3::hash32(Input::bytes($g($i, 'data')), Input::int($g($i, 'seed'))),
            'hash.xxhash32' => static fn (array $i): int
                => XxHash32::hash(Input::bytes($g($i, 'data')), Input::int($g($i, 'seed'))),
            'hash.xxhash64' => static fn (array $i): string
                => XxHash64::hash(Input::bytes($g($i, 'data')), Input::big($g($i, 'seed'))),
            'hash.siphash24' => static fn (array $i): string
                => SipHash::hash24(Input::bytes($g($i, 'key')), Input::bytes($g($i, 'data'))),

            // §8 data structures
            'datastructure.bloom' => static function (array $i) use ($g): array {
                $f = BloomFilter::withParams(Input::int($g($i, 'm')), Input::int($g($i, 'k')));
                foreach (Input::strs($g($i, 'add')) as $x) {
                    $f->add($x);
                }
                return [
                    'bits' => bin2hex($f->toBytes()),
                    'set_bits' => $f->setBits(),
                    'has' => array_map($f->has(...), Input::strs($g($i, 'query'))),
                ];
            },
            'datastructure.hyperloglog' => static function (array $i) use ($g): array {
                $h = new HyperLogLog(Input::int($g($i, 'b')));
                foreach (self::items($g($i, 'items')) as $x) {
                    $h->add($x);
                }
                return ['estimate' => $h->count(), 'registers_fnv1a64' => Fnv1a::hash64($h->registersBytes())];
            },
            'datastructure.hyperloglog_merge' => static function (array $i) use ($g): int {
                $a = new HyperLogLog(Input::int($g($i, 'b')));
                $b = new HyperLogLog(Input::int($g($i, 'b')));
                foreach (self::items($g($i, 'a')) as $x) {
                    $a->add($x);
                }
                foreach (self::items($g($i, 'b_items')) as $x) {
                    $b->add($x);
                }
                return $a->merge($b)->count();
            },
            'datastructure.disjoint_set' => static function (array $i) use ($g): array {
                $ds = new DisjointSet(Input::int($g($i, 'n')));
                $out = [];
                foreach (Input::list($g($i, 'ops')) as $op) {
                    $op = Input::list($op);
                    $name = Input::str($op[0]);
                    $out[] = match ($name) {
                        'union' => $ds->union(Input::int($op[1]), Input::int($op[2])),
                        'find' => $ds->find(Input::int($op[1])),
                        'connected' => $ds->connected(Input::int($op[1]), Input::int($op[2])),
                        'count' => $ds->count(),
                        default => throw new \UnexpectedValueException("disjoint_set: unknown op {$name}"),
                    };
                }
                return $out;
            },
            'datastructure.fenwick' => static function (array $i) use ($g): array {
                $ft = new FenwickTree(Input::nums($g($i, 'init')));
                $out = [];
                foreach (Input::list($g($i, 'ops')) as $op) {
                    $op = Input::list($op);
                    $name = Input::str($op[0]);
                    $a = Input::int($op[1]);
                    if ($name === 'update') {
                        $ft->update($a, Input::num($op[2]));
                        $out[] = null;
                        continue;
                    }
                    $out[] = match ($name) {
                        'prefix' => $ft->prefixSum($a),
                        'range' => $ft->rangeSum($a, Input::int($op[2])),
                        'point' => $ft->pointQuery($a),
                        default => throw new \UnexpectedValueException("fenwick: unknown op {$name}"),
                    };
                }
                return $out;
            },
            'datastructure.segment_tree' => static function (array $i) use ($g): array {
                $st = new SegmentTree(Input::nums($g($i, 'init')));
                $out = [];
                foreach (Input::list($g($i, 'ops')) as $op) {
                    $op = Input::list($op);
                    $name = Input::str($op[0]);
                    $l = Input::int($op[1]);
                    $r = Input::int($op[2]);
                    if ($name === 'update') {
                        $st->update($l, $r, Input::num($op[3]));
                        $out[] = null;
                    } elseif ($name === 'query') {
                        $out[] = $st->query($l, $r);
                    } else {
                        throw new \UnexpectedValueException("segment_tree: unknown op {$name}");
                    }
                }
                return $out;
            },

            // §9 graph (edges as [from, to, weight])
            'graph.bfs' => static fn (array $i): array
                => Bfs::distances(Input::graph($g($i, 'graph')), Input::int($g($i, 'source'))),
            'graph.dfs' => static fn (array $i): array
                => Dfs::order(Input::graph($g($i, 'graph')), Input::int($g($i, 'source'))),
            'graph.dijkstra' => static fn (array $i): array
                => Dijkstra::distances(Input::graph($g($i, 'graph')), Input::int($g($i, 'source'))),
            'graph.bellman_ford' => static function (array $i) use ($g): array {
                $r = BellmanFord::run(Input::graph($g($i, 'graph')), Input::int($g($i, 'source')));
                return ['distances' => $r['distances'], 'has_negative_cycle' => $r['hasNegativeCycle']];
            },
            'graph.floyd_warshall' => static fn (array $i): array
                => FloydWarshall::allPairs(Input::graph($g($i, 'graph'))),
            'graph.topological_sort' => static fn (array $i): array
                => TopologicalSort::sort(Input::graph($g($i, 'graph'))),
            'graph.kruskal' => static fn (array $i): array
                => self::edgesOut(Kruskal::minimumSpanningForest(Input::graph($g($i, 'graph')))),
            'graph.prim' => static fn (array $i): array
                => self::edgesOut(Prim::minimumSpanningForest(Input::graph($g($i, 'graph')))),
            'graph.tarjan_scc' => static fn (array $i): array
                => TarjanScc::components(Input::graph($g($i, 'graph'))),
            'graph.dinic' => static fn (array $i): int|float => Dinic::maxFlow(
                Input::graph($g($i, 'graph')),
                Input::int($g($i, 'source')),
                Input::int($g($i, 'sink')),
            ),
            'graph.bipartite_matching' => static function (array $i) use ($g): int {
                $pairs = [];
                foreach (Input::list($g($i, 'pairs')) as $p) {
                    $p = Input::ints($p);
                    $pairs[] = [$p[0], $p[1]];
                }
                return BipartiteMatching::hopcroftKarp(
                    Input::int($g($i, 'n_left')),
                    Input::int($g($i, 'n_right')),
                    $pairs,
                )['size'];
            },
            'graph.a_star' => static function (array $i) use ($g): array {
                $h = isset($i['heuristic']) ? Input::nums($i['heuristic']) : null;
                return AStar::search(
                    Input::graph($g($i, 'graph')),
                    Input::int($g($i, 'source')),
                    Input::int($g($i, 'target')),
                    $h === null ? null : static fn (int $v): int|float => $h[$v],
                );
            },
            'graph.pagerank' => static fn (array $i): array => PageRank::compute(
                Input::graph($g($i, 'graph')),
                (float) Input::num($g($i, 'damping')),
                Input::int($g($i, 'iterations')),
            ),

            // §13.1 ml
            'ml.dot' => static fn (array $i): int|float
                => Similarity::dot(Input::nums($g($i, 'a')), Input::nums($g($i, 'b'))),
            'ml.l2_norm' => static fn (array $i): float => Similarity::l2Norm(Input::nums($g($i, 'v'))),
            'ml.cosine' => static fn (array $i): int|float
                => Similarity::cosine(Input::nums($g($i, 'a')), Input::nums($g($i, 'b'))),
            'ml.l2_distance' => static fn (array $i): float
                => Similarity::l2Distance(Input::nums($g($i, 'a')), Input::nums($g($i, 'b'))),
            'ml.l1_distance' => static fn (array $i): int|float
                => Similarity::l1Distance(Input::nums($g($i, 'a')), Input::nums($g($i, 'b'))),
            'ml.normalize' => static fn (array $i): array => Similarity::normalize(Input::nums($g($i, 'v'))),
            'ml.jaccard' => static fn (array $i): int|float
                => Similarity::jaccard(Input::strs($g($i, 'a')), Input::strs($g($i, 'b'))),
            'ml.pearson' => static fn (array $i): int|float
                => Similarity::pearson(Input::nums($g($i, 'a')), Input::nums($g($i, 'b'))),
            'ml.batch_cosine' => static fn (array $i): array => array_map(
                static fn (array $r): array => [$r['index'], $r['score']],
                Similarity::batchCosine(Input::nums($g($i, 'query')), Input::matrix($g($i, 'candidates'))),
            ),
            'ml.kmeans' => static fn (array $i): array => KMeans::fit(
                Input::matrix($g($i, 'points')),
                Input::int($g($i, 'k')),
                Input::int($g($i, 'max_iter')),
                (float) Input::num($g($i, 'tol')),
                Input::big($g($i, 'seed')),
            ),

            // §13.2 geometry (points as [x, y])
            'geometry.cross' => static fn (array $i): float => Cross::of(
                Input::point($g($i, 'o')),
                Input::point($g($i, 'a')),
                Input::point($g($i, 'b')),
            ),
            'geometry.convex_hull' => static fn (array $i): array => array_map(
                static fn (Point $p): array => $p->toArray(),
                ConvexHull::of(Input::points($g($i, 'points'))),
            ),
            'geometry.closest_pair' => static fn (array $i): float
                => ClosestPair::of(Input::points($g($i, 'points')))[2],
            'geometry.point_in_polygon' => static fn (array $i): bool
                => PointInPolygon::contains(Input::point($g($i, 'point')), Input::points($g($i, 'polygon'))),
            'geometry.bezier' => static fn (array $i): array
                => Bezier::at(Input::points($g($i, 'points')), Input::num($g($i, 't')))->toArray(),

            // §13.3 compression (bytes as hex)
            'compression.rle_encode' => static fn (array $i): string
                => bin2hex(Rle::encode(Input::bytes($g($i, 'data')))),
            'compression.rle_decode' => static fn (array $i): string
                => bin2hex(Rle::decode(Input::bytes($g($i, 'data')))),
            'compression.lz77_compress' => static fn (array $i): string
                => bin2hex(Lz77::compress(Input::bytes($g($i, 'data')), Input::int($i['window'] ?? 255))),
            'compression.lz77_decompress' => static fn (array $i): string
                => bin2hex(Lz77::decompress(Input::bytes($g($i, 'data')))),
            'compression.huffman' => static function (array $i) use ($g): array {
                $r = Huffman::encode(Input::bytes($g($i, 'data')));
                $codes = [];
                foreach ($r->codes as $byte => $code) {
                    $codes[] = [$byte, $code];
                }
                return ['encoded' => bin2hex($r->encoded), 'bit_length' => $r->bitLength, 'codes' => $codes];
            },
        ];
    }
}

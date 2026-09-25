# LombokAlgoritma — API Reference v0.2.0

| Atribut | Nilai |
|---|---|
| Status | **experimental** (0.x — API boleh berubah di minor berikutnya; perubahan dicatat di CHANGELOG & UPGRADE) |
| Registry | npm `lombokalgoritma` · crates.io `lombokalgoritma` (+ `-capi`, `-wasm`) · PyPI `lombokalgoritma` · Packagist `codinglombok/lombokalgoritma` · Go `github.com/codinglombok/lombokalgoritma/go` |
| Lisensi | Apache-2.0 OR MIT |
| Kontrak perilaku | [SPEC_LombokAlgoritma_v0.2.0.md](SPEC_LombokAlgoritma_v0.2.0.md) (normatif) |

## Konvensi

| Aspek | TypeScript | Rust | Go | Python | PHP |
|---|---|---|---|---|---|
| Impor | `import { dijkstra } from 'lombokalgoritma'` atau subpath `lombokalgoritma/graph` | `use lombokalgoritma::graph::dijkstra` | `import la "github.com/codinglombok/lombokalgoritma/go"` | `from lombokalgoritma import graph` | `use LombokAlgoritma\Graph\Dijkstra;` |
| Byte | `Uint8Array` (string → UTF-8) | `&[u8]` | `[]byte` | `bytes` (str → UTF-8) | `string` biner |
| Bilangan besar | `bigint` | `i64`/`u64`/`i128`/`u128` | `int64`/`uint64`/`*big.Int` | `int` | `int` / `GMP` |
| u64 hash | `bigint` | `u64` | `uint64` | `int` | string hex 16 digit (`…Int` → int) |
| Error | `throw AlgoError` (`.code`) | `Result<T, Error>` (`.code()`) | `(T, error)` dengan `*Error` (`.Code`) | `raise AlgoError` (`.code`) | `throw AlgoException` (`getErrorCode()`) |
| Sinkron/async | semua sinkron (kecuali `concurrent/` TS) | sinkron | sinkron | sinkron | sinkron |

Subpath npm: `.`, `./sort`, `./search`, `./graph`, `./math`, `./string`, `./compression`, `./datastructure`,
`./geometry`, `./ml`, `./concurrent`, `./hardware`, `./package.json` (ESM + CJS + d.ts). Subpath `./crypto` **dihapus**.

Stabilitas: semua simbol di tabel **experimental** sejak versi yang tertulis di CHANGELOG; `convexHullGraham`
**deprecated** (alias `convexHull`, dihapus v0.3.0). Kolom "Error" berisi kode SPEC §2 yang dapat dilempar.

## Sort

| Algoritma | TypeScript | Rust | Go | Python | PHP | Error |
|---|---|---|---|---|---|---|
| quicksort | `quicksort(arr, cmp?)` | `sort::quicksort` | `Quicksort / QuicksortFunc` | `sort.quicksort(arr, cmp=)` | `Sort::quicksort` | — |
| timsort (stable) | `timsort(arr, cmp?)` | `sort::timsort / timsort_by` | `Timsort / TimsortFunc` | `sort.timsort(arr, key=)` | `Sort::timsort` | — |
| mergesort (stable) | `mergesort(arr, cmp?)` | `sort::mergesort / mergesort_by` | `Mergesort / MergesortFunc` | `sort.mergesort(arr, key=)` | `Sort::mergesort` | — |
| heapsort | `heapsort(arr, cmp?)` | `sort::heapsort` | `Heapsort / HeapsortFunc` | `sort.heapsort` | `Sort::heapsort` | — |
| radix LSD (negatives ok) | `radixSortLSD(arr)` | `sort::radix_sort_lsd` | `RadixSortLSD` | `sort.radix_sort_lsd` | `Sort::radixSortLsd` | — |
| counting sort | `countingSort(arr, max?)` | `sort::counting_sort` | `CountingSort / CountingSortMax` | `sort.counting_sort` | `Sort::countingSort` | OUT_OF_RANGE |

## Search

| Algoritma | TypeScript | Rust | Go | Python | PHP | Error |
|---|---|---|---|---|---|---|
| binary | `binarySearch` | `search::binary_search` | `BinarySearch` | `search.binary_search` | `Search::binary` | — |
| lower / upper bound | `lowerBound / upperBound` | `search::lower_bound / upper_bound` | `LowerBound / UpperBound` | `search.lower_bound / upper_bound` | `Search::lowerBound / upperBound` | — |
| interpolation | `interpolationSearch` | `search::interpolation_search` | `InterpolationSearch` | `search.interpolation_search` | `Search::interpolation` | — |
| exponential | `exponentialSearch` | `search::exponential_search` | `ExponentialSearch` | `search.exponential_search` | `Search::exponential` | — |
| jump | `jumpSearch` | `search::jump_search` | `JumpSearch` | `search.jump_search` | `Search::jump` | — |
| fibonacci | `fibonacciSearch` | `search::fibonacci_search` | `FibonacciSearch` | `search.fibonacci_search` | `Search::fibonacci` | — |
| linear | `linearSearch` | `search::linear_search` | `LinearSearch` | `search.linear_search` | `Search::linear` | — |
| ternary (unimodal f) | `ternarySearch(lo, hi, f, opts)` | `search::ternary_search` | `TernarySearch` | `search.ternary_search` | `Search::ternary` | — |

## Math

| Algoritma | TypeScript | Rust | Go | Python | PHP | Error |
|---|---|---|---|---|---|---|
| gcd / lcm | `gcd / lcm (bigint)` | `math::gcd / lcm` | `GCD / LCM` | `math.gcd / lcm` | `NumberTheory::gcd / lcm` | OVERFLOW (Go) |
| extended gcd | `extendedGcd` | `math::extended_gcd` | `ExtendedGCD` | `math.extended_gcd` | `NumberTheory::extendedGcd` | — |
| modular inverse | `modInverse` | `math::mod_inverse` | `ModInverse` | `math.mod_inverse` | `NumberTheory::modInverse` | NO_INVERSE |
| modular power | `modPow` | `math::mod_pow` | `ModPow` | `math.mod_pow` | `NumberTheory::modPow` | OUT_OF_RANGE |
| CRT | `crt` | `math::crt` | `CRT` | `math.crt` | `NumberTheory::crt` | INVALID_INPUT, NOT_COPRIME |
| Miller–Rabin / next prime | `isPrime / nextPrime` | `math::is_prime / next_prime` | `IsPrime / NextPrime` | `math.is_prime / next_prime` | `Primes::isPrime / nextPrime` | — |
| sieve / segmented sieve | `sieve / segmentedSieve` | `math::sieve / segmented_sieve` | `Sieve / SegmentedSieve` | `math.sieve / segmented_sieve` | `Primes::sieve / segmentedSieve` | — |
| Pollard rho / factorize | `pollardRho / factorize` | `math::pollard_rho / factorize` | `PollardRho / Factorize` | `math.pollard_rho / factorize` | `Primes::pollardRho / factorize` | INVALID_INPUT |
| Karatsuba | `karatsuba` | `math::karatsuba` | `Karatsuba` | `math.karatsuba` | `Karatsuba::multiply` | — |
| NTT / polynomial multiply | `ntt / intt / polyMulNTT` | `math::ntt / intt / poly_mul_ntt` | `NTT / PolyMulNTT` | `math.ntt / intt / poly_mul_ntt` | `Ntt::transform / inverse / polyMul` | INVALID_INPUT |
| matrix / Strassen | `matMul / strassenMul` | `math::mat_mul / strassen_mul` | `MatMul / Strassen` | `math.mat_mul / strassen_mul` | `Matrix::multiply / strassen` | INVALID_INPUT |
| FFT (TS-only, non-normative) | `fft / realToComplex` | — | — | — | — | INVALID_INPUT |

## String (code points)

| Algoritma | TypeScript | Rust | Go | Python | PHP | Error |
|---|---|---|---|---|---|---|
| KMP | `kmpSearch / kmpFind` | `string::kmp_search / kmp_find` | `KMPSearch` | `string.kmp_search` | `StringAlgo::kmpSearch` | — |
| Levenshtein / Damerau | `levenshtein / damerauLevenshtein` | `string::levenshtein / damerau_levenshtein` | `Levenshtein / DamerauLevenshtein` | `string.levenshtein / damerau_levenshtein` | `StringAlgo::levenshtein / damerauLevenshtein` | — |
| Jaro / Jaro–Winkler | `jaro / jaroWinkler` | `string::jaro / jaro_winkler` | `Jaro / JaroWinkler` | `string.jaro / jaro_winkler` | `StringAlgo::jaro / jaroWinkler` | — |
| Aho–Corasick | `AhoCorasick` | `string::AhoCorasick` | `AhoCorasick (NewAhoCorasick)` | `string.AhoCorasick` | `AhoCorasick` | — |
| polynomial hash | `polynomialHash` | `string::polynomial_hash` | `PolynomialHash` | `string.polynomial_hash` | `StringAlgo::polynomialHash` | OUT_OF_RANGE (non-TS) |

## Hash (non-cryptographic)

| Algoritma | TypeScript | Rust | Go | Python | PHP | Error |
|---|---|---|---|---|---|---|
| FNV-1a 32/64 | `fnv1a32 / fnv1a64` | `string::fnv1a32 / fnv1a64` | `FNV1a32 / FNV1a64` | `hash.fnv1a32 / fnv1a64` | `Fnv1a::hash32 / hash64` | — |
| MurmurHash3 x86_32 | `murmurHash3_32` | `string::murmur3_32` | `MurmurHash3` | `hash.murmur3_32` | `Murmur3::hash32` | — |
| xxHash32 / xxHash64 | `xxHash32 / xxHash64` | `string::xxhash32 / xxhash64` | `XXHash32 / XXHash64` | `hash.xxhash32 / xxhash64` | `XxHash32::hash / XxHash64::hash` | — |
| SipHash-2-4 | `sipHash24(key, data)` | `string::siphash24` | `SipHash24` | `hash.siphash24` | `SipHash::hash24` | INVALID_INPUT |

## Data structures

| Algoritma | TypeScript | Rust | Go | Python | PHP | Error |
|---|---|---|---|---|---|---|
| Bloom filter | `BloomFilter.withParams(m,k) / new BloomFilter(n,p)` | `datastructure::BloomFilter::with_params / new` | `NewBloomFilterWithParams / NewBloomFilter` | `datastructure.BloomFilter.with_params` | `BloomFilter::withParams / forCapacity` | OUT_OF_RANGE |
| HyperLogLog | `HyperLogLog(b) · count · merge · registersBytes` | `datastructure::HyperLogLog (registers, merge)` | `NewHyperLogLog (Registers, Merge)` | `datastructure.HyperLogLog (registers, merge)` | `HyperLogLog (registersBytes, merge)` | INVALID_INPUT |
| disjoint set | `DisjointSet` | `datastructure::DisjointSet` | `NewDisjointSet` | `datastructure.DisjointSet` | `DisjointSet` | OUT_OF_BOUNDS (non-TS) |
| Fenwick tree | `FenwickTree` | `datastructure::FenwickTree` | `NewFenwickTree` | `datastructure.FenwickTree` | `FenwickTree` | — |
| segment tree (lazy) | `SegmentTree` | `datastructure::SegmentTree` | `NewSegmentTree` | `datastructure.SegmentTree` | `SegmentTree` | — |

## Graph (one file per algorithm)

| Algoritma | TypeScript | Rust | Go | Python | PHP | Error |
|---|---|---|---|---|---|---|
| BFS / DFS | `bfs / dfs` | `graph::bfs / dfs` | `BFS / DFS` | `graph.bfs / dfs` | `Bfs::distances / Dfs::order` | OUT_OF_RANGE |
| Dijkstra | `dijkstra` | `graph::dijkstra` | `Dijkstra` | `graph.dijkstra` | `Dijkstra::distances` | NEGATIVE_WEIGHT |
| A* | `aStar` | `graph::a_star` | `AStar` | `graph.a_star` | `AStar::search` | NEGATIVE_WEIGHT |
| Bellman–Ford | `bellmanFord` | `graph::bellman_ford` | `BellmanFord` | `graph.bellman_ford` | `BellmanFord::run` | OUT_OF_RANGE |
| Floyd–Warshall | `floydWarshall` | `graph::floyd_warshall` | `FloydWarshall` | `graph.floyd_warshall` | `FloydWarshall::allPairs` | — |
| topological sort (Kahn) | `topologicalSort` | `graph::topological_sort` | `TopologicalSort` | `graph.topological_sort` | `TopologicalSort::sort` | — |
| Kruskal / Prim | `kruskal / prim` | `graph::kruskal / prim` | `Kruskal / Prim` | `graph.kruskal / prim` | `Kruskal / Prim ::minimumSpanningForest` | — |
| Tarjan SCC | `tarjanScc` | `graph::tarjan_scc` | `TarjanSCC` | `graph.tarjan_scc` | `TarjanScc::components` | — |
| max-flow (Dinic) | `dinic` | `graph::dinic` | `Dinic` | `graph.dinic` | `Dinic::maxFlow` | NEGATIVE_WEIGHT, INVALID_INPUT |
| bipartite matching (Hopcroft–Karp) | `bipartiteMatching` | `graph::bipartite_matching` | `BipartiteMatching` | `graph.bipartite_matching` | `BipartiteMatching::hopcroftKarp` | OUT_OF_RANGE |
| PageRank | `pageRank` | `graph::page_rank` | `PageRank` | `graph.pagerank` | `PageRank::compute` | OUT_OF_RANGE |

## ML

| Algoritma | TypeScript | Rust | Go | Python | PHP | Error |
|---|---|---|---|---|---|---|
| dot / norms / distances | `dotProduct / l2Norm / l2Distance / l1Distance` | `ml::dot_product / l2_norm / l2_distance / l1_distance` | `DotProduct / L2Norm / L2Distance / L1Distance` | `ml.dot_product / l2_norm / l2_distance / l1_distance` | `Similarity::dot / l2Norm / l2Distance / l1Distance` | INVALID_INPUT |
| cosine / normalize / batch | `cosineSimilarity / normalize / batchCosine` | `ml::cosine_similarity / normalize / batch_cosine` | `CosineSimilarity / Normalize / BatchCosine` | `ml.cosine_similarity / normalize / batch_cosine` | `Similarity::cosine / normalize / batchCosine` | INVALID_INPUT |
| Jaccard / Pearson | `jaccardSimilarity / pearson` | `ml::jaccard_similarity / pearson` | `JaccardSimilarity / Pearson` | `ml.jaccard_similarity / pearson` | `Similarity::jaccard / pearson` | INVALID_INPUT |
| k-means (k-means++) | `kmeans(points, k, {seed, maxIter, tol})` | `ml::kmeans` | `KMeans` | `ml.kmeans` | `KMeans::fit` | EMPTY_INPUT, OUT_OF_RANGE, INVALID_INPUT |

## Geometry (one file per algorithm)

| Algoritma | TypeScript | Rust | Go | Python | PHP | Error |
|---|---|---|---|---|---|---|
| cross product | `cross` | `geometry::cross` | `Cross` | `geometry.cross` | `Cross::of` | — |
| convex hull (monotone chain) | `convexHull (alias convexHullGraham)` | `geometry::convex_hull` | `ConvexHull` | `geometry.convex_hull` | `ConvexHull::of` | — |
| closest pair | `closestPair` | `geometry::closest_pair` | `ClosestPair` | `geometry.closest_pair` | `ClosestPair::of` | EMPTY_INPUT |
| point in polygon | `pointInPolygon` | `geometry::point_in_polygon` | `PointInPolygon` | `geometry.point_in_polygon` | `PointInPolygon::contains` | — |
| Bézier (de Casteljau) | `bezier` | `geometry::bezier` | `Bezier` | `geometry.bezier` | `Bezier::at` | EMPTY_INPUT |

## Compression

| Algoritma | TypeScript | Rust | Go | Python | PHP | Error |
|---|---|---|---|---|---|---|
| RLE | `rleEncode / rleDecode` | `compression::rle_encode / rle_decode` | `RLEEncode / RLEDecode` | `compression.rle_encode / rle_decode` | `Rle::encode / decode` | INVALID_INPUT |
| LZ77 | `lz77Compress / lz77Decompress` | `compression::lz77_compress / lz77_decompress` | `LZ77Compress / LZ77Decompress` | `compression.lz77_compress / lz77_decompress` | `Lz77::compress / decompress` | OUT_OF_RANGE, INVALID_INPUT |
| Huffman | `huffmanEncode / huffmanDecode` | `compression::huffman_encode / huffman_decode` | `HuffmanEncode / HuffmanDecode` | `compression.huffman_encode / huffman_decode` | `Huffman::encode / decode` | INVALID_INPUT |

## PRNG (core / rng)

| Algoritma | TypeScript | Rust | Go | Python | PHP | Error |
|---|---|---|---|---|---|---|
| SplitMix64 | `SplitMix64` | `rng::SplitMix64` | `SplitMix64 (NewSplitMix64)` | `rng.SplitMix64` | `SplitMix64` | — |
| xoshiro256++ | `Xoshiro256pp (next, nextFloat, nextInt)` | `rng::Xoshiro256pp (next_u64, next_float, next_int)` | `Xoshiro256pp (Next, NextFloat, NextInt)` | `rng.Xoshiro256pp (next, next_float, next_int)` | `Xoshiro256pp (next, nextFloat, nextInt)` | OUT_OF_RANGE |
| PCG32 | `Pcg32 (next, nextBounded, nextFloat)` | `rng::Pcg32 (next_u32, next_bounded, next_float)` | `Pcg32 (Next, NextBounded, NextFloat)` | `rng.Pcg32 (next, next_bounded, next_float)` | `Pcg32 (next, nextBounded, nextFloat)` | OUT_OF_RANGE |

## Hanya TypeScript (tidak normatif lintas bahasa)

| Modul | Simbol | Catatan |
|---|---|---|
| `concurrent` | `Semaphore`, `ReadWriteLock`, `Deque` | primitif async untuk runtime JS |
| `hardware` | `detectSimd`, `MemoryPool`, `popcount`, `clz`, `ctz`, `nextPow2` | deteksi WASM SIMD & helper bit |
| `core` | `AlgoError` + subkelas, `safe-int`, `numeric`, `bit`, `rng` (`randomBytes`, `randomU32` — CSPRNG platform) | `randomBytes` → `UNSUPPORTED` tanpa Web Crypto |
| `math` | `fft`, `realToComplex`, `modAdd/modSub/modMul`, `gcdNum/lcmNum`, `matAdd/matSub/matCreate` | `fft` bergantung `sin/cos` |

C ABI (`rust/lombokalgoritma-capi`, header `include/lombokalgoritma.h`) mengekspor subset: sort, pencarian,
`la_gcd_u64`, `la_mod_pow_u64`, `la_is_prime_u64`, hash 32/64-bit. WASM (`rust/lombokalgoritma-wasm`)
mengekspor subset serupa lewat wasm-bindgen.

## Error code

| Kode | Makna |
|---|---|
| `INVALID_INPUT` | bentuk masukan salah (panjang/ukuran berbeda, stream rusak, kunci SipHash ≠ 16 byte) |
| `OUT_OF_RANGE` | parameter/elemen di luar rentang |
| `EMPTY_INPUT` | elemen terlalu sedikit |
| `NEGATIVE_WEIGHT` | bobot/kapasitas negatif (Dijkstra, A*, Dinic) |
| `NO_INVERSE` | invers modular tidak ada |
| `NOT_COPRIME` | modulus CRT tidak saling prima |
| `OVERFLOW` · `OUT_OF_BOUNDS` · `UNSUPPORTED` | aritmetika terperiksa · indeks wadah · fitur platform |

Tabel identik dengan SPEC §2.

## Perubahan API sejak 0.1.x

- Dihapus: `sha256`, `sha256hex`, `hmacSha256`, `hkdf`, `hkdfExtract`, `hkdfExpand`, subpath `./crypto` (semua port).
- Ditambah: `tarjanScc`, `prim`, `bellmanFord`, `dinic`, `bipartiteMatching`, `xxHash64`, `sipHash24`, `huffmanDecode`,
  `BloomFilter.withParams`, `HyperLogLog.registersBytes`, `convexHull`, `AlgoError`/`ErrorCode` di entry point.
- Diubah: semua error → `AlgoError`; fungsi string atas code point; lihat [UPGRADE.md](../UPGRADE.md).

*Lisensi dokumen: Apache-2.0 OR MIT · © codinglombok*

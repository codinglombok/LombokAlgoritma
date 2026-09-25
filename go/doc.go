// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

// Package lombokalgoritma is the Go port of LombokAlgoritma (Lombok Ecosystem, cluster 00.02): a
// deterministic, zero-dependency algorithm library whose results are byte-identical across all
// ports (TypeScript reference, Rust, Python, Go, PHP) for the shared vectors of
// docs/SPEC_LombokAlgoritma_v0.2.0.md.
//
// Import path: github.com/codinglombok/lombokalgoritma/go — releases are tagged go/vX.Y.Z.
// The package depends only on the Go standard library.
//
// # Contents (SPEC v0.2.0)
//
//   - PRNG (§5): SplitMix64, Xoshiro256pp (Next, NextFloat, NextInt), Pcg32 (Next, NextBounded).
//   - Sort (§6): Quicksort, Timsort, Mergesort, Heapsort (each also as …Func with a comparator),
//     RadixSortLSD, CountingSort.
//   - Search (§7): BinarySearch, LowerBound, UpperBound, InterpolationSearch, ExponentialSearch,
//     JumpSearch, FibonacciSearch, LinearSearch, TernarySearch.
//   - Data structures (§8): BloomFilter, HyperLogLog, DisjointSet, FenwickTree, SegmentTree.
//   - Graph (§9): BFS, DFS, Dijkstra, AStar, BellmanFord, FloydWarshall, TopologicalSort,
//     Kruskal, Prim, TarjanSCC, Dinic, BipartiteMatching, PageRank.
//   - Math (§10): GCD, LCM, ExtendedGCD, ModInverse, ModPow, CRT, IsPrime, NextPrime, Sieve,
//     SegmentedSieve, PollardRho, Factorize, Karatsuba, NTT, PolyMulNTT, MatMul, Strassen.
//   - String (§11, over Unicode code points): KMPSearch, Levenshtein, DamerauLevenshtein, Jaro,
//     JaroWinkler, AhoCorasick, PolynomialHash.
//   - Non-cryptographic hashes (§12): FNV1a32, FNV1a64, MurmurHash3 (x86_32), XXHash32,
//     XXHash64, SipHash24.
//   - ML (§13.1): DotProduct, L2Norm, CosineSimilarity, L2Distance, L1Distance, Normalize,
//     JaccardSimilarity, Pearson, BatchCosine, KMeans.
//   - Geometry (§13.2): Cross, ConvexHull, ClosestPair, PointInPolygon, Bezier.
//   - Compression (§13.3): RLEEncode/RLEDecode, LZ77Compress/LZ77Decompress,
//     HuffmanEncode/HuffmanDecode.
//
// Cryptography (SHA-256, HMAC, HKDF) was removed in v0.2.0 and lives in LombokEncryptDecrypt
// (ADR-016). SipHash-2-4 is a hash-table PRF, not a protocol MAC.
//
// # Errors
//
// Fallible functions return (T, error). Every error is an *Error whose Code is one of the
// canonical SPEC §2 codes (CodeInvalidInput = "INVALID_INPUT", CodeOutOfRange, CodeEmptyInput,
// CodeNegativeWeight, CodeNoInverse, CodeNotCoprime, CodeOverflow, …); errors.Is works with the
// Err* sentinels, which compare codes only.
//
// # Floating point
//
// Float results follow the evaluation order of the SPEC (§0.2): sums run left to right from 0 and
// products are wrapped in float64(…) so the compiler never fuses a·b + c into an FMA.
package lombokalgoritma

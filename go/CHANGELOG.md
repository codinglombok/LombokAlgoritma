# Changelog — Go module `github.com/codinglombok/lombokalgoritma/go`

Maintained by release-please (tags `go/vX.Y.Z`). See the repository [CHANGELOG](../CHANGELOG.md) for the
full history.

## [0.2.0] — conformance release (SPEC v0.2.0)

The Go port now passes all 92 groups / 1059 cases of `vectors/lombokalgoritma-vectors-v1.json`
byte-identically to the TypeScript reference (`go run ./cmd/vectors … > ../out/go.txt`, `cmp` with
`out/typescript.txt`).

### ⚠ Breaking
- **Cryptography removed** (ADR-016): `SHA256`, `SHA256Hex`, `HMACSHA256`, `HKDF` → use
  `lombokencryptdecrypt`.
- Errors: fallible functions return `(T, error)` with `*Error{Code}` carrying the canonical SPEC §2 codes
  (`INVALID_INPUT`, `OUT_OF_RANGE`, `EMPTY_INPUT`, `NEGATIVE_WEIGHT`, `NO_INVERSE`, `NOT_COPRIME`,
  `OVERFLOW`, …); `errors.Is(err, ErrOutOfRange)` compares codes.
- Math API on `int64` with exact 128-bit / `math/big` intermediates: `GCD(a, b int64) uint64`,
  `LCM(a, b int64) (uint64, error)`, `ModPow(base, exp, m int64) (int64, error)` (was `*big.Int`),
  `ModInverse(a, m int64) (int64, error)`, `IsPrime(n int64) bool` (deterministic Miller–Rabin, was
  `big.Int.ProbablyPrime`).
- `RadixSortLSD` takes `[]int64` (negative values supported) instead of `[]uint32`.
- `KMPSearch` and `Levenshtein` operate on Unicode code points (`KMPSearch` returned byte offsets);
  `KMPSearch` returns `[]int{}` instead of `nil` when nothing matches.
- ML functions validate lengths (`DotProduct`, `CosineSimilarity`, `L2Distance` return
  `(float64, error)`); `BatchCosine` returns `[]ScoredIndex{Index, Score}` instead of bare indices.

### Added
- PRNG: `SplitMix64`, `Xoshiro256pp` (`NextFloat`, unbiased `NextInt`), `Pcg32` (`NextBounded`).
- Sort: `Heapsort`, `CountingSort`, comparator variants `TimsortFunc`, `MergesortFunc`, `QuicksortFunc`,
  `HeapsortFunc`.
- Search: `ExponentialSearch`, `FibonacciSearch`, `TernarySearch`.
- Math: `ExtendedGCD`, `CRT`, `NextPrime`, `Sieve`, `SegmentedSieve`, `PollardRho`, `Factorize`,
  `Karatsuba`, `NTT`, `PolyMulNTT`, `MatMul`, `Strassen`.
- String: `DamerauLevenshtein`, `Jaro`, `JaroWinkler`, `AhoCorasick`, `PolynomialHash`.
- Hashes: `MurmurHash3` (x86_32), `XXHash32`, `XXHash64`, `SipHash24`.
- Data structures: `BloomFilter` (`NewBloomFilterWithParams` is portable), `HyperLogLog` (+ `Registers`,
  `Merge`), `DisjointSet`, `FenwickTree`, `SegmentTree`.
- Graph: `BFS`, `DFS`, `Dijkstra`, `AStar`, `BellmanFord`, `FloydWarshall`, `TopologicalSort`, `Kruskal`,
  `Prim`, `TarjanSCC`, `Dinic`, `BipartiteMatching`, `PageRank`.
- ML: `L1Distance`, `JaccardSimilarity`, `Pearson`, `KMeans` (k-means++ seeded by xoshiro256++).
- Geometry: `Cross`, `ConvexHull`, `ClosestPair`, `PointInPolygon`, `Bezier`.
- Compression: `RLEEncode`/`RLEDecode`, `LZ77Compress`/`LZ77Decompress`, `HuffmanEncode`/`HuffmanDecode`.
- Vector runner `go run ./cmd/vectors <file>` (SPEC §4.3 output) and the same check in `go test ./...`.

### Fixed
- `InterpolationSearch` probed with float64 arithmetic; now exact integer division (SPEC §7).
- Float code never contracts `a·b + c` into FMA (explicit `float64(…)` rounding, SPEC §0.2).

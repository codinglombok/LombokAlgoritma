# Changelog — Rust crates (`lombokalgoritma`, `-capi`, `-wasm`)

Maintained by release-please (tags `rust-vX.Y.Z`). See the repository [CHANGELOG](../CHANGELOG.md) for the
full history.

## [0.2.0] — conformance release (SPEC v0.2.0)

The crate now implements `docs/SPEC_LombokAlgoritma_v0.2.0.md` and passes all 92 groups / 1059 cases of
`vectors/lombokalgoritma-vectors-v1.json` with output byte-identical to the TypeScript reference
(`cargo run -q -p lombokalgoritma-vectors -- ../vectors/lombokalgoritma-vectors-v1.json`).

### ⚠ Breaking
- **Cryptography removed** (ADR-016): `math::sha256`, `math::sha256_hex` are gone → `lombokencryptdecrypt`.
- `core::errors::AlgoError` / `AlgoResult` replaced by the crate-wide `lombokalgoritma::Error` (canonical
  codes of SPEC §2 via `Error::code()`, e.g. `"OUT_OF_RANGE"`) and `lombokalgoritma::Result`.
  Fallible functions return `Result` and never panic on invalid input.
- `math`: `gcd(i64, i64) -> u64` (was `u64`; `gcd_u64` keeps the unsigned form), `lcm(i64, i64) -> u128`
  (exact, was `Option<u64>`), `mod_inverse -> Result<i64>` (was `Option`), `mod_pow(i64, i64, i64) ->
  Result<i64>` (negative base normalised; `mod_pow_u64` keeps the unsigned form).
- `sort::radix_sort_lsd` now sorts `i64` (negatives supported); the `u32` version is `radix_sort_lsd_u32`.
- `search::binary_search` follows the normative closed-interval probe order (SPEC §7), so with duplicates
  it may return a different (now portable) index.

### Added
- Crate-wide `Error` (`INVALID_INPUT`, `OUT_OF_RANGE`, `EMPTY_INPUT`, `NEGATIVE_WEIGHT`, `NO_INVERSE`,
  `NOT_COPRIME`, `OVERFLOW`, `OUT_OF_BOUNDS`, `UNSUPPORTED`); `std::error::Error` impl with feature `std`.
- `rng`: `SplitMix64`, `Xoshiro256pp` (`next_float`, unbiased `next_int`), `Pcg32` (`next_bounded`).
- `sort`: `counting_sort`, `mergesort_by`; `search`: `interpolation_search`, `exponential_search`,
  `jump_search`, `fibonacci_search`, `ternary_search` (closure).
- `math`: `extended_gcd`, `crt`, `is_prime`, `next_prime`, `sieve`, `segmented_sieve`, `pollard_rho`,
  `factorize`, `karatsuba`, `ntt`/`intt` (+ `_with`), `poly_mul_ntt`, `mat_mul`, `strassen_mul`.
- `string`: `kmp_search`/`kmp_find`, `levenshtein`, `damerau_levenshtein`, `jaro`, `jaro_winkler`,
  `AhoCorasick`, `polynomial_hash` (all over Unicode code points); hashes `xxhash64`, `siphash24`
  (with FNV-1a 32/64, MurmurHash3, xxHash32 under `string::hash`).
- `datastructure`: `BloomFilter` (`with_params`), `HyperLogLog` (`registers`, `merge`), `DisjointSet`,
  `FenwickTree`, `SegmentTree` (lazy range add / range sum).
- `graph` (one module per algorithm): `bfs`, `dfs`, `dijkstra`, `a_star`, `bellman_ford`, `floyd_warshall`,
  `topological_sort`, `kruskal`, `prim`, `tarjan_scc`, `dinic`, `bipartite_matching`, `page_rank`;
  `core::MinHeap` with total lexicographic keys.
- `ml`: `dot_product`, `l2_norm`, `cosine_similarity`, `l2_distance`, `l1_distance`, `normalize`,
  `jaccard_similarity`, `pearson`, `batch_cosine`, seeded `kmeans` (k-means++).
- `geometry`: `cross`, `convex_hull`, `closest_pair`, `point_in_polygon`, `bezier`.
- `compression`: `rle_encode`/`rle_decode`, `lz77_compress`/`lz77_decompress`,
  `huffman_encode`/`huffman_decode`.
- `no_std`: bit-exact software `sqrt` (and `floor`, fdlibm `ln`) so results do not depend on `std`.
- New workspace member `lombokalgoritma-vectors` (unpublished): zero-dependency JSON parser, canonical
  serializer (SPEC §3) and vector runner; also runs as `cargo test -p lombokalgoritma-vectors`.
- C ABI: `la_hash64` (FNV-1a-64 / xxHash64), `la_is_prime_u64`. WASM: `xxhash64`, `isPrime`.

### Fixed
- `quicksort` degraded to O(n²) time and O(n) recursion depth on inputs with many equal keys (Lomuto
  partition); now three-way partition with the recursion bounded by O(log n).

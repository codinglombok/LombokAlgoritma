# LombokAlgoritma — Folder structure Repository

**Repo:** github.com/codinglombok/LombokAlgoritma
**Versi:** 0.1.1 (Update with Masterplan v2.3)
**Tanggal:** 2026-09-18
**Tier:** Tier 2 — Algorithm Engine

---

## Summary

| File | Status | Keterangan |
|------|--------|-----------|
| `CHANGELOG.md` | FINISH v0.1.1 | Selalu di depan |
| `architecture_repo.md` | FINISH v0.1.1 | ADR + layer map + tier placement v2.3 |
| `masterplan_repo.md` | FINISH v0.1.1 | Roadmap + peran fondasi ekosistem v2.3 |
| `map/struktur_folder_repo.md` | FINISH v0.1.1 | File ini |
| `Saran_masterplan_v2.3.md` | FINISH | Analysis of ecosystem relations |
| `package.json` | FINISH | npm config |
| `Cargo.toml` | FINISH | Rust workspace |
| `pyproject.toml` | FINISH | Python PEP 517 |
| `go.mod` | FINISH | Go module |
| `composer.json` | FINISH | PHP Packagist |
| `pom.xml` | FINISH | Maven Java |
| `Package.swift` | FINISH | Swift PM |

---

## Directory

```
LombokAlgoritma/
│
├── CHANGELOG.md                          ← Change detil
├── architecture_repo.md                  ← ADR & layer architecture (v0.1.1)
├── masterplan_repo.md                    ← Roadmap & ecosystem role (v0.1.1)
├── Saran_masterplan_v2.3.md              ← Ecosystem analysis v2.3
├── map/
│   └── struktur_folder_repo.md          ← File ini (v0.1.1)
│
├── README.md                             ← [TODO] Overview + quick-start 12 bahasa
├── LICENSE                               ← Apache-2.0
├── CONTRIBUTING.md                       ← [TODO] Panduan kontribusi
├── CODE_OF_CONDUCT.md                    ← [TODO] Community standards
├── SECURITY.md                           ← [TODO] Vulnerability reporting
├── Makefile                              ← [TODO] Unified build commands
│
│  ── ROOT CONFIG FILES ────────────────────────────────────────────────
│
├── package.json                          ← npm (TypeScript primary) — FINISH
├── package-lock.json                     ← [TODO] npm lockfile
├── tsconfig.json                         ← [TODO] TypeScript strict config
├── tsconfig.build.json                   ← [TODO] Build-only (excludes tests)
├── eslint.config.js                      ← [TODO] ESLint flat config
├── biome.json                            ← [TODO] Biome formatter + linter
├── vitest.config.ts                      ← [TODO] Vitest unit test config
├── vitest.config.bench.ts                ← [TODO] Vitest benchmark config
│
├── Cargo.toml                            ← Rust workspace root — FINISH
├── Cargo.lock                            ← [TODO] Rust lockfile
├── clippy.toml                           ← [TODO] Rust clippy (deny warnings)
├── rust-toolchain.toml                   ← [TODO] Pinned Rust version
│
├── pyproject.toml                        ← Python PEP 517 — FINISH
├── .python-version                       ← [TODO] Python version pin
│
├── go.mod                                ← Go module — FINISH
├── go.sum                                ← [TODO] Go checksums
├── .golangci.yml                         ← [TODO] Go linter (strict)
│
├── composer.json                         ← PHP Packagist — FINISH
├── phpstan.neon                          ← [TODO] PHPStan level 9
├── phpunit.xml                           ← [TODO] PHPUnit config
│
├── pom.xml                               ← Maven Java — FINISH
│
├── CMakeLists.txt                        ← [TODO] C++ CMake root
├── vcpkg.json                            ← [TODO] vcpkg manifest
│
├── LombokAlgoritma.nuspec                ← [TODO] NuGet package spec
├── LombokAlgoritma.csproj                ← [TODO] C# project file
│
├── Package.swift                         ← Swift Package Manager — FINISH
│
├── build.gradle.kts                      ← [TODO] Kotlin Multiplatform
├── settings.gradle.kts                   ← [TODO] Kotlin settings
│
├── MANIFEST.pl                           ← [TODO] Perl CPAN manifest
├── Makefile.PL                           ← [TODO] Perl module build
│
├── codecov.yml                           ← [TODO] Coverage thresholds (95%+ TS)
├── .editorconfig                         ← [TODO] Cross-editor formatting
├── .gitignore                            ← [TODO] Multi-language gitignore
├── .gitattributes                        ← [TODO] Line endings + binary attrs
│
├── release-please-config.json            ← [TODO] release-please v4
├── .release-please-manifest.json        ← [TODO] Version tracking
│
│
│  ── PRIMARY IMPLEMENTATION ──────────────────────────────────────────
│
├── src/                                  ← TypeScript/JS source (primary)
│   ├── index.ts                          ← [TODO] Main barrel export
│   ├── types.ts                          ← [TODO] Shared type definitions
│   │
│   ├── core/                             ← Layer 1: Core primitives (zero-dep)
│   │   ├── index.ts                      ← [TODO]
│   │   ├── bit.ts                        ← [TODO] Bit manipulation
│   │   ├── safe-int.ts                   ← [TODO] Overflow-checked arithmetic
│   │   ├── memory.ts                     ← [TODO] Arena/slab/stack allocator
│   │   ├── numeric.ts                    ← [TODO] Saturating arithmetic
│   │   ├── rng.ts                        ← [TODO] CSPRNG, xoshiro256++, PCG
│   │   ├── types.ts                      ← [TODO] Comparable, Ordered, Hash
│   │   └── errors.ts                     ← [TODO] AlgoError, OutOfBounds, Overflow
│   │
│   ├── sort/                             ← 16 sorting algorithms
│   │   ├── index.ts                      ← [TODO]
│   │   ├── quicksort.ts                  ← [TODO] Dual-pivot
│   │   ├── mergesort.ts                  ← [TODO] Bottom-up iterative
│   │   ├── heapsort.ts                   ← [TODO] In-place
│   │   ├── timsort.ts                    ← [TODO] Adaptive
│   │   ├── introsort.ts                  ← [TODO] Quicksort + Heapsort fallback
│   │   ├── radix-lsd.ts                  ← [TODO]
│   │   ├── radix-msd.ts                  ← [TODO]
│   │   ├── counting.ts                   ← [TODO]
│   │   ├── bucket.ts                     ← [TODO]
│   │   ├── shell.ts                      ← [TODO] Ciura gap sequence
│   │   ├── comb.ts                       ← [TODO]
│   │   ├── cycle.ts                      ← [TODO] Minimum writes
│   │   ├── pancake.ts                    ← [TODO]
│   │   ├── beadsort.ts                   ← [TODO]
│   │   ├── pigeonhole.ts                 ← [TODO]
│   │   └── cocktail-shaker.ts            ← [TODO]
│   │
│   ├── search/                           ← 12 search algorithms
│   │   ├── index.ts                      ← [TODO]
│   │   ├── binary.ts                     ← [TODO]
│   │   ├── interpolation.ts              ← [TODO]
│   │   ├── exponential.ts                ← [TODO]
│   │   ├── fibonacci.ts                  ← [TODO]
│   │   ├── ternary.ts                    ← [TODO]
│   │   ├── jump.ts                       ← [TODO]
│   │   ├── linear.ts                     ← [TODO]
│   │   ├── meta-binary.ts                ← [TODO]
│   │   ├── sublist.ts                    ← [TODO]
│   │   ├── sentinel-linear.ts            ← [TODO]
│   │   ├── btree-search.ts               ← [TODO]
│   │   └── skip-list.ts                  ← [TODO]
│   │
│   ├── graph/                            ← 22 graph algorithms
│   │   ├── index.ts                      ← [TODO]
│   │   ├── types.ts                      ← [TODO] Graph, Edge, Node interfaces
│   │   ├── dijkstra.ts                   ← [TODO] Fibonacci heap PQ
│   │   ├── astar.ts                      ← [TODO] Pluggable heuristic
│   │   ├── bellman-ford.ts               ← [TODO]
│   │   ├── floyd-warshall.ts             ← [TODO]
│   │   ├── kruskal.ts                    ← [TODO]
│   │   ├── prim.ts                       ← [TODO]
│   │   ├── boruvka.ts                    ← [TODO]
│   │   ├── bfs.ts                        ← [TODO]
│   │   ├── dfs.ts                        ← [TODO]
│   │   ├── topological-kahn.ts           ← [TODO]
│   │   ├── topological-dfs.ts            ← [TODO]
│   │   ├── scc-kosaraju.ts               ← [TODO]
│   │   ├── scc-tarjan.ts                 ← [TODO]
│   │   ├── articulation.ts               ← [TODO]
│   │   ├── bridges.ts                    ← [TODO]
│   │   ├── eulerian.ts                   ← [TODO] Hierholzer
│   │   ├── hamiltonian.ts                ← [TODO]
│   │   ├── max-flow-ford.ts              ← [TODO]
│   │   ├── max-flow-dinic.ts             ← [TODO] O(V²E)
│   │   ├── bipartite-match.ts            ← [TODO] Hopcroft-Karp
│   │   ├── pagerank.ts                   ← [TODO] Power iteration
│   │   └── leiden.ts                     ← [TODO] Community detection 2019
│   │
│   ├── math/                             ← 28 math/number theory/crypto algorithms
│   │   ├── index.ts                      ← [TODO]
│   │   ├── gcd.ts                        ← [TODO]
│   │   ├── modular.ts                    ← [TODO] USED WITH LombokEncryptDecrypt
│   │   ├── miller-rabin.ts               ← [TODO] USED WITH LombokEncryptDecrypt
│   │   ├── sieve.ts                      ← [TODO]
│   │   ├── pollard-rho.ts                ← [TODO]
│   │   ├── crt.ts                        ← [TODO]
│   │   ├── extended-euclidean.ts         ← [TODO]
│   │   ├── matrix.ts                     ← [TODO]
│   │   ├── strassen.ts                   ← [TODO]
│   │   ├── fft.ts                        ← [TODO]
│   │   ├── ntt.ts                        ← [TODO] USED WITH LombokEncryptDecrypt (PQC)
│   │   ├── convolution.ts                ← [TODO]
│   │   ├── karatsuba.ts                  ← [TODO] USED WITH LombokEncryptDecrypt (RSA)
│   │   ├── newton-raphson.ts             ← [TODO]
│   │   ├── bisection.ts                  ← [TODO]
│   │   ├── runge-kutta.ts                ← [TODO]
│   │   ├── integration.ts                ← [TODO]
│   │   ├── simplex.ts                    ← [TODO]
│   │   ├── sha256.ts                     ← [TODO] FIPS 180-4, constant-time
│   │   │                                          USED WITH LombokEncryptDecrypt,
│   │   │                                          LombokSimHash
│   │   ├── sha512.ts                     ← [TODO] FIPS 180-4, constant-time
│   │   ├── blake3.ts                     ← [TODO] constant-time
│   │   ├── argon2id.ts                   ← [TODO] RFC 9106, constant-time
│   │   │                                          USED WITH LombokEncryptDecrypt
│   │   ├── aes-gcm.ts                    ← [TODO] bitsliced, constant-time
│   │   ├── chacha20.ts                   ← [TODO] RFC 8439, constant-time
│   │   ├── x25519.ts                     ← [TODO] RFC 7748, constant-time
│   │   │                                          USED WITH LombokEncryptDecrypt
│   │   └── hkdf.ts                       ← [TODO] RFC 5869
│   │                                              USED WITH LombokEncryptDecrypt
│   │
│   ├── string/                           ← 18 string algorithms
│   │   ├── index.ts                      ← [TODO]
│   │   ├── kmp.ts                        ← [TODO]
│   │   ├── boyer-moore.ts                ← [TODO]
│   │   ├── rabin-karp.ts                 ← [TODO]
│   │   ├── z-algorithm.ts                ← [TODO]
│   │   ├── aho-corasick.ts               ← [TODO]
│   │   ├── suffix-array.ts               ← [TODO] SA-IS O(n)
│   │   ├── suffix-automaton.ts           ← [TODO]
│   │   ├── levenshtein.ts                ← [TODO]
│   │   ├── damerau-levenshtein.ts        ← [TODO]
│   │   ├── jaro-winkler.ts               ← [TODO]
│   │   ├── lcs.ts                        ← [TODO]
│   │   ├── manacher.ts                   ← [TODO] O(n) palindrome
│   │   ├── string-hash.ts                ← [TODO] Polynomial, Rabin rolling
│   │   │                                  v0.2.0: +FNV-1a, MurmurHash3, xxHash
│   │   │                                          USED WITH LombokSimHash (v0.2.0)
│   │   ├── trie.ts                       ← [TODO] Patricia trie
│   │   ├── dawg.ts                       ← [TODO]
│   │   ├── regex-nfa.ts                  ← [TODO] NFA-based, no backtracking
│   │   ├── fuzzy-match.ts                ← [TODO] Bitap algorithm
│   │   ├── phonetic.ts                   ← [TODO] Soundex, Metaphone
│   │   └── shingle.ts                    ← [TODO v0.2.0] N-gram shingling
│   │                                              USED WITH LombokSimHash (v0.2.0)
│   │
│   ├── compression/                      ← 8 compression algorithms
│   │   ├── index.ts, lz77.ts, lz78.ts   ← [TODO]
│   │   ├── lzw.ts, huffman.ts            ← [TODO]
│   │   ├── arithmetic.ts, bwt.ts         ← [TODO]
│   │   ├── deflate.ts, rle.ts            ← [TODO]
│   │
│   ├── datastructure/                    ← 24 data structures
│   │   ├── index.ts
│   │   ├── avl-tree.ts, red-black-tree.ts ← [TODO]
│   │   ├── btree.ts, bplus-tree.ts        ← [TODO]
│   │   ├── splay-tree.ts, treap.ts        ← [TODO]
│   │   ├── skip-list.ts                   ← [TODO]
│   │   ├── fibonacci-heap.ts              ← [TODO] O(1) decrease-key
│   │   ├── veb-tree.ts                    ← [TODO] van Emde Boas
│   │   ├── segment-tree.ts                ← [TODO] Lazy propagation
│   │   ├── fenwick-tree.ts                ← [TODO] BIT
│   │   ├── disjoint-set.ts                ← [TODO]
│   │   ├── trie.ts, suffix-tree.ts        ← [TODO]
│   │   ├── hash-map.ts                    ← [TODO] Robin Hood hashing
│   │   ├── bloom-filter.ts                ← [TODO] USED WITH LombokSimHash
│   │   ├── count-min-sketch.ts            ← [TODO]
│   │   ├── hyperloglog.ts                 ← [TODO] USED WITH LombokSimHash
│   │   ├── lsm-tree.ts                    ← [TODO]
│   │   ├── rope.ts                        ← [TODO]
│   │   ├── deque.ts                       ← [TODO] Lock-free
│   │   ├── priority-queue.ts              ← [TODO] d-ary heap
│   │   ├── interval-tree.ts               ← [TODO]
│   │   ├── kd-tree.ts                     ← [TODO]
│   │   ├── minhash.ts                     ← [TODO v0.2.0] USED WITH LombokSimHash
│   │   ├── lsh.ts                         ← [TODO v0.2.0] USED WITH LombokSimHash
│   │   ├── simhash.ts                     ← [TODO v0.2.0] USED WITH LombokSimHash
│   │   └── hnsw.ts                        ← [TODO v0.2.0] USED WITH LombokHNSW
│   │
│   ├── geometry/                          ← 14 algorithms [TODO All]
│   ├── ml/                                ← 10 algorithms
│   │   ├── index.ts
│   │   ├── kmeans.ts, kmedoids.ts         ← [TODO]
│   │   ├── dbscan.ts                      ← [TODO]
│   │   ├── linear-regression.ts           ← [TODO]
│   │   ├── logistic-regression.ts         ← [TODO]
│   │   ├── decision-tree.ts               ← [TODO]
│   │   ├── random-forest.ts               ← [TODO]
│   │   ├── pca.ts                         ← [TODO] Power iteration SVD
│   │   ├── distance.ts                    ← [TODO] USED WITH LombokVector
│   │   ├── similarity.ts                  ← [TODO] Cosine SIMD USED WITH LombokVector
│   │   └── ranking.ts                     ← [TODO v0.2.0] BM25 USED WITH LombokBM25
│   │
│   ├── concurrent/                        ← 8 patterns [TODO All]
│   └── hardware/                          ← Hardware-aware utilities
│       ├── index.ts
│       ├── simd-detect.ts                 ← [TODO] USED WITH LombokVector
│       ├── popcount.ts                    ← [TODO]
│       ├── bitmanip.ts                    ← [TODO]
│       ├── cache.ts                       ← [TODO]
│       ├── memory-pool.ts                 ← [TODO]
│       ├── simd-vec.ts                    ← [TODO v0.2.0] Batch SIMD ops
│       │                                            USED WITH LombokVector
│       └── wasm-simd.ts                   ← [TODO] WASM SIMD128 bindings
│
│
│  ── PORTS ───────────────────────────────────────────────────────────
│
├── ports/
│   ├── rust/                              ← Rust: SIMD + no_std + FFI + WASM
│   │   ├── src/{core,sort,search,graph,math,string,compression,
│   │   │        datastructure,geometry,ml,concurrent,hardware}/
│   │   ├── capi/lib.rs                    ← C ABI exports (#[no_mangle])
│   │   ├── wasm/lib.rs                    ← wasm-bindgen WASM target
│   │   ├── embedded/lib.rs                ← no_std (Cortex-M, RISC-V)
│   │   └── tests/{vectors/, integration/}
│   │
│   ├── python/                            ← Python 3.10+
│   │   ├── pyproject.toml
│   │   ├── lombokalgoritma/{sort,search,graph,math,string,
│   │   │                    compression,datastructure,geometry,
│   │   │                    ml,concurrent,crypto}.py
│   │   └── tests/
│   │
│   ├── go/                                ← Go 1.21+ (generics)
│   │   ├── go.mod
│   │   ├── lombokalgoritma/{sort,search,graph,math,string,...}.go
│   │   └── tests/
│   │
│   ├── php/                               ← PHP 8.2+ PSR-4
│   │   ├── composer.json, phpstan.neon
│   │   ├── src/LombokAlgoritma/{Sort,Search,Graph,Math,...}/
│   │   └── tests/
│   │
│   ├── java/                              ← Java 17+ Maven
│   │   ├── pom.xml
│   │   ├── src/main/java/com/codinglombok/lombokalgoritma/
│   │   └── src/test/
│   │
│   ├── cpp/                               ← C++20 header-only
│   │   ├── CMakeLists.txt, vcpkg.json
│   │   ├── include/lombokalgoritma/{sort,search,graph,math,...}.hpp
│   │   └── tests/
│   │
│   ├── perl/                              ← Perl 5.36+ CPAN
│   │   ├── Makefile.PL, MANIFEST
│   │   └── lib/LombokAlgoritma/{Sort,Search,Graph,Math,String,Crypto}.pm
│   │
│   ├── ts/                                ← Pure TypeScript (Deno/Bun/browser)
│   │   ├── deno.json, jsr.json
│   │   └── src/mod.ts
│   │
│   ├── sql/                               ← Pure SQL (PG/MySQL/SQLite)
│   │   ├── postgresql/{sort,search,graph,math,string,ml}.sql
│   │   ├── mysql/*.sql
│   │   └── sqlite/*.sql
│   │
│   ├── swift/                             ← Swift 5.9+ iOS/macOS
│   │   ├── Package.swift
│   │   └── Sources/LombokAlgoritma/{Sort,Search,...}.swift
│   │
│   ├── kotlin/                            ← Kotlin 1.9 Multiplatform
│   │   ├── build.gradle.kts
│   │   └── src/{commonMain,jvmMain,nativeMain,wasmMain}/kotlin/
│   │
│   └── csharp/                            ← C# .NET 8+ NuGet
│       ├── LombokAlgoritma.csproj
│       └── src/{Sort,Search,Graph,Math,...}/
│
│
│  ── TESTS ───────────────────────────────────────────────────────────
│
├── tests/
│   ├── vectors/                           ← JSON test vectors (cross-language)
│   │   ├── sort/{quicksort,mergesort,timsort,...}.json   (16 files)
│   │   ├── search/{binary,interpolation,...}.json         (12 files)
│   │   ├── graph/{dijkstra,astar,leiden,...}.json         (22 files)
│   │   ├── math/{sha256,sha512,blake3,ntt,...}.json       (28 files, NIST KAT)
│   │   ├── string/{kmp,aho-corasick,...}.json             (18 files)
│   │   ├── compression/{lz77,huffman,...}.json             (8 files)
│   │   ├── datastructure/{bloom,hyperloglog,...}.json     (24 files)
│   │   ├── geometry/{convex-hull,gjk,...}.json            (14 files)
│   │   ├── ml/{kmeans,dbscan,cosine,...}.json             (10 files)
│   │   └── crypto/{sha256-nist,aes-nist,...}.json        (NIST CAVP KAT)
│   │
│   ├── core/                              ← TypeScript unit tests
│   │   ├── sort.test.ts, search.test.ts, graph.test.ts
│   │   ├── math.test.ts, string.test.ts, compression.test.ts
│   │   ├── datastructure.test.ts, geometry.test.ts
│   │   ├── ml.test.ts, concurrent.test.ts, crypto.test.ts
│   │   └── hardware.test.ts
│   │
│   ├── fuzz/                              ← Fuzz test harnesses
│   │   ├── rust/{fuzz_sort,fuzz_string_parsers,
│   │   │         fuzz_compression,fuzz_crypto,fuzz_graph}.rs
│   │   ├── go/
│   │   └── cpp/ (AFL++ harnesses)
│   │
│   ├── bench/                             ← Performance benchmarks
│   │   ├── sort.bench.ts, graph.bench.ts, string.bench.ts
│   │   ├── ml.bench.ts, crypto.bench.ts
│   │   └── rust/benches/ (criterion.rs)
│   │
│   └── security/
│       ├── constant-time/                 ← dudect tests untuk crypto
│       ├── overflow/                      ← Integer overflow edge cases
│       └── adversarial/                   ← O(n²) worst-case trigger tests
│
│
│  ── DOCS ────────────────────────────────────────────────────────────
│
├── docs/
│   ├── api/{sort,search,graph,math,string,compression,
│   │        datastructure,geometry,ml,concurrent,crypto,hardware}.md
│   │
│   ├── guides/
│   │   ├── getting-started.md            ← 5-minute quick start
│   │   ├── porting-guide.md              ← Add new language port
│   │   ├── test-vector-guide.md          ← Write & validate test vectors
│   │   ├── embedded-guide.md             ← Rust no_std / MCU deployment
│   │   ├── wasm-guide.md                 ← Browser WASM bundle usage
│   │   ├── crypto-guide.md               ← Crypto primitives usage
│   │   ├── simd-guide.md                 ← SIMD optimization guide
│   │   ├── ecc-integration.md            ← LombokECC verified output API
│   │   ├── security-audit.md             ← Security audit report
│   │   ├── encryptdecrypt-integration.md ← Guide For LombokEncryptDecrypt
│   │   ├── vector-integration.md         ← Guide For LombokVector
│   │   └── simhash-integration.md        ← Guide For LombokSimHash
│   │
│   └── examples/
│       ├── sort-examples/
│       ├── graph-examples/               ← Dijkstra, A*, Leiden worked examples
│       ├── crypto-examples/              ← SHA-256, AES-GCM, ChaCha20, Argon2id
│       ├── ml-examples/                  ← k-means, DBSCAN, cosine similarity
│       └── wasm-browser-demo/            ← Browser WASM demo
│
│
│  ── SCRIPTS ─────────────────────────────────────────────────────────
│
├── scripts/
│   ├── generate_vectors.ts               ← Generate JSON vectors dari TS
│   ├── validate_vectors.sh               ← Cross-language vector validation
│   ├── bench_compare.sh                  ← Compare benchmarks vs baseline
│   ├── dudect_verify.sh                  ← Constant-time verification
│   ├── publish_all.sh                    ← Publish to All 11 registries
│   ├── build_wasm.sh                     ← WASM bundle dari Rust
│   └── check_deps.sh                     ← Audit All language deps
│
│
│  ── GITHUB ──────────────────────────────────────────────────────────
│
└── .github/
    ├── workflows/
    │   ├── ci.yml                        ← Main CI (All bahasa)
    │   ├── security.yml                  ← Security audit (CodeQL + OWASP)
    │   ├── fuzz.yml                      ← Fuzz testing (10min per CI)
    │   ├── bench.yml                     ← Benchmark regression (>10% = fail)
    │   ├── publish.yml                   ← Publish to 11 registries (tag v*)
    │   ├── release-please.yml            ← Automated CHANGELOG + release
    │   └── codeql.yml                    ← GitHub CodeQL analysis
    │
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.yml
    │   ├── algorithm_request.yml
    │   ├── port_request.yml
    │   └── security_report.yml
    │
    ├── PULL_REQUEST_TEMPLATE.md
    ├── CODEOWNERS
    └── dependabot.yml
```

---

## Naming Conventions

| Platform | Konvensi | Package |
|----------|----------|---------|
| GitHub | PascalCase | `LombokAlgoritma` |
| npm | lowercase | `lombokalgoritma` |
| PyPI | lowercase | `lombokalgoritma` |
| Packagist | vendor/package | `codinglombok/lombokalgoritma` |
| crates.io | snake_case | `lombokalgoritma` |
| Go | github path | `github.com/codinglombok/lombokalgoritma` |
| Maven | groupId:artifactId | `com.codinglombok:lombokalgoritma` |
| NuGet | Namespace.Name | `CodingLombok.LombokAlgoritma` |
| CPAN | Module::Name | `LombokAlgoritma` |
| Swift PM | PascalCase | `LombokAlgoritma` |
| JSR (Deno) | @scope/name | `@codinglombok/lombokalgoritma` |
| vcpkg | lowercase | `lombokalgoritma` |

---

## File Count Estimasi

| Komponen | File |
|----------|------|
| TypeScript src/ | ~140 files (incl. v0.2.0 additions) |
| Rust ports/ | ~95 files |
| Python port | ~25 files |
| Go port | ~25 files |
| PHP port | ~40 files |
| Java port | ~25 files |
| C++ port | ~20 files |
| Perl port | ~10 files |
| SQL port | ~20 files |
| Swift port | ~15 files |
| Kotlin port | ~25 files |
| C# port | ~25 files |
| Test vectors JSON | ~160 files |
| TypeScript tests | ~15 files |
| Fuzz harnesses | ~15 files |
| Benchmarks | ~15 files |
| GitHub workflows | 7 files |
| Config files | ~35 files |
| Documentation | ~30 files |
| **TOTAL** | **~750+ files** |

---

*Folder structure LombokAlgoritma v0.1.1 — 2026-09-18*
*Update with Masterplan v2.3*
*Author: @codinglombok — License: Apache-2.0*

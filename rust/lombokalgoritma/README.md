# lombokalgoritma (Rust)

Rust port of [LombokAlgoritma](https://github.com/codinglombok/LombokAlgoritma) — deterministic,
zero-dependency algorithms whose results are byte-identical to every other port
(`docs/SPEC_LombokAlgoritma_v0.2.0.md`, shared vectors in `vectors/`).
`#![no_std]` + `alloc`; the `std` feature is enabled by default (results are identical without it).

```toml
[dependencies]
lombokalgoritma = "0.2"                                             # std
lombokalgoritma = { version = "0.2", default-features = false }     # no_std + alloc
```

```rust
use lombokalgoritma::{graph::{dijkstra, Graph}, math::mod_pow, Error};

let g = Graph::from_triples(3, &[(0, 1, 1.0), (1, 2, 2.0), (0, 2, 5.0)]);
assert_eq!(dijkstra(&g, 0)?, vec![0.0, 1.0, 3.0]);
assert_eq!(mod_pow(2, -1, 5), Err(Error::OutOfRange));
assert_eq!(Error::OutOfRange.code(), "OUT_OF_RANGE");
# Ok::<(), Error>(())
```

| Module | Algorithms |
|---|---|
| `sort` | quicksort, timsort, mergesort, heapsort, radix LSD, counting sort |
| `search` | binary, lower/upper bound, interpolation, exponential, jump, Fibonacci, linear, ternary |
| `math` | gcd, lcm, extended gcd, modular inverse, mod pow, CRT, Miller–Rabin, next prime, sieve, segmented sieve, Pollard rho / factorize, Karatsuba, NTT, polynomial multiply, matrix multiply, Strassen |
| `string` | KMP, Levenshtein, Damerau–Levenshtein, Jaro, Jaro–Winkler, Aho–Corasick, polynomial hash; FNV-1a 32/64, MurmurHash3, xxHash32/64, SipHash-2-4 |
| `datastructure` | Bloom filter, HyperLogLog, disjoint set, Fenwick tree, lazy segment tree |
| `graph` | BFS, DFS, Dijkstra, A*, Bellman–Ford, Floyd–Warshall, topological sort, Kruskal, Prim, Tarjan SCC, Dinic, Hopcroft–Karp, PageRank |
| `ml` | dot, L2 norm, cosine, L1/L2 distance, normalize, Jaccard, Pearson, batch cosine, k-means++ |
| `geometry` | cross product, convex hull, closest pair, point in polygon, Bézier |
| `compression` | RLE, LZ77, Huffman |
| `rng` | SplitMix64, xoshiro256++, PCG32 |

Cryptography was removed in 0.2.0 (use `lombokencryptdecrypt`). Errors carry the canonical codes of
SPEC §2 (`Error::code()`).

License: Apache-2.0 OR MIT.

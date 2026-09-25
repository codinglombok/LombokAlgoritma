# lombokalgoritma (Python)

Pure-Python 3.10+ port of [LombokAlgoritma](https://github.com/codinglombok/LombokAlgoritma) —
deterministic algorithms with **zero runtime dependencies** (stdlib only). Conforms to
SPEC v0.2.0: all 1059 shared vectors pass, byte-identical to the TypeScript reference.

```bash
pip install lombokalgoritma          # from PyPI
pip install -e "python[dev]"         # from a repo checkout
```

```python
from lombokalgoritma import quicksort, binary_search, levenshtein
from lombokalgoritma.hash import xxhash64, siphash24
from lombokalgoritma.graph import Graph, dijkstra
from lombokalgoritma.errors import AlgoError

quicksort([3, 1, 2])                              # [1, 2, 3]
binary_search([1, 3, 5], 5)                       # 2
levenshtein("kitten", "sitting")                  # 3
f"{xxhash64(b'abc'):016x}"                        # '44bc2cf5ad770999'
dijkstra(Graph(3, [(0, 1, 2.0), (1, 2, 3.0)]), 0) # [0, 2.0, 5.0]
try:
    dijkstra(Graph(2, [(0, 1, -1.0)]), 0)
except AlgoError as e:
    e.code                                        # 'NEGATIVE_WEIGHT'
```

## API summary

| Module | Contents |
|---|---|
| `sort` | `quicksort`, `timsort`, `mergesort` (stable, `key=`), `heapsort`, `radix_sort_lsd`, `counting_sort`, `sort_with` |
| `search` | `binary_search`, `lower_bound`, `upper_bound`, `interpolation_search`, `exponential_search`, `jump_search`, `fibonacci_search`, `linear_search`, `ternary_search` |
| `math` | `gcd`, `lcm`, `extended_gcd`, `mod_inverse`, `mod_pow`, `crt`, `is_prime`, `next_prime`, `sieve`, `segmented_sieve`, `factorize`, `pollard_rho`, `karatsuba`, `ntt`, `intt`, `poly_mul_ntt`, `mat_mul`, `strassen_mul` |
| `string` | `kmp_search`, `levenshtein`, `damerau_levenshtein`, `jaro`, `jaro_winkler`, `AhoCorasick`, `polynomial_hash` (all over code points) |
| `hash` | `fnv1a32`, `fnv1a64`, `murmur3_32`, `xxhash32`, `xxhash64`, `siphash24`, `fmix32` |
| `rng` | `SplitMix64`, `Xoshiro256pp` (`next`, `next_float`, `next_int`), `Pcg32` (`next`, `next_bounded`, `next_float`) |
| `datastructure` | `BloomFilter` (`with_params(m, k)`), `HyperLogLog` (`registers`, `merge`), `DisjointSet`, `FenwickTree`, `SegmentTree` |
| `graph` | `bfs`, `dfs`, `dijkstra`, `a_star`, `bellman_ford`, `floyd_warshall`, `topological_sort`, `kruskal`, `prim`, `tarjan_scc`, `dinic`, `bipartite_matching`, `pagerank` |
| `ml` | `dot_product`, `l2_norm`, `cosine_similarity`, `l2_distance`, `l1_distance`, `normalize`, `jaccard_similarity`, `pearson`, `batch_cosine`, `kmeans` (seeded xoshiro256++) |
| `geometry` | `cross`, `convex_hull`, `closest_pair`, `point_in_polygon`, `bezier` |
| `compression` | `rle_encode`/`rle_decode`, `lz77_compress`/`lz77_decompress`, `huffman_encode`/`huffman_decode` |

Invalid input raises `lombokalgoritma.errors.AlgoError` (a `ValueError` subclass) whose `code` is
one of the canonical SPEC §2 codes (`INVALID_INPUT`, `OUT_OF_RANGE`, `EMPTY_INPUT`,
`NEGATIVE_WEIGHT`, `NO_INVERSE`, `NOT_COPRIME`, …).

## Conformance & development

```bash
# from the repo root
PYTHONPATH=python python -m lombokalgoritma._vectors vectors/lombokalgoritma-vectors-v1.json > out/python.txt
cmp out/typescript.txt out/python.txt

cd python && ruff check . && ruff format --check . && mypy && pytest   # coverage gate: 90 %
```

## Breaking changes in 0.2.0

- **Cryptography removed**: `sha256`, `sha256_hex`, `hmac_sha256` and `hkdf` are gone (they were
  deprecated in 0.1.1) — use [`lombokencryptdecrypt`](https://github.com/codinglombok/LombokEncryptDecrypt)
  (ADR-016). SipHash-2-4 remains as a hash-table PRF, not a MAC.
- Non-cryptographic hashes moved to `lombokalgoritma.hash` (still re-exported from `string`).
- Errors are `AlgoError` with a canonical `code`; `mod_inverse` raises `NO_INVERSE` instead of
  returning `None`.
- `BloomFilter` uses `h2 = MurmurHash3(item, 0x9747b28c)` (SPEC §8.1); `kmeans` uses the normative
  xoshiro256++ k-means++ seeding (keyword-only `max_iter`, `tol`, `seed`).

License: Apache-2.0 OR MIT.

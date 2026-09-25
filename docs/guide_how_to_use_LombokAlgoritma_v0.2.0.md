# LombokAlgoritma — Guide How to Use v0.2.0

## 1. Instalasi

| Bahasa | Perintah |
|---|---|
| TypeScript/JS | `npm install lombokalgoritma` |
| Rust | `cargo add lombokalgoritma` (embedded: `default-features = false`) |
| Go | `go get github.com/codinglombok/lombokalgoritma/go@v0.2.0` |
| Python | `pip install lombokalgoritma` |
| PHP | `composer require codinglombok/lombokalgoritma` (ext-gmp, ext-mbstring) |

## 2. Graf (contoh yang sama di 5 bahasa)

```ts
import { dijkstra, tarjanScc, AlgoError } from 'lombokalgoritma';
const g = { nodes: 3, edges: [{ from: 0, to: 1, weight: 1 }, { from: 1, to: 2, weight: 2 }, { from: 2, to: 0, weight: 1 }] };
dijkstra(g, 0);   // [0, 1, 3]
tarjanScc(g);     // [[0, 1, 2]]
try { dijkstra({ nodes: 2, edges: [{ from: 0, to: 1, weight: -1 }] }, 0); }
catch (e) { if (e instanceof AlgoError) console.log(e.code); } // NEGATIVE_WEIGHT
```

```rust
use lombokalgoritma::graph::{dijkstra, Graph};
let g = Graph::from_triples(3, &[(0, 1, 1.0), (1, 2, 2.0), (2, 0, 1.0)]);
assert_eq!(dijkstra(&g, 0)?, vec![0.0, 1.0, 3.0]);
```

```go
d, err := la.Dijkstra(g, 0) // err.(*la.Error).Code == la.CodeNegativeWeight untuk bobot negatif
```

```python
from lombokalgoritma import graph
graph.dijkstra(g, 0)
```

```php
use LombokAlgoritma\Graph\Dijkstra;
Dijkstra::distances($graph, 0);
```

## 3. Resep

| Kebutuhan | Pakai |
|---|---|
| Deduplikasi cepat | `BloomFilter.withParams(m, k)` (portabel lintas bahasa) |
| Kardinalitas jutaan item | `HyperLogLog(14)` (σ ≈ 0,8 %) |
| Hash tabel tahan DoS | `sipHash24(key16, data)` |
| Fingerprint cepat | `xxHash64` / `fnv1a64` |
| Klaster reproducible | `kmeans(points, k, { seed })` — hasil sama di 5 bahasa |
| Komponen kuat / aliran maksimum | `tarjanScc` / `dinic` |
| Hashing kriptografis | **bukan di sini** → `lombokencryptdecrypt` |

## 4. Kesalahan umum

- Mengharapkan indeks UTF-16 dari `kmpSearch`: sejak 0.2.0 indeks berupa code point.
- Menangkap `RangeError`: sejak 0.2.0 tangkap `AlgoError` dan periksa `code`.
- `BloomFilter(n, p)` memberi m/k yang bisa berbeda 1 antar bahasa (memakai `ln`); untuk berbagi filter antar
  layanan gunakan `withParams`.

*Lisensi dokumen: Apache-2.0 OR MIT · © codinglombok*

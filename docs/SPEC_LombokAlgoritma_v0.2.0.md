# LombokAlgoritma — Behavioral Specification v0.2.0

> This document is the normative cross-language contract. Every language port MUST produce byte-identical output for all specified inputs. Deviations from this specification are bugs.

| Atribut | Nilai |
|---|---|
| Versi spesifikasi | 0.2.0 (pertama; v0.1.x tidak memiliki SPEC) |
| Tanggal | 2026-09-25 |
| Repo | [codinglombok/LombokAlgoritma](https://github.com/codinglombok/LombokAlgoritma) · cluster 00.02 · L0 |
| Berkas vector | `vectors/lombokalgoritma-vectors-v1.json` — SHA-256 `52f0df2417a11dd7b9d395947c09a68c03917cca7f843f63e1a9f7cf4d697e34` (juga di `vectors/SHA256SUMS`, diperiksa CI) |
| Port wajib sesuai | TypeScript (referensi), Rust, Python, Go, PHP |
| Port lain | Java, Kotlin, C#, C++, Swift, Perl, SQL — **informatif**; belum wajib lulus vector |
| Lisensi | Apache-2.0 OR MIT |
| Dokumen terkait | [API_](API_LombokAlgoritma_v0.2.0.md) · [Lang_](Lang_LombokAlgoritma_v0.2.0.md) · [architecture_](architecture_LombokAlgoritma_v0.2.0.md) |

Kata kunci **MUST**, **MUST NOT**, **SHOULD**, **MAY** mengikuti RFC 2119/RFC 8174. Rujukan pseudo-kode memakai
indeks berbasis 0, `⌊x⌋` = floor, `a mod m` = sisa non-negatif kecuali disebut "sisa terpotong".

---

## 0. Konvensi umum

1. **Bilangan bulat.** Algoritma bilangan bulat MUST eksak. Port MUST mendukung setidaknya rentang i64/u64 untuk
   semua masukan di vector; hasil antara yang melebihi 64 bit (mis. `a·b mod m`) MUST dihitung dengan lebar 128 bit
   atau bigint.
2. **Floating point.** Semua float adalah IEEE 754 binary64 dengan pembulatan *round-to-nearest-even*. Operasi
   `+ − × ÷ √` MUST dievaluasi **satu per satu dalam urutan yang ditulis di SPEC** — tanpa FMA, tanpa penataan ulang
   penjumlahan, tanpa presisi diperluas (x87) dan tanpa SIMD yang mengubah urutan. Penjumlahan Σ berjalan dari indeks
   terkecil ke terbesar dimulai dari `0`. Fungsi transendental (`ln`, `exp`, `sin`, `cos`, `hypot`, `pow` non-integer)
   **tidak normatif** di tingkat bit dan hanya dipakai di §8.2 (dibulatkan ke bilangan bulat) dan fungsi yang
   ditandai *TS-only*.
3. **String** adalah urutan *Unicode code point* (bukan UTF-16 code unit, bukan byte). Panjang, indeks dan offset
   yang dikembalikan fungsi string MUST berupa offset code point. Hash atas string memakai encoding **UTF-8** tanpa
   normalisasi Unicode.
4. **Byte** di vector ditulis hex huruf kecil tanpa pemisah.
5. **Urutan edge.** Graf adalah daftar edge berurutan; seluruh traversal didefinisikan terhadap urutan tersebut (§9.0).
6. **Keacakan.** Algoritma yang memakai bilangan acak (k-means++) MUST menerima seed dan memakai generator §5. Hasil
   untuk seed yang sama MUST identik di semua port. `quicksort` MAY mengacak urutan internal karena hasil
   pengurutan bilangan tidak bergantung pada pivot.
7. **Error** dilaporkan dengan kode kanonik §2. Port MUST NOT mengembalikan hasil sebagian bersama error.

## 1. Kesesuaian (conformance)

Sebuah port **sesuai** SPEC v0.2.0 bila, untuk berkas vector §4:

1. setiap kelompok (group) dikenali — kelompok yang tidak dikenali adalah kegagalan;
2. untuk setiap kasus, `canonical(actual)` (§3) **byte-identik** dengan `canonical(expected)`;
3. keluaran runner (§4.3) byte-identik dengan keluaran runner TypeScript.

CI menjalankan runner kelima port dan membandingkan keluarannya dengan `cmp` (job `vectors-crosscheck`).

## 2. Kode error kanonik

Nilai string MUST identik di semua port: TS `AlgoError.code`, Rust `Error::code()`, Python `AlgoError.code`,
Go `(*Error).Code`, PHP `AlgoException::getErrorCode()`. Di vector, kasus error ditulis `{"error":"<KODE>"}`.

| Kode | Makna | Contoh |
|---|---|---|
| `INVALID_INPUT` | bentuk masukan salah: panjang/ukuran tidak cocok, stream terkompresi rusak, ukuran kunci salah | `dot([1,2],[1])`, `rleDecode("03")`, SipHash key ≠ 16 byte, `source = sink` pada Dinic |
| `OUT_OF_RANGE` | parameter atau elemen di luar rentang | node di luar `[0, n)`, `window ∉ [1,255]`, Bloom `m = 0`, k-means `k > n`, `countingSort` negatif, `modPow` dengan `exp < 0` |
| `EMPTY_INPUT` | elemen terlalu sedikit | `closestPair` < 2 titik, `bezier` tanpa titik, `kmeans` tanpa titik |
| `NEGATIVE_WEIGHT` | bobot/kapasitas negatif pada algoritma yang mensyaratkan ≥ 0 | Dijkstra, A*, Dinic |
| `NO_INVERSE` | invers modular tidak ada (gcd ≠ 1) | `modInverse(6, 9)` |
| `NOT_COPRIME` | modulus CRT tidak saling prima | `crt([1,1],[4,6])` |
| `OVERFLOW` | overflow pada operasi aritmetika yang diperiksa | `addI32` (TS core) |
| `OUT_OF_BOUNDS` | indeks di luar wadah | (TS core) |
| `UNSUPPORTED` | fitur platform tidak tersedia | `randomBytes` tanpa Web Crypto |

Urutan validasi (bila beberapa kondisi salah sekaligus) mengikuti urutan di definisi masing-masing algoritma.

## 3. JSON kanonik & format angka

`canonical(v)` menghasilkan UTF-8 tanpa spasi tak bermakna:

| Nilai | Serialisasi |
|---|---|
| `null` · boolean | `null` · `true` / `false` |
| angka berhingga | §3.2 |
| NaN · +∞ · −∞ | **string** JSON `"NaN"` · `"Infinity"` · `"-Infinity"` |
| string | tanda kutip; escape `\"` `\\` `\b` `\f` `\n` `\r` `\t`, kontrol lain U+0000–U+001F sebagai `\u00xx` (hex huruf kecil); karakter lain (termasuk non-ASCII, U+2028/U+2029, `<>&`) **mentah** UTF-8 |
| array | `[` elemen dipisah `,` `]` |
| objek | kunci diurutkan menaik per code unit (semua kunci ASCII); `{"k":v,…}` |

### 3.1 Bilangan bulat besar & 64-bit

- Bilangan bulat dengan `|v| ≤ 2⁵³ − 1` ditulis sebagai angka JSON; di luar itu sebagai **string desimal**
  (`"9223372036854775807"`). Masukan vector memakai aturan yang sama; port MUST menerima keduanya.
- Keluaran hash/generator 64-bit (`fnv1a64`, `xxhash64`, `siphash24`, `splitmix64`, `xoshiro256pp`) ditulis sebagai
  **16 digit hex huruf kecil** (string).
- Seed u64 di masukan ditulis sebagai string desimal.

### 3.2 Angka floating point (normatif)

Angka berhingga `x` diformat persis seperti ECMAScript `Number::toString(x)` (ECMA-262 §6.1.6.1.20), dengan satu
pengecualian: **−0 ditulis `-0`** (bukan `0`). Algoritma:

1. `x = 0` → `0`, atau `-0` untuk −0. `x < 0` → `-` + format(−x).
2. Ambil representasi desimal **terpendek yang round-trip**: digit `d₁…d_k` (tanpa nol di akhir) dan eksponen `n`
   sehingga `x = 0.d₁…d_k × 10ⁿ`, `k` minimal; bila ada beberapa kandidat terpendek, pilih yang paling dekat dengan `x`
   (Ryu / Grisu-exact / `repr` Python / `strconv.FormatFloat(x,'e',-1,64)` / `{:e}` Rust / `serialize_precision=-1` PHP
   semuanya memberi digit yang sama).
3. Bila `k ≤ n ≤ 21`: digit diikuti `n − k` nol (`100`, `1e21` → lihat 5).
4. Bila `0 < n ≤ 21`: `d₁…d_n . d_{n+1}…d_k` (`1234.5678`).
5. Bila `−6 < n ≤ 0`: `0.` + `−n` nol + digit (`0.000001234`).
6. Selain itu, notasi eksponen: `d₁` [`.` `d₂…d_k`] `e` tanda (`+`/`-`) `|n − 1|` — contoh `1e+21`, `1.5e-7`,
   `5e-324`.

Contoh wajib (kelompok `canon.number`): `0.1`, `0.30000000000000004`, `100000000000000000000`, `1e+21`, `1e-7`,
`1.23e-18`, `5e-324`, `1.7976931348623157e+308`, `9007199254740992`, `-0`, `"NaN"`.

Bilangan bulat yang dihitung sebagai float (mis. `inertia = 2`) diformat dengan aturan yang sama (`2`, bukan `2.0`),
sehingga angka bulat dan float tidak dibedakan di keluaran.

## 4. Berkas vector & protokol runner

### 4.1 Struktur

```json
{
"format":"lombokalgoritma-vectors",
"version":1,
"library_version":"0.2.0",
"spec":"docs/SPEC_LombokAlgoritma_v0.2.0.md",
"groups":{
"<modul>.<algoritma>":[
{"id":"001","input":{…},"expected":…},
…]}}
```

- Satu kelompok per algoritma deterministik; nama kelompok diurutkan menaik; `id` unik di dalam kelompok.
- `input` dan `expected` ditulis dalam JSON kanonik (§3), satu kasus per baris.
- Untuk algoritma probabilistik (k-means++, Bloom, HyperLogLog, PRNG) masukan memuat **seed / parameter** dan
  `expected` adalah keluaran persis untuk seed tersebut.
- Berkas dihasilkan oleh `typescript/scripts/generate-vectors.ts` dari PCG32 bertetapan (seed `20260925`, seq `54`)
  dan diperiksa ulang di CI (`npm run vectors:check`). Nilai yang memiliki rujukan luar (FIPS/RFC/implementasi
  resmi xxHash, SipHash, pcg-c, xoshiro) juga dipatok di `typescript/tests/regression.test.ts`.

### 4.2 Pemetaan masukan

Setiap port mengimplementasikan tabel dispatch yang sama dengan `typescript/tests/vectors/dispatch.ts`
(daftar lengkap di §13). Kasus yang melempar error kanonik menghasilkan `{"error":"<KODE>"}`; error lain
(bug) MUST menggagalkan runner.

### 4.3 Keluaran runner

Runner menulis satu baris per kasus, kelompok urut menaik, kasus urut sesuai berkas:

```
<group>\t<id>\t<canonical(actual)>\n
```

Runner keluar dengan status ≠ 0 bila ada kelompok tak dikenal atau `canonical(actual) ≠ canonical(expected)`.
Perintah per port: §14.

## 5. PRNG (deterministik, **bukan** untuk rahasia)

Semua aritmetika modulo 2⁶⁴ (u64) kecuali disebut lain.

### 5.1 SplitMix64 (`rng.splitmix64`)
`x ← x + 0x9e3779b97f4a7c15; z ← x; z ← (z ⊕ (z ≫ 30))·0xbf58476d1ce4e5b9; z ← (z ⊕ (z ≫ 27))·0x94d049bb133111eb;
return z ⊕ (z ≫ 31)`. Keadaan awal = seed.

### 5.2 xoshiro256++ (`rng.xoshiro256pp`, `_float`, `_int`)
- Keadaan `s[0..3]` = empat keluaran berturut SplitMix64(seed). Seed bawaan `0x123456789abcdef0`.
- `next`: `r = rotl(s0 + s3, 23) + s0; t = s1 ≪ 17; s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3; s2 ^= t; s3 = rotl(s3, 45)`.
- `nextFloat` = `(next() ≫ 11) / 2⁵³` (float, eksak).
- `nextInt(n)`, `1 ≤ n ≤ 2⁵³ − 1`: `threshold = 2⁶⁴ mod n`; ulangi `r = next()` sampai `r ≥ threshold`; hasil
  `r mod n`. `n` di luar rentang → `OUT_OF_RANGE`.

### 5.3 PCG32 — PCG-XSH-RR 64/32 (`rng.pcg32`, `rng.pcg32_bounded`)
- Inisialisasi (`pcg32_srandom_r`): `inc = (initseq ≪ 1) | 1; state = 0; step(); state += initstate; step()` dengan
  `step: state = state·6364136223846793005 + inc`. Bawaan `initstate = 0x853c49e6748fea9b`,
  `initseq = 0xda3e39cb94b95bdb`.
- `next` (u32): `old = state; step(); xs = u32(((old ≫ 18) ⊕ old) ≫ 27); rot = old ≫ 59; return rotr32(xs, rot)`.
- `nextBounded(b)`, `1 ≤ b ≤ 2³² − 1`: `threshold = (2³² − b) mod b`; ulangi `r = next()` sampai `r ≥ threshold`; hasil
  `r mod b`.
- `nextFloat` = `next() / 2³²` (tidak ada di vector; eksak).

## 6. Pengurutan (`sort.*`)

- Masukan: array bilangan (vector memakai bilangan bulat). Keluaran: permutasi menaik menurut `<`.
- **Stabil** — `timsort`, `mergesort`, `radix_lsd`, `counting`: elemen yang sama menurut komparator MUST
  mempertahankan urutan asal. Kelompok `sort.timsort_stable` / `sort.mergesort_stable` mengurutkan pasangan
  `(key, index)` hanya menurut `key` dan mengeluarkan urutan `index`.
- **Tidak stabil** — `quicksort`, `heapsort`: hanya urutan nilai yang normatif.
- `radix_lsd` mendukung bilangan negatif (digeser dengan `−min`); `counting` menerima bilangan bulat `0 … max`
  (atau `maxVal`); nilai negatif/bukan bulat/di atas `maxVal` → `OUT_OF_RANGE`.

## 7. Pencarian (`search.*`)

Masukan `arr` terurut menaik; hasil indeks atau `−1`. Karena `arr` boleh memuat duplikat, **algoritma berikut
normatif** (hasilnya bisa berbeda antar algoritma untuk duplikat):

| Kelompok | Definisi |
|---|---|
| `binary` | `lo=0, hi=n−1`; selama `lo ≤ hi`: `mid = ⌊(lo+hi)/2⌋`; sama → `mid`; `arr[mid] < t` → `lo=mid+1` else `hi=mid−1` |
| `lower_bound` / `upper_bound` | indeks pertama dengan `arr[i] ≥ t` / `arr[i] > t` (nilai `n` bila tidak ada) |
| `interpolation` | `lo=0, hi=n−1`; selama `lo ≤ hi ∧ arr[lo] ≤ t ≤ arr[hi]`: bila `lo = hi` → `lo` jika sama else −1; `range = arr[hi]−arr[lo]`; `range = 0` → `lo` jika sama else −1; `pos = lo + ⌊(hi−lo)·(t−arr[lo]) / range⌋` (pembagian bilangan bulat eksak); sama → `pos`; `<` → `lo=pos+1` else `hi=pos−1` |
| `exponential` | `n=0` → −1; `arr[0]=t` → 0; `b=1`, selama `b<n ∧ arr[b]<t`: `b·=2`; `binary` pada `arr[⌊b/2⌋ … min(b, n−1)]`, hasil + `⌊b/2⌋` |
| `jump` | `step = max(1, ⌊√n⌋)`; `prev=0, cur=step`; selama `cur<n ∧ arr[cur]<t`: `prev=cur, cur+=step`; scan linear `prev … min(cur, n−1)` (inklusif), indeks pertama yang sama |
| `fibonacci` | varian klasik (Ferguson): `F(m−2)=0, F(m−1)=1, F(m)=1`, naikkan sampai `F(m) ≥ n`; `offset=−1`; selama `F(m) > 1`: `i = min(offset + F(m−2), n−1)`; `<` → geser turun satu, `offset=i`; `>` → geser turun dua; sama → `i`; akhir: bila `F(m−1)=1 ∧ offset+1<n ∧ arr[offset+1]=t` → `offset+1` |
| `linear` | indeks pertama yang sama |
| `ternary` | fungsi `f(x) = −(x−c)²` (maksimum) atau `(x−c)²` (minimum); selama `hi − lo > ε`: `m1 = lo + (hi−lo)/3`, `m2 = hi − (hi−lo)/3`; maksimum: `f(m1) < f(m2)` → `lo=m1` else `hi=m2`; minimum: `f(m1) > f(m2)` → `lo=m1` else `hi=m2`; hasil `(lo+hi)/2`. `(x−c)²` dihitung `(x−c)·(x−c)` |

## 8. Struktur data (`datastructure.*`)

### 8.1 Bloom filter
- `withParams(m, k)`: `1 ≤ m < 2³²`, `1 ≤ k ≤ 64`, selain itu `OUT_OF_RANGE`.
- `h1 = FNV-1a-32(item)`, `h2 = MurmurHash3_x86_32(item, 0x9747b28c)` (UTF-8); posisi ke-`i`
  (`i = 0 … k−1`): `(h1 + i·h2) mod m` dengan aritmetika bulat eksak.
- Bit `p` = bit ke-`(p mod 8)` (LSB dulu) dari byte `⌊p/8⌋`; array `⌈m/8⌉` byte.
- Vector: `{bits: hex, set_bits, has: [bool…]}`.
- Konstruktor `(n, p)` (m = ⌈−n ln p / ln²2⌉, k = max(1, round(m/n·ln 2))) **tidak normatif** (memakai `ln`).

### 8.2 HyperLogLog
- `b` di-*clamp* ke `[4, 16]`; `m = 2ᵇ` register u8.
- `add(item)`: `h = fmix32(FNV-1a-32(UTF-8(item)))` dengan fmix32 MurmurHash3 (`h ^= h≫16; h·=0x85ebca6b; h ^= h≫13;
  h·=0xc2b2ae35; h ^= h≫16`, mod 2³²); `j = h ≫ (32−b)`; `w = (h ≪ b) mod 2³²`;
  `ρ = w = 0 ? 32−b+1 : clz32(w)+1`; `reg[j] = max(reg[j], ρ)`.
- `count()`: `α = 0.673 (m=16), 0.697 (m=32), 0.709 (m=64), 0.7213/(1+1.079/m)`; `Z = Σ 2^(−reg[i])` (i menaik);
  `E = α·m·m/Z` (dievaluasi `((α·m)·m)/Z`); bila `E ≤ 2.5·m` dan ada register nol (`V`): `E = m·ln(m/V)`;
  bila tidak dan `E > 2³²/30`: `E = −2³²·ln(1 − E/2³²)`; hasil `round(E)` (setengah dibulatkan ke atas).
  Karena `ln` tidak normatif di tingkat bit, keluaran **bilangan bulat** yang normatif.
- `merge`: maksimum per register; `b` berbeda → `INVALID_INPUT`.
- Vector: `{estimate, registers_fnv1a64}` — FNV-1a-64 atas `2ᵇ` byte register (urut indeks), memastikan register
  identik, bukan hanya estimasinya. Item vector = `prefix + desimal(i)` untuk `i = 0 … count−1`.

### 8.3 Disjoint set
Union-by-rank + path compression penuh. `union(x,y)`: `rx=find(x), ry=find(y)`; sama → `false`;
`rank[rx] < rank[ry]` → `parent[rx]=ry`; `>` → `parent[ry]=rx`; sama → `parent[ry]=rx, rank[rx]++`; `count−−`;
`true`. `find` mengembalikan akar (normatif karena aturan di atas). Operasi vector: `union`, `find`, `connected`, `count`.

### 8.4 Fenwick tree
Indeks 1-based. Inisialisasi dari array dengan `update(i+1, a[i])` berurutan. `prefix(i)` (0 → 0), `range(l,r)` =
`prefix(r) − prefix(l−1)`, `point(i)` = `range(i,i)`; `update` mengeluarkan `null` di vector.

### 8.5 Segment tree (lazy, range-add / range-sum)
`update(l, r, v)` menambah `v` ke `a[l..r]` (inklusif, 0-based); `query(l, r)` jumlah. Keluaran = jumlah eksak
(bilangan bulat di vector); `update` → `null`.

## 9. Graf (`graph.*`)

### 9.0 Model
- Graf = `{nodes: n, edges: [[from, to, weight], …]}`; node `0 … n−1`; edge berarah; *multigraph* (edge paralel &
  loop diizinkan). Kruskal, Prim, dan bipartite matching membaca edge sebagai **tak berarah**.
- `nodes` bukan bilangan bulat ≥ 0 → `INVALID_INPUT`; ujung edge atau `source/target/sink` di luar `[0,n)` →
  `OUT_OF_RANGE` (validasi graf dulu, lalu node).
- **Adjacency** = tetangga keluar per node dalam **urutan daftar edge**.
- **Heap** graf memakai kunci leksikografis total (`[jarak, node]`, dst.) sehingga urutan pop tidak bergantung
  implementasi heap.
- Jarak tak terjangkau = `Infinity` (serialisasi `"Infinity"`), kecuali BFS (`−1`).

### 9.1 BFS — jarak hop dari `source`, antrean FIFO, tetangga sesuai adjacency.
### 9.2 DFS — pre-order iteratif: `stack=[source]`; pop `u`; bila sudah dikunjungi lewati; tandai, keluarkan `u`; push
tetangga yang belum dikunjungi dalam urutan adjacency **terbalik**.
### 9.3 Dijkstra — bobot negatif (edge mana pun) → `NEGATIVE_WEIGHT`; heap `[d, node]`; entri basi (`d > dist[u]`)
dilewati; relaksasi `nd = d + w`, update bila `nd < dist[to]`.
### 9.4 A* — `heuristic[node]` (bawaan 0); bobot negatif → `NEGATIVE_WEIGHT`; heap `[g + h, node]`; entri basi bila
`f > g[u] + h(u)`; saat `u = target` kembalikan `{path, cost}`; predecessor hanya diganti pada perbaikan **ketat**.
Tak terjangkau → `{path: [], cost: Infinity}`.
### 9.5 Bellman–Ford — hingga `n−1` ronde; tiap ronde merelaksasi seluruh edge **dalam urutan daftar** (hanya dari
`dist[from] ≠ ∞`); berhenti lebih awal bila satu ronde tanpa perubahan; lalu satu ronde deteksi. Keluaran
`{distances, has_negative_cycle}` (jarak apa adanya saat berhenti).
### 9.6 Floyd–Warshall — `dist[i][i]=0`; edge paralel ambil minimum; loop `k → i → j`; lewati `i` bila `dist[i][k]=∞`;
update bila `dist[i][k] + dist[k][j] < dist[i][j]`.
### 9.7 Topological sort (Kahn) — antrean FIFO diisi node in-degree 0 menaik; tetangga dilepas sesuai adjacency;
siklus → `[]`.
### 9.8 Kruskal — edge diurutkan **stabil** menaik menurut bobot (seri: urutan daftar); edge diambil bila
menghubungkan dua komponen (disjoint set §8.3); keluaran edge dalam urutan diambil, orientasi asli.
### 9.9 Prim (lazy) — pohon ditumbuhkan dari node terkecil yang belum dikunjungi; kunjungi `u`: untuk setiap edge
insiden (urutan daftar; loop dicatat sekali) ke `v` yang belum di pohon push `[w, v, u, idxEdge]`; pop minimum,
lewati bila `v` sudah di pohon, keluarkan `[u, v, w]` lalu kunjungi `v`. Hutan (graf tak terhubung) didukung.
### 9.10 Tarjan SCC — akar menaik, tetangga sesuai adjacency (setara versi rekursif); komponen dikeluarkan dalam urutan
selesai (urutan topologis terbalik dari kondensasi); node dalam komponen diurutkan menaik.
### 9.11 Dinic (max-flow) — bobot = kapasitas (edge paralel dijumlah); kapasitas negatif → `NEGATIVE_WEIGHT`;
`source = sink` → `INVALID_INPUT` (setelah validasi node). Hanya **nilai** aliran yang normatif (eksak untuk
kapasitas bulat < 2⁵³).
### 9.12 Bipartite matching (Hopcroft–Karp) — `n_left`, `n_right`, `pairs [[l, r]]`; pasangan di luar rentang →
`OUT_OF_RANGE`. Hanya **ukuran** matching yang normatif.
### 9.13 PageRank — `damping ∈ [0,1]` (else `OUT_OF_RANGE`), `iterations` tetap, `n = 0 → []`, awal `1/n`. Tiap
iterasi (urutan evaluasi normatif):
```
dangling = Σ rank[u]  untuk out-degree(u) = 0, u menaik
base     = (1 − d)/n + (d·dangling)/n
next[v]  = base
untuk u menaik dengan out-degree > 0: c = (d·rank[u]) / outdeg[u]
    untuk setiap edge u→v (urutan daftar): next[v] = next[v] + c
```

## 10. Matematika (`math.*`)

| Kelompok | Definisi normatif |
|---|---|
| `gcd` | ≥ 0; `gcd(0,0)=0` |
| `lcm` | `|a/gcd(a,b)·b|`; 0 bila salah satu 0 |
| `extended_gcd` | rekursif: `b=0 → (a, 1, 0)`; else `(g, x₁, y₁) = egcd(b, a rem b)`, hasil `(g, y₁, x₁ − (a quo b)·y₁)` dengan **pembagian terpotong ke nol** (`quo`) dan sisa bertanda pembilang (`rem`) — port dengan floor division (Python `//`, `%`) MUST mengemulasikannya |
| `mod_inverse` | `egcd((a mod m), m)`; `g ≠ 1` → `NO_INVERSE`; hasil `x mod m` ∈ `[0,m)` |
| `mod_pow` | `m < 1` atau `exp < 0` → `OUT_OF_RANGE`; `m = 1 → 0`; basis dinormalisasi ke `[0,m)`; hasil ∈ `[0,m)` |
| `crt` | panjang berbeda → `INVALID_INPUT`; `M = Π mᵢ`; untuk tiap i: `Mᵢ = M/mᵢ`, `egcd(Mᵢ mod mᵢ, mᵢ)` dengan `|g| ≠ 1` → `NOT_COPRIME`; `x = Σ rᵢ'·Mᵢ·invᵢ mod M` dengan `rᵢ' = rᵢ mod mᵢ`; hasil ∈ `[0,M)` |
| `is_prime` | Miller–Rabin deterministik dengan saksi `2,3,5,…,37` (12 prima pertama); `n < 2 → false` |
| `next_prime` | prima terkecil `≥ n` (`n ≤ 2 → 2`) |
| `sieve` | prima `≤ n` menaik |
| `segmented_sieve` | prima di `[lo, hi]` menaik |
| `factorize` | faktor prima menaik dengan multiplisitas; `|n| ≤ 1 → []`; tanda diabaikan |
| `karatsuba` | hasil kali eksak (hanya nilai yang normatif) |
| `ntt` | panjang pangkat dua yang membagi `p − 1`, else `INVALID_INPUT`; `p = 998244353`, `g = 3`; `Aₖ = Σⱼ aⱼ·ωʲᵏ mod p`, `ω = g^((p−1)/n)` (urutan natural) |
| `poly_mul_ntt` | koefisien hasil kali mod `p`, panjang `|a|+|b|−1` |
| `mat_mul` | `Cᵢⱼ = Σₗ Aᵢₗ·Bₗⱼ` (l menaik, mulai 0); dimensi dalam berbeda → `INVALID_INPUT` |
| `strassen` | matriks persegi `n×n` (else `INVALID_INPUT`), di-pad ke pangkat dua; vector memakai bilangan bulat (hasil eksak) |

`fft` (float, bergantung `sin/cos`) **TS-only, tidak normatif**.

## 11. String (`string.*`) — atas code point

| Kelompok | Definisi |
|---|---|
| `kmp` | semua indeks awal (tumpang tindih diizinkan), pola kosong → `[]` |
| `levenshtein` | jarak edit (insert/delete/substitute biaya 1) |
| `damerau_levenshtein` | versi **tak terbatas** (Lowrance–Wagner, transposisi bertetangga dengan edit di antaranya) |
| `jaro` | `a = b → 1`; `md = ⌊max(|a|,|b|)/2⌋ − 1`, `md < 0 → 0`; pencocokan rakus: untuk `i` menaik, `j` pertama di `[max(0,i−md), min(i+md+1,|b|))` yang belum cocok dan sama; `m = 0 → 0`; `t` = jumlah posisi berurutan yang berbeda; hasil `((m/|a| + m/|b|) + (m − t/2)/m) / 3` dievaluasi kiri-ke-kanan |
| `jaro_winkler` | `j = jaro`; `ℓ` = prefiks sama ≤ 4; hasil `j + ((ℓ·p)·(1 − j))`, `p` bawaan 0.1 |
| `aho_corasick` | pola kosong diabaikan; kecocokan dilaporkan sesuai **posisi akhir** menaik; pada satu posisi: pola milik node (urutan penambahan) lalu pola warisan tautan gagal; `[pattern, indexAwal]` |
| `polynomial_hash` | Horner atas `cp − 96`: `h = ((h·base + (cp−96)) mod m + m) mod m`; bawaan `base 31`, `mod 1 000 000 007` |

## 12. Hash non-kriptografis (`hash.*`)

| Kelompok | Rujukan | Keluaran |
|---|---|---|
| `fnv1a32` / `fnv1a64` | FNV-1a (offset `0x811c9dc5` / `0xcbf29ce484222325`, prima `0x01000193` / `0x100000001b3`) | u32 angka / hex16 |
| `murmur3_32` | MurmurHash3_x86_32 (Appleby), seed u32 | u32 |
| `xxhash32` / `xxhash64` | spesifikasi resmi XXH32 / XXH64 (`doc/xxhash_spec.md`) | u32 / hex16 |
| `siphash24` | SipHash-2-4, kunci 16 byte (`k0,k1` little-endian), keluaran u64 little-endian dibaca sebagai bilangan | hex16; kunci ≠ 16 byte → `INVALID_INPUT` |

SHA-2, HMAC, dan HKDF **dihapus** di v0.2.0 (ADR-016) → `lombokencryptdecrypt`. SipHash adalah PRF untuk tabel hash,
**bukan** MAC protokol.

## 13. ML, geometri, kompresi

### 13.1 ML (`ml.*`) — semua Σ menaik dari 0
- `dot = Σ aᵢ·bᵢ`; `l2_norm = √(Σ vᵢ·vᵢ)`; `cosine = dot / (‖a‖·‖b‖)`, salah satu norma 0 → `0`;
  `l2_distance = √(Σ (aᵢ−bᵢ)·(aᵢ−bᵢ))`; `l1_distance = Σ |aᵢ−bᵢ|`; `normalize = vᵢ/‖v‖` (norma 0 → nol);
  panjang berbeda → `INVALID_INPUT` (termasuk `cosine`).
- `jaccard = |A∩B| / |A∪B|` atas himpunan string (duplikat diabaikan), dua himpunan kosong → `1`.
- `pearson`: `μa = (Σa)/n`, `μb = (Σb)/n`; `num = Σ da·db`, `sa = Σ da·da`, `sb = Σ db·db`; `sa = 0 ∨ sb = 0 → 0`;
  hasil `num / √(sa·sb)`.
- `batch_cosine`: `cosine` tiap kandidat, urut skor menurun, seri indeks menaik; keluaran `[[index, score]]`.
- `kmeans` (Lloyd + k-means++): `n = 0 → EMPTY_INPUT`; `k ∉ [1,n] → OUT_OF_RANGE`; dimensi berbeda → `INVALID_INPUT`.
  `sq(a,b) = Σ (aᵢ−bᵢ)·(aᵢ−bᵢ)`. Seeding dengan xoshiro256++(seed): `c₀ = points[nextInt(n)]`; `D[i] = sq(pᵢ, c₀)`;
  selama `< k` pusat: `total = Σ D`, `r = nextFloat()·total`, pilih `i` pertama dengan `(r ← r − D[i]) ≤ 0` (atau
  `n−1`), tambahkan salinan titik itu, `D[i] = min(D[i], sq(pᵢ, c))`. Iterasi (`iter` dari 1 s.d. `max_iter`):
  label = pusat berindeks terkecil dengan `sq` minimum **ketat**; pusat baru = rata-rata anggota (jumlah per
  dimensi urut titik, lalu dibagi jumlah anggota); cluster kosong mempertahankan pusat lama;
  `shift = √sq(lama, baru)`; berhenti bila `max shift < tol`. `inertia = Σ sq(pᵢ, pusat[labelᵢ])` dengan pusat
  terakhir. Keluaran `{centroids, labels, iterations, inertia}`.

### 13.2 Geometri (`geometry.*`) — titik `[x, y]`
- `cross(O,A,B) = (A.x−O.x)·(B.y−O.y) − (A.y−O.y)·(B.x−O.x)`.
- `convex_hull`: monotone chain Andrew; titik diurutkan `(x, y)`; belokan harus **ketat** CCW (`cross ≤ 0` di-pop);
  keluaran CCW mulai dari titik `(x,y)` terkecil; `< 3` titik → titik terurut; semua titik identik → satu titik.
- `closest_pair`: `< 2` titik → `EMPTY_INPUT`; jarak `√(Δx·Δx + Δy·Δy)` (bukan `hypot`); hanya **jarak** normatif.
- `point_in_polygon`: aturan genap–ganjil, sinar ke +x; edge `(i, j=i−1)` membalik status bila
  `(yᵢ > y) ≠ (yⱼ > y)` dan `x < ((xⱼ−xᵢ)·(y−yᵢ))/(yⱼ−yᵢ) + xᵢ`.
- `bezier`: de Casteljau, `s = 1 − t`, `p' = p·s + q·t` per koordinat; tanpa titik → `EMPTY_INPUT`.

### 13.3 Kompresi (`compression.*`)
- `rle_encode`: pasangan `(count, value)` dengan `1 ≤ count ≤ 255`. `rle_decode`: panjang ganjil atau `count = 0` →
  `INVALID_INPUT`.
- `lz77_compress(data, window=255)`: `window ∉ [1,255] → OUT_OF_RANGE`; token `00 lit` atau `01 off len`
  (`3 ≤ len ≤ 255`, `1 ≤ off ≤ window`, boleh tumpang tindih); untuk `j` menaik dari `max(0, i−window)`, panjang
  kecocokan dihitung hingga 255 / akhir data; ambil yang **lebih panjang ketat** (seri → `j` terkecil = offset
  terbesar); `len ≥ 3` → token match, else literal.
- `lz77_decompress`: flag ∉ {0,1}, token terpotong, `off = 0` atau `off > panjang keluaran` → `INVALID_INPUT`.
- `huffman`: daun diberi id `0,1,…` menurut **nilai byte menaik**, simpul dalam id berikutnya sesuai urutan
  pembuatan; min-heap berkunci `(freq, id)`; pop `left` lalu `right`, gabung `freq = left + right`; kiri `0`, kanan `1`;
  satu simbol → kode `"0"`; bit dikemas MSB-dulu, byte terakhir diisi nol. Keluaran
  `{encoded, bit_length, codes: [[byte, "kode"], …] menaik}`.

## 14. Daftar kelompok & runner

92 kelompok (1059 kasus) di `lombokalgoritma-vectors-v1.json`:

`canon.number` ·
`rng.{splitmix64, xoshiro256pp, xoshiro256pp_float, xoshiro256pp_int, pcg32, pcg32_bounded}` ·
`sort.{quicksort, timsort, mergesort, heapsort, radix_lsd, counting, timsort_stable, mergesort_stable}` ·
`search.{binary, lower_bound, upper_bound, interpolation, exponential, jump, fibonacci, linear, ternary}` ·
`math.{gcd, lcm, extended_gcd, mod_inverse, mod_pow, crt, is_prime, next_prime, sieve, segmented_sieve, factorize,
karatsuba, ntt, poly_mul_ntt, mat_mul, strassen}` ·
`string.{kmp, levenshtein, damerau_levenshtein, jaro, jaro_winkler, aho_corasick, polynomial_hash}` ·
`hash.{fnv1a32, fnv1a64, murmur3_32, xxhash32, xxhash64, siphash24}` ·
`datastructure.{bloom, hyperloglog, hyperloglog_merge, disjoint_set, fenwick, segment_tree}` ·
`graph.{bfs, dfs, dijkstra, a_star, bellman_ford, floyd_warshall, topological_sort, kruskal, prim, tarjan_scc,
dinic, bipartite_matching, pagerank}` ·
`ml.{dot, l2_norm, cosine, l2_distance, l1_distance, normalize, jaccard, pearson, batch_cosine, kmeans}` ·
`geometry.{cross, convex_hull, closest_pair, point_in_polygon, bezier}` ·
`compression.{rle_encode, rle_decode, lz77_compress, lz77_decompress, huffman}`.

| Port | Perintah runner (menulis keluaran §4.3) |
|---|---|
| TypeScript | `cd typescript && npx tsx scripts/run-vectors.ts --out ../out/typescript.txt` |
| Rust | `cd rust && cargo run -q -p lombokalgoritma-vectors -- ../vectors/lombokalgoritma-vectors-v1.json > ../out/rust.txt` |
| Python | `python -m lombokalgoritma._vectors vectors/lombokalgoritma-vectors-v1.json > out/python.txt` |
| Go | `cd go && go run ./cmd/vectors ../vectors/lombokalgoritma-vectors-v1.json > ../out/go.txt` |
| PHP | `php php/bin/vectors.php vectors/lombokalgoritma-vectors-v1.json > out/php.txt` |

Masing-masing port juga menjalankan runner yang sama sebagai test unit (`vitest`, `cargo test`, `pytest`,
`go test`, `phpunit`).

## 15. Perubahan normatif sejak 0.1.x

| § | Perubahan |
|---|---|
| 2 | Kode error kanonik; v0.1.x melempar `RangeError`/`Error` generik |
| 3 | JSON kanonik & format float ECMAScript + `-0` |
| 0.3, 11 | String atas code point (v0.1.x: UTF-16 code unit); Aho–Corasick kini cocok untuk karakter astral |
| 8.1 | Bloom `withParams(m,k)` portabel; posisi tanpa `Math.abs` |
| 9 | Aturan tie-breaking graf; Dijkstra memakai heap (v0.1.x mengurutkan ulang frontier); PageRank meredistribusi massa dangling |
| 10 | `mod_pow` menormalkan basis negatif; `crt` memakai koefisien invers yang benar |
| 12 | xxHash64 & SipHash-2-4 ditambahkan; SHA-256/HMAC/HKDF dihapus |
| 13.1 | `batch_cosine` tanpa NaN; k-means memakai jarak kuadrat eksak & seeding normatif |
| 13.2 | `closest_pair` tanpa `hypot`; hull < 3 titik dikembalikan terurut |
| 13.3 | Huffman deterministik `(freq, id)`; dekoder RLE/LZ77 menolak stream rusak |

*Lisensi dokumen: Apache-2.0 OR MIT · © codinglombok*

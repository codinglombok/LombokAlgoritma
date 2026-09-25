# LombokAlgoritma — Masterplan v0.2.0

| Atribut | Nilai |
|---|---|
| Cluster · tingkat | **00.02** Fondasi & Primitif Inti · **L0** (tanpa dependensi Lombok) |
| Masterplan ekosistem | v3.3 (ADR-004 zero-dep, ADR-010 satu workspace per bahasa, ADR-015 SPEC normatif, ADR-016 kripto hanya di LombokEncryptDecrypt) |
| Lisensi | Apache-2.0 OR MIT |
| Status | v0.1.1 (perbaikan, PR `fix: v0.1.1`) → **v0.2.0** (breaking, PR `refactor!: v0.2.0`) |

## 1. Tujuan

Pustaka algoritma deterministik tanpa dependensi untuk seluruh ekosistem Lombok: satu implementasi
referensi (TypeScript) dan port yang **byte-identik** di Rust, Python, Go dan PHP, dijamin oleh berkas vector
bersama dan SPEC normatif. Konsumen utama: LombokVector, LombokSimHash, LombokTableSheet, LombokLeiden,
LombokGraphDB.

## 2. Lingkup

| Termasuk | Tidak termasuk |
|---|---|
| sort, search, number theory, string, hash non-kripto, struktur data, graf, ML dasar, geometri 2-D, kompresi sederhana, PRNG deterministik | kriptografi (→ LombokEncryptDecrypt), kompresi produksi (→ LombokCompress), vektor SIMD (→ LombokVector), graf skala besar/persisten (→ LombokGraphDB) |

## 3. Roadmap

| Versi | Isi | Kriteria selesai |
|---|---|---|
| 0.1.1 | build npm/tsup, perbaikan CRT/HLL/xxHash32/segment tree, Rust workspace `rust/`, Go module `go/`, lisensi ganda, CI & release-please, deprecation kripto | CI hijau, tag `v0.1.1` + `go/v0.1.1`, npm terbit |
| **0.2.0** | kripto dihapus, layout per bahasa, vector v1 (92 kelompok) + runner 5 port, 12 dokumen, SCC/Prim/Bellman–Ford/Dinic/matching | vector identik di 5 port, coverage ≥ 90 %, 0 error lint, tag `v0.2.0` |
| 0.3.0 | port Java/Kotlin/C#/C++/Swift ke vector v1 (runner), hapus alias deprecated, `messageId` + katalog LombokLocale, benchmark lintas port | ≥ 8 port ✅ |
| 0.4.0 | graf lanjutan untuk LombokLeiden (Louvain/Leiden refinement primitives, min-cost flow), string suffix array/automaton | vector v2 |
| 1.0.0 | API stabil, SPEC 1.0 | 2 minor tanpa perubahan breaking |

## 4. Prinsip

1. Zero runtime dependency (ADR-004). 2. SPEC mengalahkan implementasi (ADR-015). 3. Tanpa kripto (ADR-016).
4. Angka README dihitung dari kode (`scripts/count_algorithms.ts`). 5. Status port jujur: ✅ hanya bila runner
lulus 100 % vector dan CI membandingkan byte.

## 5. Risiko

| Risiko | Mitigasi |
|---|---|
| Perbedaan float antar bahasa (FMA, libm) | SPEC §0.2 melarang FMA/penataan ulang; fungsi transendental hanya di keluaran yang dibulatkan |
| Ukuran berkas vector membengkak | ≈ 250 KB, input dari PCG32 bertetapan; kelompok baru → vector v2 |
| Port sekunder tertinggal | job CI "experimental" non-blocking + tabel status otomatis |

*Lisensi dokumen: Apache-2.0 OR MIT · © codinglombok*

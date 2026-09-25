# LombokAlgoritma — Bahasa & i18n v0.2.0

| Atribut | Nilai |
|---|---|
| Versi | 0.2.0 |
| Tingkat i18n (masterplan §13) | **E** — hanya pesan error & dokumentasi; seluruh algoritma bebas locale |
| Sumber katalog | `locales/<bcp47>/lombokalgoritma.json` — dimuat lewat LombokLocale bila terpasang (opsional, bukan dependensi) |
| Fallback | teks bahasa Inggris tertanam di kode (`en`) |
| Dokumen terkait | [API_](API_LombokAlgoritma_v0.2.0.md) · [SPEC_](SPEC_LombokAlgoritma_v0.2.0.md) |

## 1. Prinsip

1. Setiap error membawa `code` kanonik (SPEC §2) — bagian dari kontrak. Program MUST memeriksa `code`, bukan teks.
2. Teks pesan bersifat informatif dan MAY berbeda antar port; v0.2.0 belum menyertakan `messageId`
   (dijadwalkan bersama LombokLocale v0.1.0). ID di §2 sudah dicadangkan dan stabil.
3. **Tidak ada perilaku bergantung locale**: string diproses sebagai code point Unicode tanpa normalisasi
   (NFC/NFKC adalah tanggung jawab pemanggil), angka diserialisasi dengan format kanonik SPEC §3.2, perbandingan
   string memakai urutan code unit/code point — bukan kolasi locale. `jaro`, `levenshtein` dll. peka huruf besar.
4. Library tidak mendeteksi locale dan tidak membaca variabel lingkungan.

## 2. Katalog ID pesan (dicadangkan)

| ID | Kode | en | id | Parameter |
|---|---|---|---|---|
| `lombokalgoritma.input.invalid` | `INVALID_INPUT` | Invalid input for {$fn}: {$reason}. | Masukan untuk {$fn} tidak valid: {$reason}. | fn, reason |
| `lombokalgoritma.param.out_of_range` | `OUT_OF_RANGE` | Parameter {$name} is out of range: {$value}. | Parameter {$name} di luar batas: {$value}. | name, value |
| `lombokalgoritma.input.empty` | `EMPTY_INPUT` | Not enough input elements for {$fn}. | Elemen masukan untuk {$fn} tidak cukup. | fn |
| `lombokalgoritma.graph.negative_weight` | `NEGATIVE_WEIGHT` | {$fn}: negative edge weight. | {$fn}: bobot edge negatif. | fn |
| `lombokalgoritma.math.no_inverse` | `NO_INVERSE` | No modular inverse of {$a} modulo {$m}. | Tidak ada invers modular {$a} modulo {$m}. | a, m |
| `lombokalgoritma.math.not_coprime` | `NOT_COPRIME` | CRT moduli must be pairwise coprime. | Modulus CRT harus saling prima. | — |
| `lombokalgoritma.int.overflow` | `OVERFLOW` | Integer overflow in {$op}. | Overflow bilangan bulat pada {$op}. | op |
| `lombokalgoritma.index.out_of_bounds` | `OUT_OF_BOUNDS` | Index {$index} out of bounds [0, {$length}). | Indeks {$index} di luar batas [0, {$length}). | index, length |
| `lombokalgoritma.platform.unsupported` | `UNSUPPORTED` | {$feature} is not available on this platform. | {$feature} tidak tersedia di platform ini. | feature |

Total: **9 ID pesan** untuk 9 kode error.

## 3. Cakupan bahasa

| Kelompok | Bahasa | Status v0.2.0 |
|---|---|---|
| Wajib rilis | en, id | ✅ teks di §2 (katalog berkas menyusul bersama LombokLocale) |
| Core-20 lainnya | ms, zh-Hans, zh-Hant, es, pt, fr, de, ru, ar, fa, ur, hi, bn, ja, ko, tr, vi, th | — belum |
| Nusantara | jv, su, ban, sas, bug, min | — belum (prioritas rendah untuk tingkat E) |
| RTL | ar, fa, ur | tidak ada UI — tidak perlu penanganan arah |

## 4. Perilaku bergantung locale

Tidak ada. Catatan Unicode yang relevan:
- `"é"` (U+00E9) dan `"é"` dianggap berbeda (tanpa normalisasi).
- Karakter astral (emoji) dihitung satu code point di semua port sejak v0.2.0.
- Hash atas string memakai UTF-8 byte tanpa normalisasi.

## 5. Cara menambah bahasa (setelah LombokLocale v0.1.0)

1. Salin `locales/en/lombokalgoritma.json` → `locales/<bcp47>/lombokalgoritma.json`.
2. Terjemahkan nilai; jangan mengubah ID dan parameter `{$…}`.
3. Ajukan PR berlabel `i18n`; perlu satu peninjau penutur asli.

## 6. Perubahan sejak 0.1.x

- 0.1.x: teks Inggris saja, error tanpa kode (TS `RangeError`).
- 0.2.0: kode error kanonik di 5 port, ID pesan dicadangkan, pemrosesan string atas code point.

*Lisensi dokumen: Apache-2.0 OR MIT · © codinglombok*

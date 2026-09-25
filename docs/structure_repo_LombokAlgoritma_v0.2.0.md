# LombokAlgoritma — Structure Repo v0.2.0

```
LombokAlgoritma/
├── README.md · CHANGELOG.md · UPGRADE.md · LICENSE-APACHE · LICENSE-MIT · SECURITY.md · CONTRIBUTING.md
├── composer.json            manifest Packagist (harus di root) → php/
├── Package.swift            manifest SwiftPM (harus di root) → swift/
├── release-please-config.json · .release-please-manifest.json · version.txt · Makefile
├── .github/workflows/       ci.yml · release-please.yml · publish.yml · codeql.yml · security.yml
├── docs/                    12 dokumen standar (<jenis>_LombokAlgoritma_v0.2.0.md)
├── vectors/                 lombokalgoritma-vectors-v1.json · SHA256SUMS
├── scripts/                 count_algorithms.ts (README status) · build_wasm.sh
├── typescript/              npm `lombokalgoritma` — referensi
│   ├── src/{core,sort,search,math,string/{hash},datastructure,graph,ml,geometry,compression,concurrent,hardware}/
│   ├── tests/               vitest (+ tests/vectors/{canonical,dispatch,runner}.ts)
│   ├── scripts/             generate-vectors.ts · run-vectors.ts · copy-meta.mjs
│   └── package.json · tsup.config.ts · tsconfig*.json · vitest.config*.ts · biome.json · eslint.config.js · deno.json · jsr.json
├── rust/                    Cargo workspace (MSRV 1.75)
│   ├── lombokalgoritma/          crate inti no_std + alloc (src/<modul>/<algoritma>.rs)
│   ├── lombokalgoritma-capi/     C ABI + include/lombokalgoritma.h
│   ├── lombokalgoritma-wasm/     wasm-bindgen (satu-satunya crate dengan dependensi)
│   └── lombokalgoritma-vectors/  runner vector (publish = false)
├── go/                      module github.com/codinglombok/lombokalgoritma/go — <modul>_<algoritma>.go, internal/vectors, cmd/vectors
├── python/                  pyproject.toml · lombokalgoritma/{graph,geometry,compression}/ · _vectors.py · tests/
├── php/                     src/LombokAlgoritma/{Sort,Search,Math,String,Hash,DataStructure,Graph,Ml,Geometry,Compression,Rng,Core,Vectors} · bin/vectors.php · tests/
├── java/ kotlin/ csharp/ cpp/ swift/ perl/ sql/   port sekunder (belum conformant)
└── out/                     (diabaikan git) keluaran runner untuk cmp
```

Aturan: satu folder per bahasa (ADR-010); graf & geometri satu berkas per algoritma; manifest registry di
dalam folder bahasa kecuali yang diwajibkan registry berada di root (Packagist, SwiftPM).

*Lisensi dokumen: Apache-2.0 OR MIT · © codinglombok*

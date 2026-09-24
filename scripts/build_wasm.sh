#!/usr/bin/env bash
# LombokAlgoritma — WebAssembly bundle (rust/lombokalgoritma-wasm)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
# Requires: rustup target add wasm32-unknown-unknown; wasm-pack (cargo install wasm-pack)
set -euo pipefail
cd "$(dirname "$0")/../rust"
command -v wasm-pack >/dev/null || { echo "wasm-pack not found: cargo install wasm-pack" >&2; exit 1; }
wasm-pack build lombokalgoritma-wasm --target bundler --release --out-dir ../../dist/wasm
RUSTFLAGS="-C target-feature=+simd128" \
  wasm-pack build lombokalgoritma-wasm --target bundler --release --out-dir ../../dist/wasm-simd
echo "[WASM] dist/wasm and dist/wasm-simd written"

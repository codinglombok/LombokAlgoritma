# LombokAlgoritma — Unified Build Makefile
# Usage: make <target>
# Requires: node, cargo, python3, go, php, javac, g++, swift (optional)

.PHONY: help build test bench lint clean publish vectors security

RUST_FLAGS := RUSTFLAGS="-D warnings"
CARGO      := cargo
NODE       := node
NPM        := npm
PY         := python3
GO         := go
PHP        := php
MVN        := mvn

# ── Help ──────────────────────────────────────────────────────────────
help:
	@echo "LombokAlgoritma — Build Targets"
	@echo ""
	@echo "  make build          Build all language targets"
	@echo "  make build-ts       Build TypeScript (primary)"
	@echo "  make build-rust     Build Rust (native + WASM + embedded)"
	@echo "  make build-wasm     Build WASM bundle from Rust"
	@echo "  make test           Run all tests (all languages)"
	@echo "  make test-ts        Run TypeScript tests"
	@echo "  make test-rust      Run Rust tests"
	@echo "  make test-py        Run Python tests"
	@echo "  make test-go        Run Go tests"
	@echo "  make test-php       Run PHP tests"
	@echo "  make test-java      Run Java tests"
	@echo "  make test-vectors   Validate cross-language test vectors"
	@echo "  make bench          Run all benchmarks"
	@echo "  make bench-ts       Run TypeScript benchmarks"
	@echo "  make bench-rust     Run Rust criterion benchmarks"
	@echo "  make lint           Lint all languages"
	@echo "  make security       Run security audits (all languages)"
	@echo "  make dudect         Verify constant-time crypto (dudect)"
	@echo "  make fuzz           Run fuzz tests (10 minutes)"
	@echo "  make vectors        Generate + validate test vectors"
	@echo "  make clean          Remove all build artifacts"
	@echo "  make publish        Publish to all registries (requires tokens)"
	@echo ""

# ── Build ─────────────────────────────────────────────────────────────
build: build-ts build-rust

build-ts:
	@echo "[TS] Building TypeScript..."
	$(NPM) run build

build-rust:
	@echo "[Rust] Building native..."
	$(RUST_FLAGS) $(CARGO) build --release
	@echo "[Rust] Building no_std embedded..."
	$(RUST_FLAGS) $(CARGO) build --release --target thumbv7em-none-eabihf \
		--manifest-path ports/rust/embedded/Cargo.toml \
		--no-default-features --features no_std
	@echo "[Rust] Building C ABI..."
	$(RUST_FLAGS) $(CARGO) build --release \
		--manifest-path ports/rust/capi/Cargo.toml

build-wasm:
	@echo "[WASM] Building WASM bundle..."
	bash scripts/build_wasm.sh

# ── Test ──────────────────────────────────────────────────────────────
test: test-ts test-rust test-py test-go test-php test-java test-vectors

test-ts:
	@echo "[TS] Running tests..."
	$(NPM) test

test-rust:
	@echo "[Rust] Running tests..."
	$(RUST_FLAGS) $(CARGO) test --all-features

test-py:
	@echo "[Python] Running tests..."
	$(PY) -m pytest ports/python/tests -v --tb=short

test-go:
	@echo "[Go] Running tests..."
	cd ports/go && $(GO) test -race -count=1 ./...

test-php:
	@echo "[PHP] Running tests..."
	$(PHP) vendor/bin/phpunit

test-java:
	@echo "[Java] Running tests..."
	$(MVN) test -pl ports/java

test-vectors:
	@echo "[Vectors] Validating cross-language test vectors..."
	bash scripts/validate_vectors.sh

# ── Benchmarks ────────────────────────────────────────────────────────
bench: bench-ts bench-rust

bench-ts:
	@echo "[TS] Running benchmarks..."
	$(NPM) run bench

bench-rust:
	@echo "[Rust] Running Criterion benchmarks..."
	$(CARGO) bench --all-features

bench-compare:
	@echo "[Bench] Comparing vs baseline..."
	bash scripts/bench_compare.sh

# ── Lint ──────────────────────────────────────────────────────────────
lint:
	@echo "[TS] Biome + ESLint..."
	$(NPM) run lint
	@echo "[Rust] Clippy..."
	$(RUST_FLAGS) $(CARGO) clippy --all-targets --all-features -- -D warnings
	@echo "[Python] Ruff..."
	$(PY) -m ruff check ports/python/
	@echo "[Go] golangci-lint..."
	golangci-lint run ports/go/...
	@echo "[PHP] PHPStan..."
	$(PHP) vendor/bin/phpstan analyse

# ── Security ──────────────────────────────────────────────────────────
security:
	@echo "[Security] npm audit..."
	$(NPM) audit --audit-level=moderate
	@echo "[Security] cargo audit..."
	$(CARGO) audit
	@echo "[Security] Python safety..."
	$(PY) -m safety check
	@echo "[Security] Go vulncheck..."
	govulncheck ./...
	@echo "[Security] PHP composer audit..."
	composer audit

dudect:
	@echo "[Security] Constant-time verification (dudect)..."
	bash scripts/dudect_verify.sh

fuzz:
	@echo "[Fuzz] Running fuzz tests (10 minutes)..."
	cd ports/rust && $(CARGO) fuzz run fuzz_sort         -- -max_total_time=120 &
	cd ports/rust && $(CARGO) fuzz run fuzz_string_parsers -- -max_total_time=120 &
	cd ports/rust && $(CARGO) fuzz run fuzz_compression  -- -max_total_time=120 &
	cd ports/rust && $(CARGO) fuzz run fuzz_crypto       -- -max_total_time=120 &
	cd ports/rust && $(CARGO) fuzz run fuzz_graph        -- -max_total_time=120 &
	wait
	@echo "[Fuzz] All fuzz targets completed."

# ── Vectors ───────────────────────────────────────────────────────────
vectors:
	@echo "[Vectors] Generating from TypeScript reference..."
	$(NPM) run vectors:generate
	@echo "[Vectors] Validating across all languages..."
	bash scripts/validate_vectors.sh

# ── Clean ─────────────────────────────────────────────────────────────
clean:
	rm -rf dist/ coverage/ bench-results.json coverage-php/ coverage-php.xml
	$(CARGO) clean
	find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	find . -name ".pytest_cache" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "Clean complete."

# ── Publish ───────────────────────────────────────────────────────────
publish:
	@echo "[Publish] Publishing to all 11 registries..."
	bash scripts/publish_all.sh

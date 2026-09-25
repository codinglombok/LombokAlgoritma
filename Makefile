# LombokAlgoritma — convenience targets (CI runs the same commands, see .github/workflows/ci.yml)
# SPDX-License-Identifier: Apache-2.0 OR MIT
V := vectors/lombokalgoritma-vectors-v1.json
PHP ?= php
PYTHON ?= python3
.PHONY: help build test lint counts vectors vectors-crosscheck clean \
        build-ts test-ts lint-ts test-rust lint-rust build-embedded build-wasm \
        test-go lint-go test-py lint-py test-php lint-php test-cpp test-perl

help:
	@echo "make build | test | lint | counts | vectors | vectors-crosscheck | clean"
	@echo "per language: test-ts test-rust test-go test-py test-php test-cpp test-perl"

build: build-ts
	cd rust && cargo build --workspace --release

test: test-ts test-rust test-go test-py test-php test-cpp test-perl
lint: lint-ts lint-rust lint-go lint-py lint-php

build-ts:      ; cd typescript && npm run build
test-ts:       ; cd typescript && npm test -- --coverage
lint-ts:       ; cd typescript && npm run typecheck && npm run lint && npm run counts:check && npm run vectors:check

test-rust:     ; cd rust && cargo test --workspace && cargo test -p lombokalgoritma --no-default-features
lint-rust:     ; cd rust && cargo fmt --all --check && cargo clippy --workspace --all-targets -- -D warnings
build-embedded:; cd rust && cargo build -p lombokalgoritma --no-default-features --target thumbv7em-none-eabihf
build-wasm:    ; bash scripts/build_wasm.sh

test-go:       ; cd go && go test -race -count=1 -cover ./...
lint-go:       ; cd go && test -z "$$(gofmt -l .)" && go vet ./... && golangci-lint run ./...

test-py:       ; cd python && pytest
lint-py:       ; ruff check python && ruff format --check python && mypy --strict python/lombokalgoritma

test-php:      ; vendor/bin/phpunit -c php/phpunit.xml
lint-php:      ; vendor/bin/phpcs --standard=PSR12 php/src php/tests php/bin && vendor/bin/phpstan analyse -c php/phpstan.neon --no-progress

test-cpp:
	cmake -S cpp -B build/cpp -DCMAKE_BUILD_TYPE=Release && cmake --build build/cpp -j && ctest --test-dir build/cpp --output-on-failure
test-perl:     ; prove -I perl/lib -r perl/t

counts:        ; cd typescript && npm run counts
vectors:       ; cd typescript && npm run vectors:generate && cd ../vectors && sha256sum lombokalgoritma-vectors-v1.json > SHA256SUMS

vectors-crosscheck:
	mkdir -p out
	cd typescript && npx tsx scripts/run-vectors.ts --out ../out/typescript.txt
	cd rust && cargo run -q -p lombokalgoritma-vectors -- ../$(V) > ../out/rust.txt
	PYTHONPATH=python $(PYTHON) -m lombokalgoritma._vectors $(V) > out/python.txt
	cd go && go run ./cmd/vectors ../$(V) > ../out/go.txt
	$(PHP) php/bin/vectors.php $(V) > out/php.txt
	for p in rust go python php; do cmp out/typescript.txt out/$$p.txt; done
	sha256sum out/*.txt

clean:
	rm -rf typescript/dist typescript/coverage build out coverage-php coverage-php.xml
	cd rust && cargo clean

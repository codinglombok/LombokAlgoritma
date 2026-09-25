# LombokAlgoritma — convenience targets (CI runs the same commands, see .github/workflows/ci.yml)
# SPDX-License-Identifier: Apache-2.0 OR MIT
.PHONY: help build test lint counts vectors clean \
        build-ts test-ts lint-ts test-rust lint-rust build-embedded build-wasm \
        test-go lint-go test-py lint-py test-php lint-php test-cpp test-perl

help:
	@echo "make build | test | lint | counts | vectors | clean"
	@echo "per language: test-ts test-rust test-go test-py test-php test-cpp test-perl"

build: build-ts
	cd rust && cargo build --workspace --release

test: test-ts test-rust test-go test-py test-php test-cpp test-perl
lint: lint-ts lint-rust lint-go lint-py lint-php

build-ts:      ; npm run build
test-ts:       ; npm test
lint-ts:       ; npm run typecheck && npm run lint && npm run counts:check

test-rust:     ; cd rust && cargo test --workspace
lint-rust:     ; cd rust && cargo fmt --all --check && cargo clippy --workspace --all-targets -- -D warnings
build-embedded:; cd rust && cargo build -p lombokalgoritma --no-default-features --target thumbv7em-none-eabihf
build-wasm:    ; bash scripts/build_wasm.sh

test-go:       ; cd go && go test -race -count=1 ./...
lint-go:       ; cd go && test -z "$$(gofmt -l .)" && go vet ./...

test-py:       ; pytest
lint-py:       ; ruff check ports/python && ruff format --check ports/python && mypy ports/python/lombokalgoritma

test-php:      ; vendor/bin/phpunit --no-coverage
lint-php:      ; vendor/bin/phpstan analyse --no-progress

test-cpp:
	cmake -S ports/cpp -B build/cpp -DCMAKE_BUILD_TYPE=Release && cmake --build build/cpp -j && ctest --test-dir build/cpp --output-on-failure
test-perl:     ; prove -I ports/perl/lib -r ports/perl/t

counts:        ; npm run counts
vectors:       ; bash scripts/validate_vectors.sh

clean:
	rm -rf dist coverage build coverage.xml .coverage
	cd rust && cargo clean

# LombokAlgoritma — Embedded / no_std Guide

LombokAlgoritma's Rust port supports bare-metal embedded targets via `no_std`.

## Supported Targets

| Target | Description |
|--------|-------------|
| `thumbv7em-none-eabihf` | ARM Cortex-M4F/M7 (most common MCU) |
| `thumbv6m-none-eabi` | ARM Cortex-M0/M0+ |
| `riscv32imc-unknown-none-elf` | RISC-V 32-bit embedded |
| `riscv64gc-unknown-none-elf` | RISC-V 64-bit embedded |
| `wasm32-unknown-unknown` | WASM (browser/edge, not embedded but no_std) |

## Usage in Cargo.toml

```toml
[dependencies]
lombokalgoritma = { version = "0.1", default-features = false, features = ["no_std"] }
```

## Algorithms Available in no_std

| Module | Available | Notes |
|--------|-----------|-------|
| Sort | All 16 | Uses alloc for mergesort |
| Search | All 12 | Stack-only |
| Math | SHA-256, GCD, mod_pow, Miller-Rabin, FFT, NTT | No Argon2id (requires heap) |
| String | KMP, Levenshtein, FNV-1a | Aho-Corasick requires alloc |
| DataStructure | DisjointSet, FenwickTree, BloomFilter | Fixed-size variants |
| ML | cosine_similarity, l2_distance, dot_product | Stack arrays only |
| Concurrent | None | Requires OS threading |

## Example (Cortex-M4)

```rust
#![no_std]
#![no_main]
use lombokalgoritma::sort::timsort;
use lombokalgoritma::math::sha256;
use panic_halt as _;
use cortex_m_rt::entry;

#[entry]
fn main() -> ! {
    // Sort sensor readings
    let mut readings = [42u32, 17, 89, 3, 55];
    timsort(&mut readings);
    // readings == [3, 17, 42, 55, 89]

    // Hash firmware checksum
    let firmware_block = [0x00u8; 256]; // your firmware block
    let checksum = sha256(&firmware_block);

    loop { cortex_m::asm::wfi(); }
}
```

## Memory Usage

| Algorithm | Stack | Heap (alloc) | Notes |
|-----------|-------|--------------|-------|
| quicksort (1K u32) | ~40B | 0 | Tail-call optimized |
| mergesort (1K u32) | ~40B | 4KB | Requires alloc |
| timsort (1K u32) | ~40B | 4KB | Requires alloc |
| sha256 (any) | ~320B | 0 | Fully stack-allocated |
| binary_search | ~32B | 0 | Stack only |

## no_std + no_alloc (Stack-only)

For extremely constrained environments (< 4KB RAM):

```toml
[dependencies]
lombokalgoritma = {
  version = "0.1",
  default-features = false,
  features = ["no_std"],
  # Do NOT enable "alloc" — restricts to stack-only algorithms
}
```

Available: quicksort, heapsort, binary_search, sha256, gcd, mod_pow,
           kmp_search, fnv1a32, cosine_similarity (fixed-size arrays)

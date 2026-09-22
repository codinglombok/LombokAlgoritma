# LombokECC Integration Guide

LombokAlgoritma optionally integrates with **LombokECC** (Reed-Solomon RS(255,239))
to provide ECC-verified algorithm outputs. This is for mission-critical use cases
where bit-level integrity of algorithm results is required.

## When to Use

- Aerospace / embedded systems where cosmic rays can corrupt memory
- Financial systems where silent data corruption is catastrophic
- Medical devices where incorrect sort order could affect patient safety
- Long-term data storage where bitrot is a concern

## Installation

```bash
# npm — install LombokECC alongside LombokAlgoritma
npm install lombokalgoritma lombokecc
```

## Standard API (no overhead)

```typescript
import { Sort } from 'lombokalgoritma';

const sorted = Sort.timsort([5, 3, 1, 4, 2]);
// Returns [1, 2, 3, 4, 5] — no ECC overhead
```

## Verified API (ECC-wrapped)

```typescript
import { Sort } from 'lombokalgoritma';

const result = Sort.timsort.verified([5, 3, 1, 4, 2]);
// result.data      => [1, 2, 3, 4, 5]
// result.ecc       => Uint8Array (RS parity bytes)
// result.verify()  => true  (detect + correct up to 8-byte corruption)
// result.verifyStrict() => true  (detect only, no correction)
```

## Storing Verified Results

```typescript
import { Sort } from 'lombokalgoritma';
import { RSEncoder } from 'lombokecc';

const result = Sort.timsort.verified([5, 3, 1, 4, 2]);
// Serialize to disk/network with ECC protection
const serialized = result.serialize(); // Uint8Array (data + ECC bytes)

// Later, deserialize and verify
const restored = Sort.timsort.deserialize(serialized);
if (!restored.verify()) {
  throw new Error('Data corruption detected');
}
```

## Architecture

LombokAlgoritma uses LombokECC's RS(255,239) encoder:
- 239 data bytes + 16 parity bytes per block
- Can correct up to 8 corrupted bytes per block
- Can detect up to 16 corrupted bytes per block

The `verified` API serializes algorithm output, splits into 239-byte chunks,
adds 16 parity bytes per chunk, and returns the combined result.

## Performance Impact

| Algorithm | Standard | Verified | Overhead |
|-----------|----------|----------|----------|
| timsort 1M int | 45ms | 47ms | ~4% |
| sha256 1MB | 8ms | 9ms | ~12% |
| k-means (100K×768) | 4.8s | 4.9s | ~2% |

The ECC overhead is proportional to output size, not computation time.

// LombokAlgoritma — xxHash64 (XXH64)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
// Reference: github.com/Cyan4973/xxHash, doc/xxhash_spec.md §"XXH64 Algorithm Description".
import { readU64LE, rotl64, toBytes } from './bytes.js';

/** 2^64 − 1 (bigint literal kept local so every `&` operand is visibly a bigint). */
const MASK64 = 0xffff_ffff_ffff_ffffn;

const P1 = 0x9e3779b185ebca87n;
const P2 = 0xc2b2ae3d27d4eb4fn;
const P3 = 0x165667b19e3779f9n;
const P4 = 0x85ebca77c2b2ae63n;
const P5 = 0x27d4eb2f165667c5n;

const mul = (a: bigint, b: bigint): bigint => (a * b) & MASK64;
const add = (a: bigint, b: bigint): bigint => (a + b) & MASK64;

function round(acc: bigint, lane: bigint): bigint {
  return mul(rotl64(add(acc, mul(lane, P2)), 31n), P1);
}

function mergeRound(acc: bigint, val: bigint): bigint {
  return add(mul(acc ^ round(0n, val), P1), P4);
}

/** xxHash64 of `data` (UTF-8 for strings) with a 64-bit `seed`; returns an unsigned 64-bit bigint. */
export function xxHash64(data: Uint8Array | string, seed = 0n): bigint {
  const b = toBytes(data);
  const n = b.length;
  const s = BigInt.asUintN(64, seed);
  let i = 0;
  let h: bigint;
  if (n >= 32) {
    let v1 = add(add(s, P1), P2);
    let v2 = add(s, P2);
    let v3 = s;
    let v4 = (s - P1) & MASK64;
    while (i <= n - 32) {
      v1 = round(v1, readU64LE(b, i));
      v2 = round(v2, readU64LE(b, i + 8));
      v3 = round(v3, readU64LE(b, i + 16));
      v4 = round(v4, readU64LE(b, i + 24));
      i += 32;
    }
    h = add(add(rotl64(v1, 1n), rotl64(v2, 7n)), add(rotl64(v3, 12n), rotl64(v4, 18n)));
    h = mergeRound(h, v1);
    h = mergeRound(h, v2);
    h = mergeRound(h, v3);
    h = mergeRound(h, v4);
  } else {
    h = add(s, P5);
  }
  h = add(h, BigInt(n));
  while (i + 8 <= n) {
    h ^= round(0n, readU64LE(b, i));
    h = add(mul(rotl64(h, 27n), P1), P4);
    i += 8;
  }
  if (i + 4 <= n) {
    const w =
      BigInt(b[i] as number) |
      (BigInt(b[i + 1] as number) << 8n) |
      (BigInt(b[i + 2] as number) << 16n) |
      (BigInt(b[i + 3] as number) << 24n);
    h ^= mul(w, P1);
    h = add(mul(rotl64(h, 23n), P2), P3);
    i += 4;
  }
  while (i < n) {
    h ^= mul(BigInt(b[i] as number), P5);
    h = mul(rotl64(h, 11n), P1);
    i++;
  }
  h ^= h >> 33n;
  h = mul(h, P2);
  h ^= h >> 29n;
  h = mul(h, P3);
  h ^= h >> 32n;
  return h;
}

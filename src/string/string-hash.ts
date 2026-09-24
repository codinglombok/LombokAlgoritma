// LombokAlgoritma — String Hash Functions
// Apache-2.0 — @codinglombok
// DIPAKAI: LombokSimHash (v0.2.0 — FNV-1a, MurmurHash3)

import { wrapAddU32, wrapMulU32 } from '../core/safe-int.js';

/** Polynomial rolling hash — Rabin fingerprint */
export function polynomialHash(s: string, base = 31, mod = 1_000_000_007): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * base + (s.charCodeAt(i) - 96)) % mod;
  }
  return h;
}

/** FNV-1a 32-bit — fast, deterministic, used by LombokSimHash */
export function fnv1a32(data: Uint8Array | string): number {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  let hash = 0x811c9dc5 >>> 0;
  for (const b of bytes) {
    hash ^= b;
    hash = wrapMulU32(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** FNV-1a 64-bit — used by LombokSimHash for 64-bit fingerprints */
export function fnv1a64(data: Uint8Array | string): bigint {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const OFFSET = 0xcbf29ce484222325n;
  const PRIME = 0x00000100000001b3n;
  let hash = OFFSET;
  for (const b of bytes) {
    hash ^= BigInt(b);
    hash = BigInt.asUintN(64, hash * PRIME);
  }
  return hash;
}

/** MurmurHash3 32-bit — excellent distribution, used in Bloom filters */
export function murmurHash3_32(data: Uint8Array | string, seed = 0): number {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const n = bytes.length;
  let h = seed >>> 0;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  // Process 4-byte blocks
  const nblocks = Math.floor(n / 4);
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i < nblocks; i++) {
    let k = dv.getUint32(i * 4, true);
    k = wrapMulU32(k, c1);
    k = ((k << 15) | (k >>> 17)) >>> 0;
    k = wrapMulU32(k, c2);
    h ^= k;
    h = ((h << 13) | (h >>> 19)) >>> 0;
    h = wrapAddU32(wrapMulU32(h, 5), 0xe6546b64);
  }
  // Tail
  let k = 0;
  switch (n & 3) {
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: MurmurHash3 tail is an intentional fall-through
    case 3:
      k ^= (bytes[nblocks * 4 + 2] ?? 0) << 16;
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: intentional fall-through
    case 2:
      k ^= (bytes[nblocks * 4 + 1] ?? 0) << 8;
    // falls through
    case 1:
      k ^= bytes[nblocks * 4]!;
      k = wrapMulU32(k, c1);
      k = ((k << 15) | (k >>> 17)) >>> 0;
      k = wrapMulU32(k, c2);
      h ^= k;
  }
  h ^= n;
  // Finalize (fmix32)
  h ^= h >>> 16;
  h = wrapMulU32(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = wrapMulU32(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

const XXH_P32_1 = 0x9e3779b1;
const XXH_P32_2 = 0x85ebca77;
const XXH_P32_3 = 0xc2b2ae3d;
const XXH_P32_4 = 0x27d4eb2f;
const XXH_P32_5 = 0x165667b1;

function rotl32(x: number, r: number): number {
  return ((x << r) | (x >>> (32 - r))) >>> 0;
}

/** xxHash32 accumulator round: acc = rotl(acc + lane·P2, 13)·P1 */
function xxh32Round(acc: number, lane: number): number {
  return wrapMulU32(rotl32(wrapAddU32(acc, wrapMulU32(lane, XXH_P32_2)), 13), XXH_P32_1);
}

/**
 * xxHash32 (XXH32) — extremely fast non-cryptographic hash, per the reference
 * specification (github.com/Cyan4973/xxHash, doc/xxhash_spec.md).
 */
export function xxHash32(data: Uint8Array | string, seed = 0): number {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const n = bytes.length;
  const s = seed >>> 0;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let i = 0;
  let h: number;
  if (n >= 16) {
    let v1 = wrapAddU32(wrapAddU32(s, XXH_P32_1), XXH_P32_2);
    let v2 = wrapAddU32(s, XXH_P32_2);
    let v3 = s;
    let v4 = (s - XXH_P32_1) >>> 0;
    while (i <= n - 16) {
      v1 = xxh32Round(v1, dv.getUint32(i, true));
      v2 = xxh32Round(v2, dv.getUint32(i + 4, true));
      v3 = xxh32Round(v3, dv.getUint32(i + 8, true));
      v4 = xxh32Round(v4, dv.getUint32(i + 12, true));
      i += 16;
    }
    h = wrapAddU32(
      wrapAddU32(rotl32(v1, 1), rotl32(v2, 7)),
      wrapAddU32(rotl32(v3, 12), rotl32(v4, 18)),
    );
  } else {
    h = wrapAddU32(s, XXH_P32_5);
  }
  h = wrapAddU32(h, n >>> 0);
  while (i <= n - 4) {
    h = wrapAddU32(h, wrapMulU32(dv.getUint32(i, true), XXH_P32_3));
    h = wrapMulU32(rotl32(h, 17), XXH_P32_4);
    i += 4;
  }
  while (i < n) {
    h = wrapAddU32(h, wrapMulU32(dv.getUint8(i), XXH_P32_5));
    h = wrapMulU32(rotl32(h, 11), XXH_P32_1);
    i++;
  }
  h = (h ^ (h >>> 15)) >>> 0;
  h = wrapMulU32(h, XXH_P32_2);
  h = (h ^ (h >>> 13)) >>> 0;
  h = wrapMulU32(h, XXH_P32_3);
  h = (h ^ (h >>> 16)) >>> 0;
  return h;
}

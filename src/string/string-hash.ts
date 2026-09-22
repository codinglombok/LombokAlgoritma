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
  const c1 = 0xcc9e2d51, c2 = 0x1b873593;
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
    case 3: k ^= (bytes[nblocks*4+2]! << 16); // falls through
    case 2: k ^= (bytes[nblocks*4+1]! << 8);  // falls through
    case 1: k ^= bytes[nblocks*4]!;
      k = wrapMulU32(k, c1);
      k = ((k << 15) | (k >>> 17)) >>> 0;
      k = wrapMulU32(k, c2);
      h ^= k;
  }
  h ^= n;
  // Finalize (fmix32)
  h ^= h >>> 16; h = wrapMulU32(h, 0x85ebca6b);
  h ^= h >>> 13; h = wrapMulU32(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/** xxHash32 — extremely fast non-crypto hash */
export function xxHash32(data: Uint8Array | string, seed = 0): number {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const PRIME1 = 0x9e3779b1, PRIME2 = 0x85ebca77, PRIME3 = 0xc2b2ae3d;
  const PRIME4 = 0x27d4eb2f, PRIME5 = 0x165667b1;
  let i = 0, h = 0;
  const n = bytes.length;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (n >= 16) {
    let [v1,v2,v3,v4] = [seed+PRIME1+PRIME2, seed+PRIME2, seed, seed-PRIME1].map(v=>v>>>0);
    while (i <= n - 16) {
      const f = (v: number, lane: number) => { v=wrapAddU32(wrapMulU32((v^wrapMulU32(dv.getUint32(i+lane*4,true),PRIME2))>>>0,PRIME1),0);return(((v<<13)|(v>>>19))>>>0); };
      v1=f(v1,0); v2=f(v2,1); v3=f(v3,2); v4=f(v4,3); i+=16;
    }
    h = ((((v1<<1)|(v1>>>31))+(((v2<<7)|(v2>>>25)))+((v3<<12)|(v3>>>20))+((v4<<18)|(v4>>>14)))>>>0);
  } else {
    h = wrapAddU32(seed, PRIME5);
  }
  h = wrapAddU32(h, n);
  while (i <= n - 4) {
    h ^= wrapMulU32(dv.getUint32(i, true), PRIME3);
    h = wrapAddU32(wrapMulU32((h<<17)|(h>>>15),PRIME4), 0);
    i += 4;
  }
  while (i < n) {
    h ^= wrapMulU32(bytes[i]!, PRIME5);
    h = wrapAddU32(wrapMulU32((h<<11)|(h>>>21), PRIME1), 0);
    i++;
  }
  h ^= h >>> 15; h = wrapMulU32(h, PRIME2);
  h ^= h >>> 13; h = wrapMulU32(h, PRIME3);
  h ^= h >>> 16;
  return h >>> 0;
}

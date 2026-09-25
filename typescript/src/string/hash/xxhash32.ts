// LombokAlgoritma — xxHash32 (XXH32)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

import { wrapAddU32, wrapMulU32 } from '../../core/safe-int.js';
import { toBytes } from './bytes.js';

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
  const bytes = toBytes(data);
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

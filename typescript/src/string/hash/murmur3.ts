// LombokAlgoritma — MurmurHash3 x86_32 (Austin Appleby, public domain reference)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

import { wrapAddU32, wrapMulU32 } from '../../core/safe-int.js';
import { toBytes } from './bytes.js';

/** MurmurHash3 32-bit — excellent distribution, used in Bloom filters */
export function murmurHash3_32(data: Uint8Array | string, seed = 0): number {
  const bytes = toBytes(data);
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
      k ^= bytes[nblocks * 4] ?? 0;
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

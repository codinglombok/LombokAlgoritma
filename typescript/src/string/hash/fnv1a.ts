// LombokAlgoritma — FNV-1a (32/64-bit), Fowler–Noll–Vo, draft-eastlake-fnv
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

import { wrapMulU32 } from '../../core/safe-int.js';
import { toBytes } from './bytes.js';

/** FNV-1a 32-bit — fast, deterministic, used by LombokSimHash */
export function fnv1a32(data: Uint8Array | string): number {
  const bytes = toBytes(data);
  let hash = 0x811c9dc5 >>> 0;
  for (const b of bytes) {
    hash ^= b;
    hash = wrapMulU32(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** FNV-1a 64-bit — used by LombokSimHash for 64-bit fingerprints */
export function fnv1a64(data: Uint8Array | string): bigint {
  const bytes = toBytes(data);
  const OFFSET = 0xcbf29ce484222325n;
  const PRIME = 0x00000100000001b3n;
  let hash = OFFSET;
  for (const b of bytes) {
    hash ^= BigInt(b);
    hash = BigInt.asUintN(64, hash * PRIME);
  }
  return hash;
}

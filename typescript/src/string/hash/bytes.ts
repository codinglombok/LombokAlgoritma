// LombokAlgoritma — byte input normalisation for the hash functions
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

/** Strings are hashed as their UTF-8 encoding (SPEC §5.2). */
export function toBytes(data: Uint8Array | string): Uint8Array {
  return typeof data === 'string' ? new TextEncoder().encode(data) : data;
}

/** Little-endian u64 at `off` as an unsigned bigint. */
export function readU64LE(b: Uint8Array, off: number): bigint {
  let v = 0n;
  for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(b[off + i] as number);
  return v;
}

export const MASK64 = 0xffffffffffffffffn;

/** 64-bit rotate left. */
export function rotl64(x: bigint, r: bigint): bigint {
  return ((x << r) | (x >> (64n - r))) & 0xffff_ffff_ffff_ffffn;
}

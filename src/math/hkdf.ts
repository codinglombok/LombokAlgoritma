// LombokAlgoritma — HKDF-SHA-256/512 (RFC 5869)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
// DEPRECATED (v0.1.1): moved to `lombokencryptdecrypt`; removed in v0.2.0.
// DIPAKAI: LombokEncryptDecrypt (key derivation)

import { hmacSha256 } from './sha256.js';

/**
 * HKDF-Extract: PRK = HMAC-SHA256(salt, IKM).
 * @deprecated Dipindah ke `lombokencryptdecrypt`; akan dihapus di v0.2.0. Moved to `lombokencryptdecrypt`; removed in v0.2.0.
 */
export function hkdfExtract(ikm: Uint8Array, salt?: Uint8Array): Uint8Array {
  const s = salt ?? new Uint8Array(32); // default salt = 0x00...00
  return hmacSha256(s, ikm);
}

/**
 * HKDF-Expand: OKM = T(1) || T(2) || ...
 * @deprecated Dipindah ke `lombokencryptdecrypt`; akan dihapus di v0.2.0. Moved to `lombokencryptdecrypt`; removed in v0.2.0.
 */
export function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Uint8Array {
  if (length > 255 * 32) throw new RangeError('HKDF: length exceeds 255 * HashLen');
  const okm = new Uint8Array(length);
  let prev: Uint8Array = new Uint8Array(0);
  let offset = 0;
  for (let i = 1; offset < length; i++) {
    const block = new Uint8Array(prev.length + info.length + 1);
    block.set(prev);
    block.set(info, prev.length);
    block[prev.length + info.length] = i;
    prev = hmacSha256(prk, block);
    const toCopy = Math.min(32, length - offset);
    okm.set(prev.slice(0, toCopy), offset);
    offset += toCopy;
  }
  return okm;
}

/**
 * HKDF one-shot (RFC 5869): Extract + Expand.
 * @deprecated Dipindah ke `lombokencryptdecrypt`; akan dihapus di v0.2.0. Moved to `lombokencryptdecrypt`; removed in v0.2.0.
 */
export function hkdf(
  ikm: Uint8Array,
  length: number,
  { salt, info = new Uint8Array(0) }: { salt?: Uint8Array; info?: Uint8Array } = {},
): Uint8Array {
  const prk = hkdfExtract(ikm, salt);
  return hkdfExpand(prk, info, length);
}

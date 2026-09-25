// LombokAlgoritma — SipHash-2-4 (Aumasson & Bernstein, 2012)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//
// SipHash is a keyed PRF designed for hash-table DoS resistance. It lives here with the other
// non-cryptographic hashes; it is NOT a MAC for protocol use — cryptography is LombokEncryptDecrypt.
import { InvalidInputError } from '../../core/errors.js';
import { MASK64, readU64LE, rotl64, toBytes } from './bytes.js';

/**
 * SipHash-2-4 of `data` under a 16-byte `key` (k0 = key[0..8] LE, k1 = key[8..16] LE); returns the
 * 64-bit output as an unsigned bigint (the reference's little-endian byte string read as u64).
 *
 * @throws RangeError when the key is not 16 bytes
 */
export function sipHash24(key: Uint8Array, data: Uint8Array | string): bigint {
  if (key.length !== 16) throw new InvalidInputError('sipHash24: key must be 16 bytes');
  const m = toBytes(data);
  const k0 = readU64LE(key, 0);
  const k1 = readU64LE(key, 8);
  let v0 = k0 ^ 0x736f6d6570736575n;
  let v1 = k1 ^ 0x646f72616e646f6dn;
  let v2 = k0 ^ 0x6c7967656e657261n;
  let v3 = k1 ^ 0x7465646279746573n;
  const sipRound = (): void => {
    v0 = (v0 + v1) & MASK64;
    v1 = rotl64(v1, 13n) ^ v0;
    v0 = rotl64(v0, 32n);
    v2 = (v2 + v3) & MASK64;
    v3 = rotl64(v3, 16n) ^ v2;
    v0 = (v0 + v3) & MASK64;
    v3 = rotl64(v3, 21n) ^ v0;
    v2 = (v2 + v1) & MASK64;
    v1 = rotl64(v1, 17n) ^ v2;
    v2 = rotl64(v2, 32n);
  };
  const n = m.length;
  const end = n - (n % 8);
  for (let i = 0; i < end; i += 8) {
    const w = readU64LE(m, i);
    v3 ^= w;
    sipRound();
    sipRound();
    v0 ^= w;
  }
  let last = BigInt(n & 0xff) << 56n;
  for (let i = 0; i < n % 8; i++) last |= BigInt(m[end + i] as number) << BigInt(8 * i);
  v3 ^= last;
  sipRound();
  sipRound();
  v0 ^= last;
  v2 ^= 0xffn;
  sipRound();
  sipRound();
  sipRound();
  sipRound();
  return v0 ^ v1 ^ v2 ^ v3;
}

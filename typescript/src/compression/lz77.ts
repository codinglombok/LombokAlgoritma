// LombokAlgoritma — LZ77 (byte-oriented, 255-byte window)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

import { InvalidInputError, OutOfRangeError } from '../core/errors.js';
/**
 * LZ77 with tokens `0x00 literal` or `0x01 offset length` (1 ≤ offset ≤ windowSize ≤ 255,
 * 3 ≤ length ≤ 255; a match may overlap the current position). Greedy longest match; among equally
 * long matches the one with the *largest* offset (earliest start) wins (SPEC §10.2).
 *
 * @throws RangeError when windowSize is not an integer in [1, 255]
 */
export function lz77Compress(input: Uint8Array, windowSize = 255): Uint8Array {
  if (!Number.isInteger(windowSize) || windowSize < 1 || windowSize > 255) {
    throw new OutOfRangeError('lz77Compress: windowSize must be an integer in [1, 255]');
  }
  const out: number[] = [];
  let i = 0;
  while (i < input.length) {
    let bestLen = 0;
    let bestOffset = 0;
    for (let j = Math.max(0, i - windowSize); j < i; j++) {
      let len = 0;
      while (i + len < input.length && input[j + len] === input[i + len] && len < 255) len++;
      if (len > bestLen) {
        bestLen = len;
        bestOffset = i - j;
      }
    }
    if (bestLen >= 3) {
      out.push(1, bestOffset, bestLen);
      i += bestLen;
    } else {
      out.push(0, input[i] as number);
      i++;
    }
  }
  return new Uint8Array(out);
}

/** Inverse of {@link lz77Compress}. @throws RangeError on a malformed token stream */
export function lz77Decompress(input: Uint8Array): Uint8Array {
  const out: number[] = [];
  let i = 0;
  while (i < input.length) {
    const flag = input[i++];
    if (flag === 0) {
      if (i >= input.length) throw new InvalidInputError('lz77Decompress: truncated literal');
      out.push(input[i++] as number);
    } else if (flag === 1) {
      if (i + 1 >= input.length) throw new InvalidInputError('lz77Decompress: truncated match');
      const offset = input[i++] as number;
      const len = input[i++] as number;
      if (offset === 0 || offset > out.length)
        throw new InvalidInputError('lz77Decompress: bad offset');
      const start = out.length - offset;
      for (let j = 0; j < len; j++) out.push(out[start + j] as number);
    } else {
      throw new InvalidInputError(`lz77Decompress: bad token flag ${flag}`);
    }
  }
  return new Uint8Array(out);
}

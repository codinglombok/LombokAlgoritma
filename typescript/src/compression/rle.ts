// LombokAlgoritma — Run-length encoding
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

import { InvalidInputError } from '../core/errors.js';
/**
 * Byte RLE as (count, value) pairs with 1 ≤ count ≤ 255; longer runs are split (SPEC §10.1).
 */
export function rleEncode(data: Uint8Array): Uint8Array {
  const out: number[] = [];
  let i = 0;
  while (i < data.length) {
    const val = data[i] as number;
    let run = 1;
    while (i + run < data.length && data[i + run] === val && run < 255) run++;
    out.push(run, val);
    i += run;
  }
  return new Uint8Array(out);
}

/** Inverse of {@link rleEncode}. @throws RangeError on odd length or a zero count */
export function rleDecode(data: Uint8Array): Uint8Array {
  if (data.length % 2 !== 0) throw new InvalidInputError('rleDecode: input length must be even');
  const out: number[] = [];
  for (let i = 0; i < data.length; i += 2) {
    const run = data[i] as number;
    if (run === 0) throw new InvalidInputError('rleDecode: zero run length');
    const val = data[i + 1] as number;
    for (let j = 0; j < run; j++) out.push(val);
  }
  return new Uint8Array(out);
}

// LombokAlgoritma — canonical JSON (SPEC §3), the byte format every vector runner emits
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

/**
 * Canonical serialisation of a JSON-like value:
 * - no insignificant whitespace; object keys sorted by UTF-16 code unit (keys are ASCII);
 * - finite numbers: ECMAScript Number::toString (shortest round-trip), except −0 → "-0";
 *   NaN / ±Infinity → the JSON *strings* "NaN", "Infinity", "-Infinity";
 * - bigint → decimal digits (a JSON number token);
 * - strings: JSON.stringify escaping (\" \\ \b \f \n \r \t, other C0 controls as \u00xx lowercase),
 *   everything else as raw UTF-8.
 */
export function canonical(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  switch (typeof v) {
    case 'boolean':
      return v ? 'true' : 'false';
    case 'number':
      return formatNumber(v);
    case 'bigint':
      return v.toString();
    case 'string':
      return JSON.stringify(v);
    default:
      break;
  }
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  if (v instanceof Uint8Array) return JSON.stringify(toHex(v));
  const obj = v as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`).join(',')}}`;
}

/** SPEC §3.2 number format. */
export function formatNumber(x: number): string {
  if (Number.isNaN(x)) return '"NaN"';
  if (x === Number.POSITIVE_INFINITY) return '"Infinity"';
  if (x === Number.NEGATIVE_INFINITY) return '"-Infinity"';
  if (Object.is(x, -0)) return '-0';
  return String(x);
}

export function toHex(b: Uint8Array): string {
  let s = '';
  for (const x of b) s += x.toString(16).padStart(2, '0');
  return s;
}

export function fromHex(h: string): Uint8Array {
  if (h.length % 2 !== 0 || /[^0-9a-f]/.test(h)) throw new Error(`bad hex: ${h}`);
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = Number.parseInt(h.slice(2 * i, 2 * i + 2), 16);
  return out;
}

/** u64 → 16 lowercase hex digits (SPEC §3.3). */
export const hex64 = (x: bigint): string => BigInt.asUintN(64, x).toString(16).padStart(16, '0');

/** Integer output: a number when |v| ≤ 2^53 − 1, else a decimal string (SPEC §3.3). */
export function intOut(v: bigint): number | string {
  return v >= -9007199254740991n && v <= 9007199254740991n ? Number(v) : v.toString();
}

/** Integer input: a JSON number or a decimal string. */
export function big(v: unknown): bigint {
  if (typeof v === 'number') {
    if (!Number.isSafeInteger(v)) throw new Error(`not a safe integer: ${v}`);
    return BigInt(v);
  }
  if (typeof v === 'string' && /^-?\d+$/.test(v)) return BigInt(v);
  throw new Error(`not an integer: ${String(v)}`);
}

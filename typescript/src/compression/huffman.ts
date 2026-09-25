// LombokAlgoritma — Static Huffman coding
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { InvalidInputError } from '../core/errors.js';
import { MinHeap, tupleLess } from '../core/heap.js';

/** Huffman tree node: a leaf carries `symbol`; an internal node has both children. */
export interface HuffNode {
  symbol?: number;
  freq: number;
  left?: HuffNode;
  right?: HuffNode;
}

/** Result of {@link huffmanEncode}. */
export interface HuffmanResult {
  /** Code bits packed MSB-first; the last byte is zero-padded. */
  encoded: Uint8Array;
  /** Number of meaningful bits in `encoded`. */
  bitLength: number;
  /** Code of every symbol present, as a '0'/'1' string, keyed by byte value. */
  codes: Map<number, string>;
  tree: HuffNode;
}

/**
 * Static Huffman code (SPEC §10.3, normative so codes are identical in every port):
 * leaves get ids 0, 1, … in ascending byte value, internal nodes get the next ids in creation
 * order; a min-heap keyed by (freq, id) pops `left` then `right`, merged as
 * {freq: left + right}. Left edge = '0', right = '1'; a single-symbol input uses code "0".
 * v0.1.x re-sorted by frequency only, so ties depended on Map iteration order.
 */
export function huffmanEncode(data: Uint8Array): HuffmanResult {
  const codes = new Map<number, string>();
  if (data.length === 0)
    return { encoded: new Uint8Array(0), bitLength: 0, codes, tree: { freq: 0 } };
  const freq = new Array<number>(256).fill(0);
  for (const b of data) freq[b] = (freq[b] as number) + 1;
  const heap = new MinHeap<[number, number, HuffNode]>((a, b) =>
    tupleLess([a[0], a[1]], [b[0], b[1]]),
  );
  let id = 0;
  for (let s = 0; s < 256; s++) {
    const f = freq[s] as number;
    if (f > 0) heap.push([f, id++, { symbol: s, freq: f }]);
  }
  while (heap.size > 1) {
    const [fl, , left] = heap.pop() as [number, number, HuffNode];
    const [fr, , right] = heap.pop() as [number, number, HuffNode];
    heap.push([fl + fr, id++, { freq: fl + fr, left, right }]);
  }
  const tree = (heap.pop() as [number, number, HuffNode])[2];
  const walk = (node: HuffNode, code: string): void => {
    if (node.symbol !== undefined) {
      codes.set(node.symbol, code === '' ? '0' : code);
      return;
    }
    walk(node.left as HuffNode, `${code}0`);
    walk(node.right as HuffNode, `${code}1`);
  };
  walk(tree, '');
  let bitLength = 0;
  for (const b of data) bitLength += (codes.get(b) as string).length;
  const encoded = new Uint8Array(Math.ceil(bitLength / 8));
  let pos = 0;
  for (const b of data) {
    for (const bit of codes.get(b) as string) {
      if (bit === '1') encoded[pos >> 3] = (encoded[pos >> 3] as number) | (1 << (7 - (pos & 7)));
      pos++;
    }
  }
  return { encoded, bitLength, codes, tree };
}

/** Decode `bitLength` bits of `encoded` with `tree`. @throws RangeError on an invalid stream */
export function huffmanDecode(encoded: Uint8Array, bitLength: number, tree: HuffNode): Uint8Array {
  if (bitLength > encoded.length * 8)
    throw new InvalidInputError('huffmanDecode: bitLength exceeds input');
  const out: number[] = [];
  if (bitLength === 0) return new Uint8Array(0);
  if (tree.symbol !== undefined) {
    for (let i = 0; i < bitLength; i++) out.push(tree.symbol);
    return new Uint8Array(out);
  }
  let node = tree;
  for (let i = 0; i < bitLength; i++) {
    const bit = ((encoded[i >> 3] as number) >> (7 - (i & 7))) & 1;
    const next = bit === 1 ? node.right : node.left;
    if (next === undefined) throw new InvalidInputError('huffmanDecode: invalid code');
    node = next;
    if (node.symbol !== undefined) {
      out.push(node.symbol);
      node = tree;
    }
  }
  if (node !== tree) throw new InvalidInputError('huffmanDecode: truncated code');
  return new Uint8Array(out);
}

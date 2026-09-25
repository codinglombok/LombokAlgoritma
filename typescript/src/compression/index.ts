// LombokAlgoritma — Compression module (one file per algorithm)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

export { type HuffmanResult, type HuffNode, huffmanDecode, huffmanEncode } from './huffman.js';
export { lz77Compress, lz77Decompress } from './lz77.js';
export { rleDecode, rleEncode } from './rle.js';

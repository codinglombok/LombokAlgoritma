
/** Run-length encoding */
export function rleEncode(data: Uint8Array): Uint8Array {
  const out: number[] = [];
  let i = 0;
  while (i < data.length) {
    const val = data[i]!;
    let run = 1;
    while (i + run < data.length && data[i + run] === val && run < 255) run++;
    out.push(run, val); i += run;
  }
  return new Uint8Array(out);
}

export function rleDecode(data: Uint8Array): Uint8Array {
  const out: number[] = [];
  for (let i = 0; i + 1 < data.length; i += 2) {
    const run = data[i]!, val = data[i + 1]!;
    for (let j = 0; j < run; j++) out.push(val);
  }
  return new Uint8Array(out);
}

/** LZ77 sliding-window compression (simplified) */
export function lz77Compress(input: Uint8Array, windowSize = 255): Uint8Array {
  const out: number[] = [];
  let i = 0;
  while (i < input.length) {
    let bestLen = 0, bestOffset = 0;
    const lo = Math.max(0, i - windowSize);
    for (let j = lo; j < i; j++) {
      let len = 0;
      while (i + len < input.length && input[j + len] === input[i + len] && len < 255) len++;
      if (len > bestLen) { bestLen = len; bestOffset = i - j; }
    }
    if (bestLen >= 3) {
      out.push(1, bestOffset, bestLen); i += bestLen;
    } else {
      out.push(0, input[i]!); i++;
    }
  }
  return new Uint8Array(out);
}

export function lz77Decompress(input: Uint8Array): Uint8Array {
  const out: number[] = [];
  let i = 0;
  while (i < input.length) {
    const flag = input[i++]!;
    if (flag === 0) {
      out.push(input[i++]!);
    } else {
      const offset = input[i++]!, len = input[i++]!;
      const start = out.length - offset;
      for (let j = 0; j < len; j++) out.push(out[start + j]!);
    }
  }
  return new Uint8Array(out);
}

/** Huffman coding (static frequency-based) */
interface HuffNode { symbol?: number; freq: number; left?: HuffNode; right?: HuffNode; }

export function huffmanEncode(data: Uint8Array): { encoded: Uint8Array; tree: HuffNode } {
  if (data.length === 0) return { encoded: new Uint8Array(0), tree: { freq: 0 } };
  const freq = new Map<number, number>();
  for (const b of data) freq.set(b, (freq.get(b) ?? 0) + 1);
  const nodes: HuffNode[] = [...freq.entries()].map(([s, f]) => ({ symbol: s, freq: f }));
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift()!, right = nodes.shift()!;
    nodes.push({ freq: left.freq + right.freq, left, right });
  }
  const tree = nodes[0]!;
  // Build code table
  const codes = new Map<number, string>();
  function buildCodes(node: HuffNode, code: string): void {
    if (node.symbol !== undefined) { codes.set(node.symbol, code || '0'); return; }
    if (node.left) buildCodes(node.left, code + '0');
    if (node.right) buildCodes(node.right, code + '1');
  }
  buildCodes(tree, '');
  // Encode to bit string then pack into bytes
  const bits = Array.from(data).map(b => codes.get(b)!).join('');
  const outLen = Math.ceil(bits.length / 8);
  const encoded = new Uint8Array(outLen);
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1') encoded[i >> 3]! |= (1 << (7 - (i & 7)));
  }
  return { encoded, tree };
}

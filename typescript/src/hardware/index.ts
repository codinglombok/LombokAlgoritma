import { OutOfRangeError } from '../core/errors.js';
/** SIMD capability detection (browser/Node environment) */
export interface SimdCapabilities {
  wasmSimd: boolean;
  environment: 'browser' | 'node' | 'deno' | 'bun' | 'unknown';
}

/**
 * Local ambient view of the host globals this module probes. Declared here instead of
 * adding lib "DOM" to the whole project, so no other module can accidentally depend on DOM.
 */
interface HostGlobals {
  Deno?: unknown;
  Bun?: unknown;
  process?: { versions?: { node?: string } };
  window?: unknown;
  WebAssembly?: { validate(bytes: Uint8Array): boolean };
}

export function detectSimd(): SimdCapabilities {
  const g = globalThis as unknown as HostGlobals;
  const env: SimdCapabilities['environment'] =
    g.Deno !== undefined
      ? 'deno'
      : g.Bun !== undefined
        ? 'bun'
        : g.process?.versions?.node !== undefined
          ? 'node'
          : g.window !== undefined
            ? 'browser'
            : 'unknown';
  // WASM SIMD detection via WebAssembly.validate
  let wasmSimd = false;
  try {
    const wasm = g.WebAssembly;
    if (wasm !== undefined) {
      // Minimal WASM SIMD probe: v128 const instruction
      const probe = new Uint8Array([
        0x00,
        0x61,
        0x73,
        0x6d, // magic
        0x01,
        0x00,
        0x00,
        0x00, // version
        0x01,
        0x05,
        0x01,
        0x60,
        0x00,
        0x01,
        0x7b, // type: () -> v128
        0x03,
        0x02,
        0x01,
        0x00, // func
        0x0a,
        0x16,
        0x01,
        0x14,
        0x00,
        0xfd,
        0x0c, // code: section 22 B, 1 body of 20 B, 0 locals, v128.const
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x0b,
      ]);
      wasmSimd = wasm.validate(probe);
    }
  } catch {
    /* WASM not available */
  }
  return { wasmSimd, environment: env };
}

/** Memory pool allocator backed by ArrayBuffer */
export class MemoryPool {
  private readonly buffer: ArrayBuffer;
  private readonly view: DataView;
  private offset = 0;

  constructor(sizeBytes: number) {
    this.buffer = new ArrayBuffer(sizeBytes);
    this.view = new DataView(this.buffer);
  }

  alloc(bytes: number, align = 8): number {
    const aligned = (this.offset + align - 1) & ~(align - 1);
    if (aligned + bytes > this.buffer.byteLength)
      throw new OutOfRangeError('MemoryPool: pool exhausted');
    this.offset = aligned + bytes;
    return aligned;
  }

  reset(): void {
    this.offset = 0;
  }

  uint8View(offset: number, length: number): Uint8Array {
    return new Uint8Array(this.buffer, offset, length);
  }

  get used(): number {
    return this.offset;
  }
  get capacity(): number {
    return this.buffer.byteLength;
  }
}

/** Popcount (number of set bits) */
export function popcount(n: number): number {
  let x = n >>> 0;
  x -= (x >> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  return (((x + (x >> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

/** Count leading zeros */
export function clz(n: number): number {
  return n === 0 ? 32 : Math.clz32(n);
}

/** Count trailing zeros */
export function ctz(n: number): number {
  return n === 0 ? 32 : popcount(~n & (n - 1));
}

/** Next power of two */
export function nextPow2(n: number): number {
  if (n <= 1) return 1;
  return 1 << (32 - clz(n - 1));
}

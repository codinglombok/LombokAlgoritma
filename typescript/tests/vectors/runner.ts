// LombokAlgoritma — shared-vector runner (TypeScript port)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { canonical } from './canonical.js';
import { DISPATCH, runCase } from './dispatch.js';

export const VECTOR_FILE = join(
  import.meta.dirname,
  '..',
  '..',
  '..',
  'vectors',
  'lombokalgoritma-vectors-v1.json',
);

interface VectorCase {
  id: string;
  input: unknown;
  expected: unknown;
}
interface VectorDoc {
  format: string;
  version: number;
  groups: Record<string, VectorCase[]>;
}

export interface RunReport {
  /** `group<TAB>id<TAB>canonical(actual)` per case, groups in sorted order (SPEC §4.0). */
  lines: string[];
  failures: string[];
  missing: string[];
  cases: number;
}

export function runVectors(file = VECTOR_FILE): RunReport {
  const doc = JSON.parse(readFileSync(file, 'utf8')) as VectorDoc;
  if (doc.format !== 'lombokalgoritma-vectors' || doc.version !== 1)
    throw new Error('unsupported vector file');
  const lines: string[] = [];
  const failures: string[] = [];
  const missing: string[] = [];
  let cases = 0;
  for (const group of Object.keys(doc.groups).sort()) {
    if (DISPATCH[group] === undefined) {
      missing.push(group);
      continue;
    }
    for (const c of doc.groups[group] ?? []) {
      cases++;
      const got = canonical(runCase(group, c.input));
      lines.push(`${group}\t${c.id}\t${got}`);
      const want = canonical(c.expected);
      if (got !== want) failures.push(`${group}/${c.id}: expected ${want}, got ${got}`);
    }
  }
  return { lines, failures, missing, cases };
}

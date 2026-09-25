// LombokAlgoritma — run the shared vectors and print canonical results (for the cross-port diff)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//   npx tsx scripts/run-vectors.ts [--out FILE]
import { writeFileSync } from 'node:fs';
import { runVectors } from '../tests/vectors/runner.js';

const r = runVectors();
const outIdx = process.argv.indexOf('--out');
const text = `${r.lines.join('\n')}\n`;
if (outIdx !== -1) writeFileSync(process.argv[outIdx + 1] as string, text);
else process.stdout.write(text);
for (const f of r.failures) console.error(`FAIL ${f}`);
for (const g of r.missing) console.error(`MISSING group ${g}`);
console.error(
  `typescript: ${r.cases} cases, ${r.failures.length} failures, ${r.missing.length} missing groups`,
);
process.exit(r.failures.length + r.missing.length > 0 ? 1 : 0);

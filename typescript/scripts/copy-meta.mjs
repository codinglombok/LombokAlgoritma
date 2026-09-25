// LombokAlgoritma — copy repository metadata into the npm package directory before `npm pack`
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { copyFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');
for (const f of ['README.md', 'LICENSE-APACHE', 'LICENSE-MIT', 'CHANGELOG.md']) {
  copyFileSync(join(root, f), join(import.meta.dirname, '..', f));
}

// LombokAlgoritma — build configuration
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//
// Produces exactly the paths referenced by package.json "exports":
//   dist/esm/<entry>.js      (ESM)
//   dist/cjs/<entry>.js      (CommonJS; dist/cjs/package.json marks the folder "commonjs")
//   dist/types/<entry>.d.ts  (declarations)
import { writeFileSync } from 'node:fs';
import { type Options, defineConfig } from 'tsup';

const modules = [
  'sort',
  'search',
  'graph',
  'math',
  'string',
  'compression',
  'datastructure',
  'geometry',
  'ml',
  'concurrent',
  'hardware',
] as const;

const entry: Record<string, string> = { index: 'src/index.ts' };
for (const m of modules) entry[`${m}/index`] = `src/${m}/index.ts`;

const shared: Options = {
  entry,
  target: 'es2020',
  platform: 'neutral',
  sourcemap: true,
  treeshake: true,
  splitting: true, // shared chunks → one copy of each class across subpaths
  clean: false,
  minify: false,
};

export default defineConfig([
  {
    ...shared,
    format: 'esm',
    outDir: 'dist/esm',
    outExtension: () => ({ js: '.js' }),
  },
  {
    ...shared,
    format: 'cjs',
    outDir: 'dist/cjs',
    outExtension: () => ({ js: '.js' }),
    onSuccess: async () => {
      // package.json has "type": "module"; mark the CJS folder explicitly
      writeFileSync('dist/cjs/package.json', `${JSON.stringify({ type: 'commonjs' })}\n`);
    },
  },
  {
    entry,
    outDir: 'dist/types',
    format: 'esm',
    dts: { only: true },
    clean: false,
  },
]);

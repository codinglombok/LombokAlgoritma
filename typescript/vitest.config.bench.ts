import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/bench/**/*.bench.ts'],
    benchmark: {
      include: ['tests/bench/**/*.bench.ts'],
      outputFile: 'bench-results.json',
    },
    testTimeout: 120000,
  },
});

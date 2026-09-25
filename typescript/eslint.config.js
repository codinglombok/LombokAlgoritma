// @ts-check
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts', 'scripts/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs['strict-type-checked'].rules,
      'no-eval': 'error',
      'no-implied-eval': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      // Indexed access under noUncheckedIndexedAccess: use an explicit `as T` after a bounds check.
      '@typescript-eslint/no-non-null-assertion': 'error',
      // Deprecated aliases (e.g. convexHullGraham) remain until v0.3.0.
      '@typescript-eslint/no-deprecated': 'error',
      // TypeScript performs this check; see typescript-eslint "no-undef" guidance.
      'no-undef': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],
      'no-fallthrough': ['error', { commentPattern: 'falls?\\s?through|biome-ignore' }],
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      // Constant-time enforcement: forbid secret-dependent branches
      'no-bitwise': 'off', // bitwise IS encouraged for constant-time ops
    },
  },
  {
    files: ['tests/**/*.ts', 'scripts/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-deprecated': 'off',
    },
  },
  {
    // The vector dispatch table reads untyped JSON input by design (SPEC §4.2).
    files: ['tests/vectors/dispatch.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.js', 'scripts/*.mjs'],
  },
];

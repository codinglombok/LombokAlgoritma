// @ts-check
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
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
      // Indexed access under noUncheckedIndexedAccess: `!` after an explicit bounds check is
      // the documented idiom in hot loops; reported as a warning, tracked for v0.2.0.
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // v0.1.1 intentionally still re-exports the deprecated crypto API (removed in v0.2.0).
      '@typescript-eslint/no-deprecated': 'warn',
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
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-deprecated': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'ports/**', 'rust/**', 'go/**', 'coverage/**', '*.js'],
  },
];

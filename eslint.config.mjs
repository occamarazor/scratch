import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import globals from 'globals';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import sonarjs from 'eslint-plugin-sonarjs';
import preferArrow from 'eslint-plugin-prefer-arrow';
import noNull from 'eslint-plugin-no-null';

import typescriptPlugin from '@typescript-eslint/eslint-plugin';

const compat = new FlatCompat({});

export default [
  // Base ESLint recommended
  js.configs.recommended,

  // TypeScript ESLint recommended config (parser is auto-configured by plugin)
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
  ),

  // Prettier integration
  prettierRecommended,

  // Custom rules
  {
    ignores: ['.eslintrc.js', 'eslint.config.mjs'],

    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 'latest',
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
      sonarjs,
      'prefer-arrow': preferArrow,
      'no-null': noNull,
      '@typescript-eslint': typescriptPlugin,
    },

    rules: {
      // TypeScript-specific (tune as desired)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // Prettier
      'prettier/prettier': 'error',

      // Import sorting
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Remove unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // SonarJS rules
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-small-switch': 'warn',

      // Prefer arrow functions
      'prefer-arrow/prefer-arrow-functions': [
        'warn',
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false,
        },
      ],

      // No null (stylistic)
      'no-null/no-null': 'warn',
    },
  },
];

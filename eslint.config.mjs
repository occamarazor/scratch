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
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const compat = new FlatCompat({});

export default [
  // Base ESLint recommended
  js.configs.recommended,

  // TS ESLint recommended via compat
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
  ),

  // Prettier integration (compat handles this)
  prettierRecommended,

  // Custom rules
  {
    // Files / patterns to ignore
    ignores: [
      '.eslintrc.js',
      'eslint.config.mjs',

      // Node modules / package manager
      'node_modules/',
      '.pnpm-store/',
      '.pnp.*',

      // Build / compiled output
      'dist/',
      'build/',

      // TypeScript cache / artifacts
      '*.tsbuildinfo',

      // Coverage
      'coverage/',
      '.nyc_output/',

      // Editor
      '.vscode/',
      '.idea/',
      '*.swp',
      '*.swo',

      // OS
      '.DS_Store',

      // Logs
      'logs/',
      '*.log',
      'npm-debug.log*',
      'pnpm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',

      // Environments (keep committed .env.dev)
      '.env',
      '.env.local',
      '*.env.local',

      // Compiled JS (lint only TS)
      '**/*.js',
      '**/*.map',
      '**/*.d.ts',

      // Compiled Migrations (lint only TS sources)
      'src/migrations/**/*.js',

      // Temp
      '.tmp/',
      '.temp/',

      // Runtime data
      'pids',
      '*.pid',
      '*.seed',
      '*.pid.lock',

      // Diagnostic reports
      'report.*.json',
    ],

    // TS parser used to enable project-aware rules
    languageOptions: {
      sourceType: 'module',
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        project: './tsconfig.json',
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    // eslint-plugin-import helper: resolves tsconfig paths
    // (requires eslint-import-resolver-typescript)
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
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

    // Report unused eslint-disable directives (helps keep code clean)
    reportUnusedDisableDirectives: true,

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

    // Overrides for tests (faster & avoids type-checked linting on test files)
    overrides: [
      {
        files: ['**/*.spec.ts', '**/*.test.ts', 'test/**'],
        languageOptions: {
          globals: {
            ...globals.jest,
            ...globals.node,
          },
          // For tests we don't need type-aware rules (faster). Remove project to disable type-checking.
          parserOptions: {
            ecmaVersion: 'latest',
            // project: undefined,
          },
        },
        rules: {
          // Relax rules for tests if necessary
          '@typescript-eslint/no-floating-promises': 'off',
        },
      },
    ],
  },
];

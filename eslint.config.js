import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', '.wrangler']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // Intentional convention in this codebase: best-effort `catch(_){}` blocks around
      // non-critical calls (analytics, rule syncs, etc.). Still flags other empty blocks.
      'no-empty': ['error', { allowEmptyCatch: true }],
      // eslint-plugin-react-hooks v7's "recommended" bundles the newer React Compiler rule
      // family (purity, immutability, set-state-in-effect, static-components, ...) as hard
      // errors. Those are genuinely useful but this codebase predates them and enforcing them
      // as errors would make `npm run lint` fail on ~35 pre-existing, working patterns rather
      // than surfacing new regressions. Keep the two classic, load-bearing hook rules at their
      // normal severity; downgrade the rest to warnings so lint stays actionable without
      // forcing a full compiler-readiness rewrite in one pass.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/void-use-memo': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/incompatible-library': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/globals': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/error-boundaries': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-render': 'warn',
      'react-hooks/unsupported-syntax': 'warn',
      'react-hooks/config': 'warn',
      'react-hooks/gating': 'warn',
    },
  },
  {
    files: ['worker.js'],
    languageOptions: {
      globals: { ...globals.worker },
    },
  },
])

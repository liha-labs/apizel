import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'off' // TS側で見るので雑に切る
    },
  },
  {
    ignores: ['**/dist/**', '**/.turbo/**', '**/node_modules/**'],
  },
]

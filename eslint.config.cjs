const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

module.exports = [
   {
      ignores: ['node_modules/**', 'coverage/**', 'dist/**', 'public/**'],
   },
   {
      files: ['**/*.js'],
      languageOptions: {
         ecmaVersion: 'latest',
         sourceType: 'commonjs',
         globals: {
            ...globals.node,
         },
      },
      rules: {
         ...js.configs.recommended.rules,
         'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
         'no-console': 'off',
         'no-unused-vars': [
            'warn',
            {
               argsIgnorePattern: '^_',
               varsIgnorePattern: '^_',
               caughtErrorsIgnorePattern: '^_',
            },
         ],
      },
   },
   prettier,
];

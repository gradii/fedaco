import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.lib.json', 'tsconfig.spec.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': ['off'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-empty-function': ['off'],
      '@typescript-eslint/explicit-member-accessibility': ['warn'],
      'arrow-body-style': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-empty': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      // 'no-sequences': 'error',
      // '@typescript-eslint/no-confusing-void-expression': 'error',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      'no-useless-catch': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'prefer-rest-params': 'off',
      'prefer-spread': 'off',
      'prefer-const': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      'no-unsafe-optional-chaining': 'off',

      '@stylistic/key-spacing': [
        'error',
        {
          beforeColon: false,
          afterColon: true,
          mode: 'strict',
          align: 'colon',
          ignoredNodes: [
            'ExportNamedDeclaration',
            'ExportAllDeclaration',
            'TSInterfaceBody',
            'ClassBody',
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      'prefer-const': 'warn',
    },
  },
];

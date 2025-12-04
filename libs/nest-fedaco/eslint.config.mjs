import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
    rules: {},
  },
  {
    files: ['*.js', '*.jsx'],
    rules: {},
  },
  {
    files: ['*.ts', '*.tsx'],
    rules: {},
  },
  {
    files: ['*.json'],
    parser: 'jsonc-eslint-parser',
    rules: {
      '@nx/dependency-checks': 'error',
    },
  },
];

/* eslint-disable */
/* eslint-disable */
export default {
  displayName: 'fedaco',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  globals: {},
  maxWorkers: 1,
  coverageDirectory: '../../coverage/libs/fedaco',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [],
};

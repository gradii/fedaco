/* eslint-disable */
/* eslint-disable */
export default {
  displayName: "fedaco",
  preset: "../../jest.preset.js",
  setupFilesAfterEnv: ["<rootDir>/test-setup.ts"],
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
      stringifyContentPathRegex: "\\.(html|svg)$",
    },
  },
  coverageDirectory: "../../coverage/libs/fedaco",
  transform: {
    "^.+\\.(ts|js|html)$": "ts-jest",
  },
  snapshotSerializers: [],
};

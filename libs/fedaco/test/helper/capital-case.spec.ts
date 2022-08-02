import { capitalCase } from '../../src/helper/str';

const TEST_CASES: [string, string][] = [
  ['', ''],
  ['test', 'Test'],
  ['test string', 'Test String'],
  ['Test String', 'Test String'],
  ['TestV2', 'Test V2'],
  ['version 1.2.10', 'Version 1 2 10'],
  ['version 1.21.0', 'Version 1 21 0'],
];

describe('capital case', () => {
  for (const [input, result] of TEST_CASES) {
    it(`${input} -> ${result}`, () => {
      expect(capitalCase(input)).toEqual(result);
    });
  }
});

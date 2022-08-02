import { swapCase } from '../../src/helper/str';

const TEST_CASES: [string, string][] = [
  ['', ''],
  ['test', 'TEST'],
  ['test string', 'TEST STRING'],
  ['Test String', 'tEST sTRING'],
  ['TestV2', 'tESTv2'],
  ['sWaP cAsE', 'SwAp CaSe'],
];

describe('swap case', () => {
  for (const [input, result] of TEST_CASES) {
    it(`${input} -> ${result}`, () => {
      expect(swapCase(input)).toEqual(result);
    });
  }
});

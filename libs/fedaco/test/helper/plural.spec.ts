import { plural } from '../../src/helper/pluralize';

const TEST_CASES: [string, string][] = [
  ['', ''],
  ['test', 'tests'],
  ['TEST', 'TESTS'],
  ['test string', 'test strings'],
  ['test_string', 'test_strings'],
];

describe('plural case', () => {
  for (const [input, result] of TEST_CASES) {
    it(`${input} -> ${result}`, () => {
      expect(plural(input)).toEqual(result);
    });
  }
});


import { pluralStudy } from '../../src/helper/pluralize';

const TEST_CASES: [string, string][] = [
  ['', ''],
  ['test', 'tests'],
  ['TEST', 'TESTS'],
  ['test string', 'test_strings'],
  ['test_string', 'test_strings'],
];

describe('plural study case', () => {
  for (const [input, result] of TEST_CASES) {
    it(`${input} -> ${result}`, () => {
      expect(pluralStudy(input)).toEqual(result);
    });
  }
});


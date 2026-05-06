import { plural, pluralStudly, singular } from '@gradii/nanofn';

describe('plural', () => {
  test('Pluralize', () => {
    const value = plural('apple');
    expect(value).toBe('apples');
  });

  test('Pluralize 3', () => {
    const value = singular('singles');
    expect(value).toBe('single');
  });
  test('Pluralize 5', () => {
    const value = plural('irregular');

    expect(value).toBe('irregulars');
  });
  test('Pluralize 7', () => {
    const value = plural('paper');
    expect(value).toBe('papers');
  });

  test('pluralize study', () => {
    const value = pluralStudly('fedaco_builder_test_model_close_related_stub');
    expect(value).toBe('fedaco_builder_test_model_close_related_stubs');
  });
});

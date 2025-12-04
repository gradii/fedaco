import { SchemaGrammar } from '../src/schema/grammar/schema-grammar';

describe('test database abstract schema grammar', () => {
  it('create database', () => {
    const grammar = new (class extends SchemaGrammar {})();

    expect(() => {
      // @ts-ignore
      grammar.compileCreateDatabase('foo', {});
    }).toThrow('LogicException This database driver does not support creating databases.');
  });
  it('drop database if exists', () => {
    const grammar = new (class extends SchemaGrammar {})();
    expect(() => {
      // @ts-ignore
      grammar.compileDropDatabaseIfExists('foo');
    }).toThrow('LogicException This database driver does not support dropping databases.');
  });
});

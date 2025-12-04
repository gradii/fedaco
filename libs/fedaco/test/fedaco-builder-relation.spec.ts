/* tslint:disable:max-line-length */
import { type DatabaseTransactionsManager } from '../src/database-transactions-manager';
import { type FedacoBuilder } from '../src/fedaco/fedaco-builder';
import { Model } from '../src/fedaco/model';
import { type ConnectionResolverInterface } from '../src/interface/connection-resolver-interface';
import { type ConnectionInterface } from '../src/query-builder/connection-interface';
import { MysqlQueryGrammar } from '../src/query-builder/grammar/mysql-query-grammar';
import { Processor } from '../src/query-builder/processor';
import { type JoinClauseBuilder, QueryBuilder } from '../src/query-builder/query-builder';
import { type SchemaBuilder } from '../src/schema/schema-builder';
import {
  FedacoBuilderTestModelCloseRelatedStub, FedacoBuilderTestModelParentStub
} from './model/fedaco-builder-test-model-parent-stub';
import {
  FedacoBuilderTestModelSelfRelatedStub
} from './model/fedaco-builder-test-model-self-related-stub';

describe('fedaco builder relation', () => {

  class Conn implements ConnectionInterface {
    getQueryGrammar(): any {

    }

    getDatabaseName(): string {
      return 'default-database';
    }

    getPostProcessor(): any {

    }

    query(): QueryBuilder {
      return new QueryBuilder(
        this,
        new MysqlQueryGrammar(),
        new Processor()
      );
    }

    async select() {
      return await Promise.resolve();
    }

    async insert(sql: string, bindings: any[]): Promise<boolean> {
      throw new Error('not implement');
    }

    async update() {
    }

    async delete() {
    }

    async statement() {
    }

    async affectingStatement() {
    }

    getName() {
      return '';
    }

    getConfig(name: string): any {
    }

    getPdo(): any {
    }

    getSchemaBuilder(): SchemaBuilder {
      return undefined;
    }

    recordsHaveBeenModified(): any {
    }

    selectFromWriteConnection(sql: string, values: any): any {
    }

    table(table: Function | QueryBuilder | string, as?: string): QueryBuilder {
      return undefined;
    }

    insertGetId(sql: string, bindings: any[], sequence?: string): Promise<any> | boolean {
      return undefined;
    }

    _transactions: number;
    _transactionsManager: DatabaseTransactionsManager;

    afterCommit(callback: Function): Promise<void> {
      return Promise.resolve(undefined);
    }

    beginTransaction(): Promise<void> {
      return Promise.resolve(undefined);
    }

    commit(): Promise<void> {
      return Promise.resolve(undefined);
    }

    rollBack(toLevel?: number | null): Promise<void> {
      return Promise.resolve(undefined);
    }

    setTablePrefix(prefix: string): any {
    }

    setTransactionManager(manager: DatabaseTransactionsManager): this {
      return undefined;
    }

    transaction(callback: (...args: any[]) => Promise<any>, attempts?: number): Promise<any> {
      return Promise.resolve(undefined);
    }

    transactionLevel(): number {
      return 0;
    }

    unsetTransactionManager(): void {
    }
  }

  beforeAll(() => {
    const connection = new Conn();

    const resolver: ConnectionResolverInterface = {
      getDefaultConnection(): any {
      },
      setDefaultConnection(name: string): any {
      },
      connection() {
        return connection;
      }
    };
    (Model as typeof Model).setConnectionResolver(resolver);
  });

  it('test with count', () => {
    const model1 = new FedacoBuilderTestModelParentStub();

    const builder1 = model1.NewQuery().withCount('foo');
    const result   = builder1.toSql();

    expect(result.result).toBe(
      'SELECT `fedaco_builder_test_model_parent_stubs`.*, (SELECT count(*) FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id`) AS `foo_count` FROM `fedaco_builder_test_model_parent_stubs`');
  });

  it('test with count and select', () => {
    const model1 = new FedacoBuilderTestModelParentStub();

    const builder1 = model1.NewQuery().select('id').withCount('foo');
    const result   = builder1.toSql();

    expect(result.result).toBe(
      'SELECT `id`, (SELECT count(*) FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id`) AS `foo_count` FROM `fedaco_builder_test_model_parent_stubs`');
  });

  it('test with count and merged wheres', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().select('id').withCount({
      'activeFoo': (q: FedacoBuilder) => {
        q.where('bam', '>', 'qux');
      }
    });

    const result = builder.toSql();

    expect(result).toEqual({
      result  : 'SELECT `id`, (SELECT count(*) FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id` AND `bam` > ? AND `active` = ?) AS `active_foo_count` FROM `fedaco_builder_test_model_parent_stubs`',
      bindings: ['qux', true]
    });
  });

  it('test with count and global scope', () => {
    const model = new FedacoBuilderTestModelParentStub();

    FedacoBuilderTestModelCloseRelatedStub.addGlobalScope('withCount', (q: FedacoBuilder) => {
      return q.addSelect('id');
    });
    const builder = model.NewQuery().select('id').withCount(['foo']);

    FedacoBuilderTestModelCloseRelatedStub.addGlobalScope('withCount', (q: FedacoBuilder) => {
    });
    const result = builder.toSql();

    expect(result.result).toBe(
      'SELECT `id`, (SELECT count(*) FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id`) AS `foo_count` FROM `fedaco_builder_test_model_parent_stubs`');

  });

  it('test with count and constraints and having', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    // @ts-ignore
    const builder = model.NewQuery().where('bar', 'baz');
    builder.withCount({
      'foo': (q: FedacoBuilder) => {
        q.where('bam', '>', 'qux');
      }
    }).having('foo_count', '>=', 1);

    const result = builder.toSql();


    expect(result.result).toBe(
      'SELECT `fedaco_builder_test_model_parent_stubs`.*, (SELECT count(*) FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id` AND `bam` > ?) AS `foo_count` FROM `fedaco_builder_test_model_parent_stubs` WHERE `bar` = ? HAVING `foo_count` >= ?');

    expect(result.bindings).toEqual(['qux', 'baz', 1]);

  });

  it('test with count and rename', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().withCount('foo as foo_bar');

    const result = builder.toSql();

    expect(result.result).toBe(
      'SELECT `fedaco_builder_test_model_parent_stubs`.*, (SELECT count(*) FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id`) AS `foo_bar` FROM `fedaco_builder_test_model_parent_stubs`');

  });

  it('test with count multiple and partial rename', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().withCount(['foo as foo_bar', 'foo']);

    const result = builder.toSql();

    expect(result.result).toBe(
      'SELECT `fedaco_builder_test_model_parent_stubs`.*, (SELECT count(*) FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id`) AS `foo_bar`, (SELECT count(*) FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id`) AS `foo_count` FROM `fedaco_builder_test_model_parent_stubs`');
  });
  it('test has with constraints and having in subquery', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().where('bar', 'baz');
    builder.whereHas('foo', (q: FedacoBuilder) => {
      q.having('bam', '>', 'qux');
    }).where('quux', 'quuux');

    const result = builder.toSql();

    expect(result.result).toBe(
      'SELECT * FROM `fedaco_builder_test_model_parent_stubs` WHERE `bar` = ? AND EXISTS (SELECT * FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id` HAVING `bam` > ?) AND `quux` = ?');

    expect(result.bindings).toEqual(['baz', 'qux', 'quuux']);
  });

  it('test has with constraints with or where and having inSubquery', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().where('name', 'larry');
    builder.whereHas('address', (q: FedacoBuilder) => {
      q.where((q: FedacoBuilder) => {
        q.where('zipcode', '90210');
        q.orWhere('zipcode', '90220');
      });
      q.having('street', '=', 'fooside dr');
    }).where('age', 29);

    const result = builder.toSql();

    expect(result.result).toBe(
      'SELECT * FROM `fedaco_builder_test_model_parent_stubs` WHERE `name` = ? AND EXISTS (SELECT * FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id` AND (`zipcode` = ? OR `zipcode` = ?) HAVING `street` = ?) AND `age` = ?');

    expect(result.bindings).toEqual(['larry', '90210', '90220', 'fooside dr', 29]);
  });

  it('test has with constraints and join and having in subquery', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().where('bar', 'baz');
    builder.whereHas('foo', (q: FedacoBuilder) => {
      q.join('quuuux', (j: JoinClauseBuilder) => {
        j.where('quuuuux', '=', 'quuuuuux');
      });
      q.having('bam', '>', 'qux');
    }).where('quux', 'quuux');

    const result = builder.toSql();

    expect(result.result).toBe(
      'SELECT * FROM `fedaco_builder_test_model_parent_stubs` WHERE `bar` = ? AND EXISTS (SELECT * FROM `fedaco_builder_test_model_close_related_stubs` INNER JOIN `quuuux` ON `quuuuux` = ? WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id` HAVING `bam` > ?) AND `quux` = ?');

    expect(result.bindings).toEqual(['baz', 'quuuuuux', 'qux', 'quuux']);
  });

  it('test has with constraints and having in subquery with count', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().where('bar', 'baz');
    builder.whereHas('foo', (q: FedacoBuilder) => {
      q.having('bam', '>', 'qux');
    }, '>=', 2).where('quux', 'quuux');

    const result = builder.toSql();

    expect(result.result).toBe(
      'SELECT * FROM `fedaco_builder_test_model_parent_stubs` WHERE `bar` = ? AND (SELECT count(*) FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id` HAVING `bam` > ?) >= 2 AND `quux` = ?');

    expect(result.bindings).toEqual(['baz', 'qux', 'quuux']);

  });

  it('test with count and constraints with binding in select sub', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery();
    builder.withCount({
      'foo': (q: FedacoBuilder) => {
        q.selectSub(
          model.NewQuery()
            .where('bam', '=', 3)
            .selectRaw('count(0)'),
          'bam_3_count'
        );
      }
    });

    const result = builder.toSql();

    expect(result.result).toBe(
      'SELECT `fedaco_builder_test_model_parent_stubs`.*, (SELECT count(*) FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id`) AS `foo_count` FROM `fedaco_builder_test_model_parent_stubs`');

    expect(result.bindings).toEqual([]);
  });

  it('test has nested with constraints', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().whereHas('foo', (q: FedacoBuilder) => {
      q.whereHas('bar', (q: FedacoBuilder) => {
        q.where('baz', 'bam');
      });
    }).toSql();
    const result  = model.NewQuery().whereHas('foo.bar', (q: FedacoBuilder) => {
      q.where('baz', 'bam');
    }).toSql();
    expect(builder.result).toBe(result.result);
  });

  it('test has nested', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().whereHas('foo', (q: FedacoBuilder) => {
      q.has('bar');
    });
    const result  = model.NewQuery().has('foo.bar').toSql();
    expect(result).toEqual(builder.toSql());
  });
  it('test or has nested', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().whereHas('foo', (q: FedacoBuilder) => {
      q.has('bar');
    }).orWhereHas('foo', (q: FedacoBuilder) => {
      q.has('baz');
    });
    const result  = model.NewQuery().has('foo.bar').orHas('foo.baz').toSql();

    expect(builder.toSql().result).toBe(
      'SELECT * FROM `fedaco_builder_test_model_parent_stubs` WHERE EXISTS (SELECT * FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id` AND EXISTS (SELECT * FROM `fedaco_builder_test_model_far_related_stubs` WHERE `fedaco_builder_test_model_close_related_stubs`.`id` = `fedaco_builder_test_model_far_related_stubs`.`fedaco_builder_test_model_close_related_stubs_id`)) OR EXISTS (SELECT * FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id` AND EXISTS (SELECT * FROM `fedaco_builder_test_model_far_related_stubs` WHERE `fedaco_builder_test_model_close_related_stubs`.`id` = `fedaco_builder_test_model_far_related_stubs`.`fedaco_builder_test_model_close_related_stubs_id`))'
    );
    expect(builder.toSql().result).toBe(result.result);
  });
  it('test self has nested', () => {
    const model        = new FedacoBuilderTestModelSelfRelatedStub();
    const nestedSql    = model.NewQuery().whereHas('parentFoo', (q: FedacoBuilder) => {
      q.has('childFoo');
    }).toSql();
    const dotSql       = model.NewQuery().has('parentFoo.childFoo').toSql();
    const alias        = 'self_alias_hash';
    const aliasRegex   = /\b(fedaco_reserved_\d)(\b|$)/ig;
    const nestedSqlStr = nestedSql.result.replace(aliasRegex, alias);
    const dotSqlStr    = dotSql.result.replace(aliasRegex, alias);
    expect(dotSqlStr).toBe(nestedSqlStr);
    expect(dotSqlStr).toMatchSnapshot();
  });

  it('test self has nested uses alias', () => {
    const model      = new FedacoBuilderTestModelSelfRelatedStub();
    let sql          = model.NewQuery().has('parentFoo.childFoo').toSql().result;
    const alias      = 'self_alias_hash';
    const aliasRegex = /\b(fedaco_reserved_\d)(\b|$)/ig;
    sql              = sql.replace(aliasRegex, alias);
    expect(sql).toContain('`self_alias_hash`.`id` = `self_related_stubs`.`parent_id`',);
    expect(sql).toMatchSnapshot();
  });

  it('test doesnt have', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().doesntHave('foo');

    const result = builder.toSql();

    expect(result.result).toBe(
      'SELECT * FROM `fedaco_builder_test_model_parent_stubs` WHERE NOT EXISTS (SELECT * FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id`)');
  });

  it('test doesnt have nested', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().doesntHave('foo.bar');

    const result = builder.toSql();

    expect(result.result).toBe(
      'SELECT * FROM `fedaco_builder_test_model_parent_stubs` WHERE NOT EXISTS (SELECT * FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id` AND EXISTS (SELECT * FROM `fedaco_builder_test_model_far_related_stubs` WHERE `fedaco_builder_test_model_close_related_stubs`.`id` = `fedaco_builder_test_model_far_related_stubs`.`fedaco_builder_test_model_close_related_stubs_id`))');
  });

  it('test or doesnt have', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().where('bar', 'baz').orDoesntHave('foo');

    const result = builder.toSql();

    expect(result).toEqual({
      result  : 'SELECT * FROM `fedaco_builder_test_model_parent_stubs` WHERE `bar` = ? OR NOT EXISTS (SELECT * FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id`)',
      bindings: ['baz']
    });
  });

  it('test where doesnt have', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().whereDoesntHave('foo', (q: FedacoBuilder) => {
      q.where('bar', 'baz');
    });

    const result = builder.toSql();

    expect(result).toEqual(
      {
        result  : 'SELECT * FROM `fedaco_builder_test_model_parent_stubs` WHERE NOT EXISTS (SELECT * FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id` AND `bar` = ?)',
        bindings: ['baz']
      });
  });

  it('test or where doesnt have', () => {
    const model   = new FedacoBuilderTestModelParentStub();
    const builder = model.NewQuery().where('bar', 'baz').orWhereDoesntHave('foo',
      (q: FedacoBuilder) => {
        q.where('qux', 'quux');
      });

    const result = builder.toSql();

    expect(result).toEqual(
      {
        result  : 'SELECT * FROM `fedaco_builder_test_model_parent_stubs` WHERE `bar` = ? OR NOT EXISTS (SELECT * FROM `fedaco_builder_test_model_close_related_stubs` WHERE `fedaco_builder_test_model_parent_stubs`.`foo_id` = `fedaco_builder_test_model_close_related_stubs`.`id` AND `qux` = ?)',
        bindings: ['baz', 'quux']
      });
  });


});

/* tslint:disable:max-line-length */
import { DatabaseTransactionsManager } from '../src/database-transactions-manager';
import { raw } from '../src/query-builder/ast-factory';
import { ConnectionInterface } from '../src/query-builder/connection-interface';
import { MysqlQueryGrammar } from '../src/query-builder/grammar/mysql-query-grammar';
import { PostgresQueryGrammar } from '../src/query-builder/grammar/postgres-query-grammar';
import { SqliteQueryGrammar } from '../src/query-builder/grammar/sqlite-query-grammar';
import { SqlserverQueryGrammar } from '../src/query-builder/grammar/sqlserver-query-grammar';
import { Processor } from '../src/query-builder/processor';
import { MysqlProcessor } from '../src/query-builder/processor/mysql-processor';
import { PostgresProcessor } from '../src/query-builder/processor/postgres-processor';
import { SqlServerProcessor } from '../src/query-builder/processor/sql-server-processor';
import { JoinClauseBuilder, QueryBuilder } from '../src/query-builder/query-builder';
import { SchemaBuilder } from '../src/schema/schema-builder';


/**
 * this.assertSame\((.+?), (.+?)\)$
 * expect($2).toBe( $1);
 *
 * this.assertEquals\(([\s\S]+?), ([\s\S]+?)\)$
 * expect($2).toStrictEqual( $1);
 *
 * public (.+?)\(\) \{
 * it('$1', ()=>{
 */

describe('database query builder test', () => {
  let builder: QueryBuilder;

  class Conn implements ConnectionInterface {
    async select() {
    }

    async insert(sql: string, bindings: any[]): Promise<boolean> {
      return false;
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

    insertGetId(sql: string, bindings: any[], sequence?: string): Promise<any> | boolean {
      return undefined;
    }

    recordsHaveBeenModified(): any {
    }

    selectFromWriteConnection(sql: string, values: any): any {
    }

    table(table: Function | QueryBuilder | string, as?: string): QueryBuilder {
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

  function getBuilder() {
    const grammar   = new MysqlQueryGrammar();
    const processor = new MysqlProcessor();

    const conn = new Conn();
    return new QueryBuilder(conn, grammar, processor);
  }

  function getMySqlBuilder() {
    return getBuilder();
  }

  function getPostgresBuilder() {
    const grammar   = new PostgresQueryGrammar();
    const processor = new PostgresProcessor();
    const conn      = new Conn();

    return new QueryBuilder(conn, grammar, processor);
  }

  function getSqlServerBuilder() {
    const grammar   = new SqlserverQueryGrammar();
    const processor = new SqlServerProcessor();
    const conn      = new Conn();

    return new QueryBuilder(conn, grammar, processor);
  }

  function getSQLiteBuilder() {
    const grammar   = new SqliteQueryGrammar();
    const processor = new Processor();
    const conn      = new Conn();

    return new QueryBuilder(conn, grammar, processor);
  }

  beforeEach(() => {
    builder = getBuilder();
  });

  it('test basic select', () => {
    builder.select('*').from('users');
    expect(builder.toSql()).toBe('SELECT * FROM `users`');
  });

  xit('xtest specify table name with keep back slash quote', () => {
    builder.select('*').from('us`ers');
    expect(builder.toSql()).toBe('SELECT * FROM `us``ers`');
    builder.select('*').from('`users');
    expect(builder.toSql()).toBe('SELECT * FROM ```users`');
    builder.select('*').from('users`');
    expect(builder.toSql()).toBe('SELECT * FROM `users```');
  });

  xit('xtest specify table name with keep back slash quote', () => {
    builder.select('*').from('us`ers');
    expect(builder.toSql()).toBe('SELECT * FROM `users`');
    builder.select('*').from('`users');
    expect(builder.toSql()).toBe('SELECT * FROM `users`');
    builder.select('*').from('users`');
    expect(builder.toSql()).toBe('SELECT * FROM `users`');
  });

  it('test specify table name with keep back slash quote', () => {
    builder.select('*').from('us`ers');
    expect(builder.toSql()).toBe('SELECT * FROM `us`');

    expect(() => {
      builder.select('*').from('`users');
    }).toThrowError('tableName error');

    // expect(builder.toSql()).toBe('SELECT * FROM `users`');

    builder.select('*').from('users`');
    expect(builder.toSql()).toBe('SELECT * FROM `users`');
  });

  it('test basic select with get columns', async () => {
    const spySelect = jest.spyOn(builder._connection, 'select');

    await builder.from('users').get();

    expect(spySelect).toHaveBeenLastCalledWith('SELECT * FROM `users`', [], true);
    expect(builder._columns).toStrictEqual([]);

    await builder.from('users').get(['foo', 'bar']);

    expect(spySelect).toHaveBeenLastCalledWith('SELECT `foo`, `bar` FROM `users`', [], true);
    expect(builder._columns).toStrictEqual([]);

    await builder.from(`users`).get('baz');

    expect(builder.toSql()).toBe('SELECT * FROM `users`');
    expect(builder._columns).toStrictEqual([]);
  });

  it('test basic select use write connection', () => {
    const spySelect = jest.spyOn(builder._connection, 'select');

    builder.useWriteConnection().select('*').from('users').get();
    expect(spySelect).toHaveBeenLastCalledWith('SELECT * FROM `users`', [], false);

    // builder.select("*").from(`users`).get()
    // expect(spySelect).toHaveBeenLastCalledWith('SELECT * FROM `users`;', [], true);
  });

  xit('xtest basic table wrapping protects quotation marks', () => {
    builder.select('*').from('some"table');
    expect(builder.toSql()).toBe('SELECT * FROM `some"table`');
  });

  it('test basic table wrapping protects quotation marks', () => {
    builder.select('*').from('some"table');
    expect(builder.toSql()).toBe('SELECT * FROM `some`');
  });

  xit('xtest alias wrapping as whole constant', () => {
    builder.select('x.y as foo.bar').from('baz');
    expect(builder.toSql()).toBe('SELECT "x"."y" AS "foo.bar" FROM `baz`');
  });

  it('test alias wrapping as whole constant', () => {
    builder.select('x.y as foo.bar').from('baz');
    expect(builder.toSql()).toBe('SELECT `x`.`y` AS `foo.bar` FROM `baz`');

    builder.select('x.y as `foo.bar').from('baz');
    expect(builder.toSql()).toBe('SELECT `x`.`y` FROM `baz`');

    builder.select('x.y as ` foo.bar').from('baz');
    expect(builder.toSql()).toBe('SELECT `x`.`y` FROM `baz`');
  });

  xit('xtest alias wrapping with spaces in database name', () => {
    builder.select('w x.y.z as foo.bar').from('baz');
    expect(builder.toSql()).toBe('SELECT `w x`.`y`.`z` AS `foo.bar` FROM "baz"');
  });

  it('test alias wrapping with spaces in database name', () => {
    builder.select('w x.y.z as foo.bar').from('baz');
    expect(builder.toSql()).toBe('SELECT `w` FROM `baz`');
  });

  it('test adding selects', () => {
    builder.select('foo').addSelect('bar').addSelect(['baz', 'boom']).from('users');
    expect(builder.toSql()).toBe('SELECT `foo`, `bar`, `baz`, `boom` FROM `users`');
  });

  it('test basic select with prefix', () => {
    builder.getGrammar().setTablePrefix('prefix_');
    builder.select('*').from('users');
    expect(builder.toSql()).toBe('SELECT * FROM `prefix_users`');
  });

  it('test basic select distinct', () => {
    builder.distinct().select('foo', 'bar').from('users');
    expect(builder.toSql()).toBe('SELECT DISTINCT `foo`, `bar` FROM `users`');
  });

  it('test basic select distinct on columns', () => {
    builder = getBuilder();
    builder.distinct('foo').select('foo', 'bar').from('users');
    expect(builder.toSql()).toBe('SELECT DISTINCT `foo`, `bar` FROM `users`');

    builder = getPostgresBuilder();
    builder.distinct('foo').select('foo', 'bar').from('users');
    expect(builder.toSql()).toBe('SELECT DISTINCT ON ("foo") "foo", "bar" FROM "users"');
  });

  it('test basic alias', () => {
    builder.select('foo as bar').from('users');
    expect(builder.toSql()).toBe('SELECT `foo` AS `bar` FROM `users`');
  });

  it('test alias with prefix', () => {
    builder.getGrammar().setTablePrefix('prefix_');
    builder.select('*').from('users', 'people');
    expect(builder.toSql()).toBe('SELECT * FROM `prefix_users` AS `prefix_people`');

    builder.select('*').from('users as people');
    expect(builder.toSql()).toBe('SELECT * FROM `prefix_users` AS `prefix_people`');
  });

  it('test join aliases with prefix', () => {
    builder.getGrammar().setTablePrefix('prefix_');
    builder.select('*')
      .from('services')
      /**
       * this join is mean that
       * 1. declare var t, (btw. declare is like exports)
       * 2. translations is a reference for table translations, (btw. reference is like imports)
       * 3. table is `translations as t`
       * 4. on is `t.item_id = services.id`
       */
      .join('translations AS t ON t.item_id = services.id');
    expect(builder.toSql()).toBe(
      'SELECT * FROM `prefix_services` INNER JOIN `prefix_translations` AS `prefix_t` ON `prefix_t`.`item_id` = `prefix_services`.`id`'
    );
  });

  it('test join aliases with multi argument with prefix', () => {
    builder.getGrammar().setTablePrefix('prefix_');
    builder.select('*')
      .from('services')
      .join('translations AS t', 't.item_id', '=', 'services.id');
    expect(builder.toSql()).toBe(
      'SELECT * FROM `prefix_services` INNER JOIN `prefix_translations` AS `prefix_t` ON `prefix_t`.`item_id` = `prefix_services`.`id`'
    );
  });

  it('test basic table wrapping', () => {
    builder = getBuilder();
    builder.select('*').from('public.users');

    expect(builder.toSql()).toBe('SELECT * FROM `public`.`users`');
  });

  //region test build query

  it('test when callback', () => {
    const callback = (query: QueryBuilder, condition: boolean) => {
      expect(condition).toBeTruthy();
      query.where('id', '=', 1);
    };

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .when(true, callback)
      .where('email', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? AND `email` = ?');

    builder = getBuilder();
    builder.select('*')
      .from('users')
      .when(false, callback)
      .where('email', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `email` = ?');
  });

  it('test when callback with return', () => {
    const callback = (query: QueryBuilder, condition: boolean) => {
      expect(condition).toBeTruthy();
      return query.where('id', '=', 1);
    };

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .when(true, callback)
      .where('email', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? AND `email` = ?');

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .when(false, callback)
      .where('email', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `email` = ?');
  });

  it('test when callback with default', () => {
    const callback = (query: QueryBuilder, condition: boolean) => {
      expect(condition).toBe('truthy');
      query.where('id', '=', 1);
    };
    const _default = (query: QueryBuilder, condition: boolean) => {
      expect(condition).toBe(0);
      query.where('id', '=', 2);
    };

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      // @ts-ignore
      .when('truthy', callback, _default)
      .where('email', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? AND `email` = ?');
    expect(builder.getBindings()).toStrictEqual([
      1,
      'foo'
    ]);

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      // @ts-ignore
      .when(0, callback, _default)
      .where('email', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? AND `email` = ?');
    expect(builder.getBindings()).toStrictEqual([
      2,
      'foo'
    ]);
  });

  it('test unless callback', () => {
    const callback = (query: QueryBuilder, condition: boolean) => {
      expect(condition).toBeFalsy();
      query.where('id', '=', 1);
    };
    builder        = getBuilder();
    builder
      .select('*')
      .from('users')
      .unless(false, callback)
      .where('email', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? AND `email` = ?');

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .unless(true, callback)
      .where('email', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `email` = ?');
  });

  it('test unless callback with return', () => {
    const callback = (query: QueryBuilder, condition: boolean) => {
      expect(condition).toBeFalsy();
      return query.where('id', '=', 1);
    };

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .unless(false, callback)
      .where('email', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? AND `email` = ?');

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .unless(true, callback)
      .where('email', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `email` = ?');
  });

  it('test unless callback with default', () => {
    const callback = (query: QueryBuilder, condition: boolean) => {
      expect(condition).toBe(0);
      query.where('id', '=', 1);
    };
    const _default = (query: QueryBuilder, condition: boolean) => {
      expect(condition).toBe('truthy');
      query.where('id', '=', 2);
    };

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .unless(0, callback, _default)
      .where('email', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? AND `email` = ?');
    expect(builder.getBindings()).toStrictEqual([
      1,
      'foo'
    ]);

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .unless('truthy', callback, _default)
      .where('email', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? AND `email` = ?');
    expect(builder.getBindings()).toStrictEqual([
      2,
      'foo'
    ]);
  });

  it('test tap callback', () => {
    const callback = (query: QueryBuilder) => {
      return query.where('id', '=', 1);
    };

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .tap(callback).where('email', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? AND `email` = ?');
  });

  it('test basic wheres', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ?');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test wheres with array value', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('id', [12, 30]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ?');
    expect(builder.getBindings()).toStrictEqual([
      12,
      30
    ]);

    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', [12, 30]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ?');
    expect(builder.getBindings()).toStrictEqual([
      12,
      30
    ]);

    builder = getBuilder();
    builder.select('*').from('users').where('id', '!=', [12, 30]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` != ?');
    expect(builder.getBindings()).toStrictEqual([
      12,
      30
    ]);

    builder = getBuilder();
    builder.select('*').from('users').where('id', '<>', [12, 30]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` <> ?');
    expect(builder.getBindings()).toStrictEqual([
      12,
      30
    ]);
  });

  //endregion

  // todo the lexer can't handle special char like `\``, `'`, `"`
  xit('xtest my sql wrapping protects quotation marks', () => {
    builder = getMySqlBuilder();
    builder
      .select('*')
      .from('some`table');
    expect(builder.toSql()).toBe('SELECT * FROM `some``table`');
  });

  it('test date based wheres accepts two arguments', () => {
    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .whereDate('created_at', 1);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE Date(`created_at`) = ?');

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .whereDay('created_at', 1);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE Day(`created_at`) = ?');

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .whereMonth('created_at', 1);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE Month(`created_at`) = ?');

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .whereYear('created_at', 1);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE Year(`created_at`) = ?');
  });

  it('test date based or wheres accepts two arguments', () => {
    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .where('id', 1)
      .orWhereDate('created_at', 1);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR Date(`created_at`) = ?');

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .where('id', 1)
      .orWhereDay('created_at', 1);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR Day(`created_at`) = ?');

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .where('id', 1)
      .orWhereMonth('created_at', 1);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR Month(`created_at`) = ?');

    builder = getBuilder();
    builder
      .select('*')
      .from('users')
      .where('id', 1)
      .orWhereYear('created_at', 1);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR Year(`created_at`) = ?');
  });

  it('test date based wheres expression is not bound', () => {
    // changed only get sql then have binding variables
    builder = getBuilder();
    builder.select('*').from('users')
      .whereDate('created_at', raw('NOW()'))
      .where('admin', true);
    builder.toSql();
    expect(builder.getBindings()).toStrictEqual([true]);

    builder = getBuilder();
    builder.select('*').from('users')
      .whereDay('created_at', raw('NOW()'));
    builder.toSql();
    expect(builder.getBindings()).toStrictEqual([]);

    builder = getBuilder();
    builder.select('*').from('users')
      .whereMonth('created_at', raw('NOW()'));
    builder.toSql();
    expect(builder.getBindings()).toStrictEqual([]);

    builder = getBuilder();
    builder.select('*').from('users')
      .whereYear('created_at', raw('NOW()'));
    builder.toSql();
    expect(builder.getBindings()).toStrictEqual([]);
  });

  it('test where date my sql', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE Date(`created_at`) = ?');
    expect(builder.getBindings()).toStrictEqual([
      '2015-12-21'
    ]);

    builder = getBuilder();
    builder.select('*').from('users').whereDate('created_at', '=', raw('NOW()'));
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE Date(`created_at`) = NOW()');
  });

  it('test where day my sql', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereDay('created_at', '=', 1);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE Day(`created_at`) = ?');
    expect(builder.getBindings()).toStrictEqual(['01']);
  });

  it('test or where day my sql', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereDay('created_at', '=', 1).orWhereDay('created_at', '=',
      2);
    expect(builder.toSql()).toBe(
      'SELECT * FROM `users` WHERE Day(`created_at`) = ? OR Day(`created_at`) = ?');
    expect(builder.getBindings()).toStrictEqual(['01', '02']);
  });

  it('test where month my sql', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereMonth('created_at', '=', 5);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE Month(`created_at`) = ?');
    expect(builder.getBindings()).toStrictEqual(['05']);
  });

  it('test or where month my sql', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereMonth('created_at', '=', 5).orWhereMonth('created_at',
      '=', 6);
    expect(builder.toSql()).toBe(
      'SELECT * FROM `users` WHERE Month(`created_at`) = ? OR Month(`created_at`) = ?');
    expect(builder.getBindings()).toStrictEqual(['05', '06']);
  });

  it('test where year my sql', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereYear('created_at', '=', 2014);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE Year(`created_at`) = ?');
    expect(builder.getBindings()).toStrictEqual([2014]);
  });

  it('test or where year my sql', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereYear('created_at', '=', 2014).orWhereYear('created_at',
      '=', 2015);
    expect(builder.toSql()).toBe(
      'SELECT * FROM `users` WHERE Year(`created_at`) = ? OR Year(`created_at`) = ?');
    expect(builder.getBindings()).toStrictEqual([2014, 2015]);
  });

  it('test where time my sql', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereTime('created_at', '>=', '22:00');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE Time(`created_at`) >= ?');
    expect(builder.getBindings()).toStrictEqual(['22:00']);
  });

  it('test where time operator optional my sql', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereTime('created_at', '22:00');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE Time(`created_at`) = ?');
    expect(builder.getBindings()).toStrictEqual(['22:00']);
  });

  it('test where time operator optional postgres', () => {
    builder = getPostgresBuilder();
    builder.select('*').from('users').whereTime('created_at', '22:00');
    expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE "created_at"::time = $1');
    expect(builder.getBindings()).toStrictEqual(['22:00']);
  });

  it('test where time sql server', () => {
    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereTime('created_at', '22:00');
    expect(builder.toSql()).toBe('SELECT * FROM [users] WHERE cast([created_at] AS time) = ?');
    expect(builder.getBindings()).toStrictEqual(['22:00']);

    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereTime('created_at', raw('NOW()'));
    expect(builder.toSql()).toBe('SELECT * FROM [users] WHERE cast([created_at] AS time) = NOW()');
    expect(builder.getBindings()).toStrictEqual([]);
  });

  it('test where date postgres', () => {
    builder = getPostgresBuilder();
    builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
    expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE "created_at"::date = $1');
    expect(builder.getBindings()).toStrictEqual(['2015-12-21']);
    builder = getPostgresBuilder();
    builder.select('*').from('users').whereDate('created_at', raw('NOW()'));
    expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE "created_at"::date = NOW()');
  });

  it('test where day postgres', () => {
    builder = getPostgresBuilder();
    builder.select('*').from('users').whereDay('created_at', '=', 1);
    expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE extract(day from "created_at") = $1');
    expect(builder.getBindings()).toStrictEqual(['01']);
  });

  it('test where month postgres', () => {
    builder = getPostgresBuilder();
    builder.select('*').from('users').whereMonth('created_at', '=', 5);
    expect(builder.toSql()).toBe(
      'SELECT * FROM "users" WHERE extract(month from "created_at") = $1');
    expect(builder.getBindings()).toStrictEqual(['05']);
  });

  it('test where year postgres', () => {
    builder = getPostgresBuilder();
    builder.select('*').from('users').whereYear('created_at', '=', 2014);
    expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE extract(year from "created_at") = $1');
    expect(builder.getBindings()).toStrictEqual([2014]);
  });

  it('test where time postgres', () => {
    builder = getPostgresBuilder();
    builder.select('*').from('users').whereTime('created_at', '>=', '22:00');
    expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE "created_at"::time >= $1');
    expect(builder.getBindings()).toStrictEqual(['22:00']);
  });

  it('test where like postgres', () => {
    builder = getPostgresBuilder();
    builder.select('*').from('users').where('id', 'like', '1');
    expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE "id"::text LIKE $1');
    expect(builder.getBindings()).toStrictEqual(['1']);
    builder = getPostgresBuilder();
    builder.select('*').from('users').where('id', 'LIKE', '1');
    expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE "id"::text LIKE $1');
    expect(builder.getBindings()).toStrictEqual(['1']);
    builder = getPostgresBuilder();
    builder.select('*').from('users').where('id', 'ilike', '1');
    expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE "id"::text ILIKE $1');
    expect(builder.getBindings()).toStrictEqual(['1']);
    builder = getPostgresBuilder();
    builder.select('*').from('users').where('id', 'not like', '1');
    expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE "id"::text NOT LIKE $1');
    expect(builder.getBindings()).toStrictEqual(['1']);
    builder = getPostgresBuilder();
    builder.select('*').from('users').where('id', 'not ilike', '1');
    expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE "id"::text NOT ILIKE $1');
    expect(builder.getBindings()).toStrictEqual(['1']);
  });

  it('test where date sqlite', () => {
    builder = getSQLiteBuilder();
    builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
    expect(builder.toSql()).toBe(
      'SELECT * FROM "users" WHERE strftime(\'%Y-%m-%d\', "created_at") = cast(? AS text)');
    expect(builder.getBindings()).toStrictEqual(
      ['2015-12-21']
    );
    builder = getSQLiteBuilder();
    builder.select('*').from('users').whereDate('created_at', raw('NOW()'));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM "users" WHERE strftime(\'%Y-%m-%d\', "created_at") = cast(NOW() AS text)');
  });

  it('test where day sqlite', () => {
    builder = getSQLiteBuilder();
    builder.select('*').from('users').whereDay('created_at', '=', 1);
    expect(builder.toSql()).toBe(
      'SELECT * FROM "users" WHERE strftime(\'%d\', "created_at") = cast(? AS text)');
    expect(builder.getBindings()).toStrictEqual(['01']);
  });

  it('test where month sqlite', () => {
    builder = getSQLiteBuilder();
    builder.select('*').from('users').whereMonth('created_at', '=', 5);
    expect(builder.toSql()).toBe(
      'SELECT * FROM "users" WHERE strftime(\'%m\', "created_at") = cast(? AS text)');
    expect(builder.getBindings()).toStrictEqual(['05']);
  });

  it('test where year sqlite', () => {
    builder = getSQLiteBuilder();
    builder.select('*').from('users').whereYear('created_at', '=', 2014);
    expect(builder.toSql()).toBe(
      'SELECT * FROM "users" WHERE strftime(\'%Y\', "created_at") = cast(? AS text)');
    expect(builder.getBindings()).toStrictEqual([2014]);
  });

  it('test where time sqlite', () => {
    builder = getSQLiteBuilder();
    builder.select('*').from('users').whereTime('created_at', '>=', '22:00');
    expect(builder.toSql())
      .toBe('SELECT * FROM "users" WHERE strftime(\'%H:%M:%S\', "created_at") >= cast(? AS text)');
    expect(builder.getBindings()).toStrictEqual(['22:00']);
  });

  it('test where time operator optional sqlite', () => {
    builder = getSQLiteBuilder();
    builder.select('*').from('users').whereTime('created_at', '22:00');
    expect(builder.toSql()).toBe(
      'SELECT * FROM "users" WHERE strftime(\'%H:%M:%S\', "created_at") = cast(? AS text)');
    expect(builder.getBindings()).toStrictEqual(['22:00']);
  });

  it('test where date sql server', () => {
    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
    expect(builder.toSql()).toBe('SELECT * FROM [users] WHERE cast([created_at] AS date) = ?');
    expect(builder.getBindings()).toStrictEqual(['2015-12-21']);

    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereDate('created_at', raw('NOW()'));
    expect(builder.toSql()).toBe('SELECT * FROM [users] WHERE cast([created_at] AS date) = NOW()');
  });

  it('test where day sql server', () => {
    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereDay('created_at', '=', 1);
    expect(builder.toSql()).toBe('SELECT * FROM [users] WHERE day([created_at]) = ?');
    expect(builder.getBindings()).toStrictEqual(['01']);
  });

  it('test where month sql server', () => {
    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereMonth('created_at', '=', 5);
    expect(builder.toSql()).toBe('SELECT * FROM [users] WHERE month([created_at]) = ?');
    expect(builder.getBindings()).toStrictEqual(['05']);
  });

  it('test where year sql server', () => {
    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereYear('created_at', '=', 2014);
    expect(builder.toSql()).toBe('SELECT * FROM [users] WHERE year([created_at]) = ?');
    expect(builder.getBindings()).toStrictEqual([2014]);
  });

  it('test where betweens', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereBetween('id', [1, 2]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` BETWEEN ? AND ?');
    expect(builder.getBindings()).toStrictEqual([1, 2]);

    builder = getBuilder();
    builder.select('*').from('users').whereNotBetween('id', [1, 2]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` NOT BETWEEN ? AND ?');
    expect(builder.getBindings()).toStrictEqual([1, 2]);

    builder = getBuilder();
    builder.select('*').from('users').whereBetween('id', [raw(1), raw(2)]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` BETWEEN 1 AND 2');
    expect(builder.getBindings()).toStrictEqual([]);
  });

  it('test basic or wheres', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhere('email', '=', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR `email` = ?');
    expect(builder.getBindings()).toStrictEqual([1, 'foo']);
  });

  it('test raw wheres', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereRaw('id = ? or email = ?', [1, 'foo']);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE id = ? or email = ?');
    expect(builder.getBindings()).toStrictEqual([1, 'foo']);
  });

  it('test raw or wheres', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereRaw('email = ?', ['foo']);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR email = ?');
    expect(builder.getBindings()).toStrictEqual([1, 'foo']);
  });

  it('test basic where ins', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereIn('id', [1, 2, 3]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` IN (?, ?, ?)');
    expect(builder.getBindings()).toStrictEqual([1, 2, 3]);
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereIn('id', [1, 2, 3]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR `id` IN (?, ?, ?)');
    expect(builder.getBindings()).toStrictEqual([1, 1, 2, 3]);
  });

  it('test basic where not ins', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereNotIn('id', [1, 2, 3]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` NOT IN (?, ?, ?)');
    expect(builder.getBindings()).toStrictEqual([1, 2, 3]);

    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereNotIn('id', [1, 2, 3]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR `id` NOT IN (?, ?, ?)');
    expect(builder.getBindings()).toStrictEqual([1, 1, 2, 3]);
  });

  it('test raw where ins', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereIn('id', [raw(1)]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` IN (1)');

    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereIn('id', [raw(1)]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR `id` IN (1)');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test empty where ins', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereIn('id', []);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE 0 = 1');
    expect(builder.getBindings()).toStrictEqual([]);

    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereIn('id', []);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR 0 = 1');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test empty where not ins', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereNotIn('id', []);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE 1 = 1');
    expect(builder.getBindings()).toStrictEqual([]);
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereNotIn('id', []);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR 1 = 1');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test where integer in raw', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereIntegerInRaw('id', ['1a', 2]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` IN (1, 2)');
    expect(builder.getBindings()).toStrictEqual([]);
  });

  it('test or where integer in raw', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereIntegerInRaw('id', ['1a', 2]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR `id` IN (1, 2)');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test where integer not in raw', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereIntegerNotInRaw('id', ['1a', 2]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` NOT IN (1, 2)');
    expect(builder.getBindings()).toStrictEqual([]);
  });

  it('test or where integer not in raw', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereIntegerNotInRaw('id', ['1a', 2]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR `id` NOT IN (1, 2)');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test empty where integer in raw', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereIntegerInRaw('id', []);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE 0 = 1');
    expect(builder.getBindings()).toStrictEqual([]);
  });

  it('test empty where integer not in raw', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereIntegerNotInRaw('id', []);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE 1 = 1');
    expect(builder.getBindings()).toStrictEqual([]);
  });

  it('test basic where column', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereColumn('first_name', 'last_name').orWhereColumn(
      'first_name', 'middle_name');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` WHERE `first_name` = `last_name` OR `first_name` = `middle_name`');
    expect(builder.getBindings()).toStrictEqual([]);
    builder = getBuilder();
    builder.select('*').from('users').whereColumn('updated_at', '>', 'created_at');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `updated_at` > `created_at`');
    expect(builder.getBindings()).toStrictEqual([]);
  });

  it('test array where column', () => {
    const conditions = [['first_name', 'last_name'], ['updated_at', '>', 'created_at']];
    builder          = getBuilder();
    builder.select('*').from('users').whereColumn(conditions);
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` WHERE (`first_name` = `last_name` AND `updated_at` > `created_at`)');
    expect(builder.getBindings()).toStrictEqual([]);
  });

  it('test unions', () => {
    let expectedSql;
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1);
    builder.union(getBuilder().select('*').from('users').where('id', '=', 2));
    expect(builder.toSql()).toBe(
      '(SELECT * FROM `users` WHERE `id` = ?) UNION (SELECT * FROM `users` WHERE `id` = ?)');
    expect(builder.getBindings()).toStrictEqual([1, 2]);

    builder = getMySqlBuilder();
    builder.select('*').from('users').where('id', '=', 1);
    builder.union(getMySqlBuilder().select('*').from('users').where('id', '=', 2));
    expect(builder.toSql()).toBe(
      '(SELECT * FROM `users` WHERE `id` = ?) UNION (SELECT * FROM `users` WHERE `id` = ?)');
    expect(builder.getBindings()).toStrictEqual([1, 2]);

    builder     = getMySqlBuilder();
    expectedSql = '(SELECT `a` FROM `t1` WHERE `a` = ? AND `b` = ?) UNION (SELECT `a` FROM `t2` WHERE `a` = ? AND `b` = ?) ORDER BY `a` ASC LIMIT 10';
    const union = getMySqlBuilder().select('a').from('t2').where('a', 11).where('b', 2);
    builder.select('a').from('t1').where('a', 10).where('b', 1).union(union).orderBy('a').limit(10);
    expect(builder.toSql()).toBe(expectedSql);
    expect(builder.getBindings()).toStrictEqual([10, 1, 11, 2]);

    builder     = getPostgresBuilder();
    expectedSql = '(SELECT "name" FROM "users" WHERE "id" = $1) UNION (SELECT "name" FROM "users" WHERE "id" = $2)';
    builder.select('name').from('users').where('id', '=', 1);
    builder.union(getPostgresBuilder().select('name').from('users').where('id', '=', 2));
    expect(builder.toSql()).toBe(expectedSql);
    expect(builder.getBindings()).toStrictEqual([1, 2]);

    builder     = getSQLiteBuilder();
    expectedSql = 'SELECT * FROM (SELECT "name" FROM "users" WHERE "id" = ?) UNION SELECT * FROM (SELECT "name" FROM "users" WHERE "id" = ?)';
    builder.select('name').from('users').where('id', '=', 1);
    builder.union(getSQLiteBuilder().select('name').from('users').where('id', '=', 2));
    expect(builder.toSql()).toBe(expectedSql);
    expect(builder.getBindings()).toStrictEqual([1, 2]);

    builder     = getSqlServerBuilder();
    expectedSql = 'SELECT * FROM (SELECT [name] FROM [users] WHERE [id] = ?) AS [temp_table] UNION SELECT * FROM (SELECT [name] FROM [users] WHERE [id] = ?) AS [temp_table]';
    builder.select('name').from('users').where('id', '=', 1);
    builder.union(getSqlServerBuilder().select('name').from('users').where('id', '=', 2));
    expect(builder.toSql()).toBe(expectedSql);
    expect(builder.getBindings()).toStrictEqual([1, 2]);
  });

  it('test union alls', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1);
    builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 2));
    expect(builder.toSql())
      .toBe(
        '(SELECT * FROM `users` WHERE `id` = ?) UNION ALL (SELECT * FROM `users` WHERE `id` = ?)');
    expect(builder.getBindings()).toStrictEqual([1, 2]);
    const expectedSql = '(SELECT * FROM "users" WHERE "id" = $1) UNION ALL (SELECT * FROM "users" WHERE "id" = $2)';
    builder           = getPostgresBuilder();
    builder.select('*').from('users').where('id', '=', 1);
    builder.unionAll(getPostgresBuilder().select('*').from('users').where('id', '=', 2));
    expect(builder.toSql()).toBe(expectedSql);
    expect(builder.getBindings()).toStrictEqual([1, 2]);
  });

  it('test multiple unions', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1);
    builder.union(getBuilder().select('*').from('users').where('id', '=', 2));
    builder.union(getBuilder().select('*').from('users').where('id', '=', 3));
    expect(builder.toSql())
      .toBe(
        '(SELECT * FROM `users` WHERE `id` = ?) UNION (SELECT * FROM `users` WHERE `id` = ?) UNION (SELECT * FROM `users` WHERE `id` = ?)');
    expect(builder.getBindings()).toStrictEqual([1, 2, 3]);
  });

  it('test multiple union alls', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1);
    builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 2));
    builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 3));
    expect(builder.toSql())
      .toBe(
        '(SELECT * FROM `users` WHERE `id` = ?) UNION ALL (SELECT * FROM `users` WHERE `id` = ?) UNION ALL (SELECT * FROM `users` WHERE `id` = ?)');
    expect(builder.getBindings()).toStrictEqual([1, 2, 3]);
  });

  it('test union order bys', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1);
    builder.union(getBuilder().select('*').from('users').where('id', '=', 2));
    builder.orderBy('id', 'desc');
    expect(builder.toSql())
      .toBe(
        '(SELECT * FROM `users` WHERE `id` = ?) UNION (SELECT * FROM `users` WHERE `id` = ?) ORDER BY `id` DESC');
    expect(builder.getBindings()).toStrictEqual([1, 2]);
  });

  it('test union limits and offsets', () => {
    let expectedSql;
    builder = getBuilder();
    builder.select('*').from('users');
    builder.union(getBuilder().select('*').from('dogs'));
    builder.skip(5).take(10);
    expect(builder.toSql()).toBe(
      '(SELECT * FROM `users`) UNION (SELECT * FROM `dogs`) LIMIT 10 OFFSET 5');

    expectedSql = '(SELECT * FROM "users") UNION (SELECT * FROM "dogs") LIMIT 10 OFFSET 5';
    builder     = getPostgresBuilder();
    builder.select('*').from('users');
    builder.union(getPostgresBuilder().select('*').from('dogs'));
    builder.skip(5).take(10);
    expect(builder.toSql()).toBe(expectedSql);

    expectedSql = '(SELECT * FROM "users" LIMIT 11) UNION (SELECT * FROM "dogs" LIMIT 22) LIMIT 10 OFFSET 5';
    builder     = getPostgresBuilder();
    builder.select('*').from('users').limit(11);
    builder.union(getPostgresBuilder().select('*').from('dogs').limit(22));
    builder.skip(5).take(10);
    expect(builder.toSql()).toBe(expectedSql);
  });

  it('test union with join', () => {
    builder = getBuilder();
    builder.select('*').from('users');
    builder.union(getBuilder().select('*').from('dogs')
      .join('breeds', (join: JoinClauseBuilder) => {
        join.on('dogs.breed_id', '=', 'breeds.id').where('breeds.is_native', '=', 1);
      }));
    expect(builder.toSql())
      .toBe(
        '(SELECT * FROM `users`) UNION (SELECT * FROM `dogs` INNER JOIN `breeds` ON `dogs`.`breed_id` = `breeds`.`id` AND `breeds`.`is_native` = ?)');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test my sql union order bys', () => {
    builder = getMySqlBuilder();
    builder.select('*').from('users').where('id', '=', 1);
    builder.union(getMySqlBuilder().select('*').from('users').where('id', '=', 2));
    builder.orderBy('id', 'desc');
    expect(builder.toSql())
      .toBe(
        '(SELECT * FROM `users` WHERE `id` = ?) UNION (SELECT * FROM `users` WHERE `id` = ?) ORDER BY `id` DESC');
    expect(builder.getBindings()).toStrictEqual([1, 2]);
  });

  it('test my sql union limits and offsets', () => {
    builder = getMySqlBuilder();
    builder.select('*').from('users');
    builder.union(getMySqlBuilder().select('*').from('dogs'));
    builder.skip(5).take(10);
    expect(builder.toSql()).toBe(
      '(SELECT * FROM `users`) UNION (SELECT * FROM `dogs`) LIMIT 10 OFFSET 5');
  });


  it('test union aggregate', async () => {
    let expected, spySelect, spyProcessSelect;

    expected = 'SELECT count(*) AS aggregate FROM ((SELECT * FROM `posts`) UNION (SELECT * FROM `videos`)) AS `temp_table`';
    builder  = getMySqlBuilder();
    spySelect = jest.spyOn(builder._connection, 'select'), spyProcessSelect = jest.spyOn(
      builder._processor, 'processSelect');
    await builder.from('posts').union(getMySqlBuilder().from('videos')).count();
    expect(spySelect).toBeCalledTimes(1);
    expect(spySelect).toBeCalledWith(expected, [], true);
    expect(spyProcessSelect).toBeCalledTimes(1);

    expected = 'SELECT count(*) AS aggregate FROM ((SELECT `id` FROM `posts`) UNION (SELECT `id` FROM `videos`)) AS `temp_table`';
    builder  = getMySqlBuilder();
    spySelect = jest.spyOn(builder._connection, 'select'), spyProcessSelect = jest.spyOn(
      builder._processor, 'processSelect');
    await builder.from('posts').select('id').union(
      getMySqlBuilder().from('videos').select('id')).count();
    expect(spySelect).toBeCalledTimes(1);
    expect(spySelect).toBeCalledWith(expected, [], true);
    expect(spyProcessSelect).toBeCalledTimes(1);

    expected = 'SELECT count(*) AS aggregate FROM ((SELECT * FROM "posts") UNION (SELECT * FROM "videos")) AS "temp_table"';
    builder  = getPostgresBuilder();
    spySelect = jest.spyOn(builder._connection, 'select'), spyProcessSelect = jest.spyOn(
      builder._processor, 'processSelect');
    await builder.from('posts').union(getPostgresBuilder().from('videos')).count();
    expect(spySelect).toBeCalledTimes(1);
    expect(spySelect).toBeCalledWith(expected, [], true);
    expect(spyProcessSelect).toBeCalledTimes(1);

    expected = 'SELECT count(*) AS aggregate FROM (SELECT * FROM (SELECT * FROM "posts") UNION SELECT * FROM (SELECT * FROM "videos")) AS "temp_table"';
    builder  = getSQLiteBuilder();
    spySelect = jest.spyOn(builder._connection, 'select'), spyProcessSelect = jest.spyOn(
      builder._processor, 'processSelect');
    await builder.from('posts').union(getSQLiteBuilder().from('videos')).count();
    expect(spySelect).toBeCalledTimes(1);
    expect(spySelect).toBeCalledWith(expected, [], true);
    expect(spyProcessSelect).toBeCalledTimes(1);

    expected = 'SELECT count(*) AS aggregate FROM (SELECT * FROM (SELECT * FROM [posts]) AS [temp_table] UNION SELECT * FROM (SELECT * FROM [videos]) AS [temp_table]) AS [temp_table]';
    builder  = getSqlServerBuilder();
    spySelect = jest.spyOn(builder._connection, 'select'), spyProcessSelect = jest.spyOn(
      builder._processor, 'processSelect');
    await builder.from('posts').union(getSqlServerBuilder().from('videos')).count();
    expect(spySelect).toBeCalledTimes(1);
    expect(spySelect).toBeCalledWith(expected, [], true);
    expect(spyProcessSelect).toBeCalledTimes(1);
  });

  it('test sub select where ins', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereIn('id', q => {
      q.select('id').from('users').where('age', '>', 25).take(3);
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` WHERE `id` IN (SELECT `id` FROM `users` WHERE `age` > ? LIMIT 3)');
    expect(builder.getBindings()).toStrictEqual([25]);
    builder = getBuilder();
    builder.select('*').from('users').whereNotIn('id', q => {
      q.select('id').from('users').where('age', '>', 25).take(3);
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` WHERE `id` NOT IN (SELECT `id` FROM `users` WHERE `age` > ? LIMIT 3)');
    expect(builder.getBindings()).toStrictEqual([25]);
  });

  it('test basic where nulls', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereNull('id');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` IS NULL');
    expect(builder.getBindings()).toStrictEqual([]);
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereNull('id');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR `id` IS NULL');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test json where null mysql', () => {
    builder = getMySqlBuilder();
    builder.select('*').from('users').whereNull('items->id');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` WHERE (json_extract(`items`, "$.id") IS NULL OR json_type(json_extract(`items`, "$.id")) = \'NULL\')');
  });

  it('test json where not null mysql', () => {
    builder = getMySqlBuilder();
    builder.select('*').from('users').whereNotNull('items->id');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` WHERE (json_extract(`items`, "$.id") IS NOT NULL AND json_type(json_extract(`items`, "$.id")) != \'NULL\')');
  });

  it('test array where nulls', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereNull(['id', 'expires_at']);
    expect(builder.toSql()).toBe(
      'SELECT * FROM `users` WHERE `id` IS NULL AND `expires_at` IS NULL');
    expect(builder.getBindings()).toStrictEqual([]);
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereNull(['id', 'expires_at']);
    expect(builder.toSql()).toBe(
      'SELECT * FROM `users` WHERE `id` = ? OR `id` IS NULL OR `expires_at` IS NULL');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test basic where not nulls', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereNotNull('id');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` IS NOT NULL');
    expect(builder.getBindings()).toStrictEqual([]);
    builder = getBuilder();
    builder.select('*').from('users').where('id', '>', 1).orWhereNotNull('id');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` > ? OR `id` IS NOT NULL');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test array where not nulls', () => {
    builder = getBuilder();
    builder.select('*').from('users').whereNotNull(['id', 'expires_at']);
    expect(builder.toSql()).toBe(
      'SELECT * FROM `users` WHERE `id` IS NOT NULL AND `expires_at` IS NOT NULL');
    expect(builder.getBindings()).toStrictEqual([]);
    builder = getBuilder();
    builder.select('*').from('users').where('id', '>', 1).orWhereNotNull(['id', 'expires_at']);
    expect(builder.toSql())
      .toBe('SELECT * FROM `users` WHERE `id` > ? OR `id` IS NOT NULL OR `expires_at` IS NOT NULL');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test group bys', () => {
    builder = getBuilder();
    builder.select('*').from('users').groupBy('email');
    expect(builder.toSql()).toBe('SELECT * FROM `users` GROUP BY `email`');
    builder = getBuilder();
    builder.select('*').from('users').groupBy('id', 'email');
    expect(builder.toSql()).toBe('SELECT * FROM `users` GROUP BY `id`, `email`');
    builder = getBuilder();
    builder.select('*').from('users').groupBy(['id', 'email']);
    expect(builder.toSql()).toBe('SELECT * FROM `users` GROUP BY `id`, `email`');
    builder = getBuilder();
    builder.select('*').from('users').groupBy(raw('DATE(created_at)'));
    expect(builder.toSql()).toBe('SELECT * FROM `users` GROUP BY DATE(created_at)');
    builder = getBuilder();
    builder.select('*').from('users').groupByRaw('DATE(created_at), ? DESC', ['foo']);
    expect(builder.toSql()).toBe('SELECT * FROM `users` GROUP BY DATE(created_at), ? DESC');
    expect(builder.getBindings()).toStrictEqual(['foo']);
    builder = getBuilder();
    builder.from('users')
      .havingRaw('?', ['havingRawBinding'])
      .groupByRaw('?', ['groupByRawBinding'])
      .whereRaw('?', ['whereRawBinding']);

    builder.toSql();
    expect(builder.getBindings()).toStrictEqual(
      ['whereRawBinding', 'groupByRawBinding', 'havingRawBinding']);
  });

  it('test order bys', () => {
    builder = getBuilder();
    builder.select('*').from('users').orderBy('email').orderBy('age', 'desc');
    expect(builder.toSql()).toBe('SELECT * FROM `users` ORDER BY `email` ASC, `age` DESC');
    // builder._orders = null;
    // expect(builder.toSql()).toBe('SELECT * FROM `users`');
    builder._orders = [];
    expect(builder.toSql()).toBe('SELECT * FROM `users`');
    builder = getBuilder();
    builder.select('*').from('users').orderBy('email').orderByRaw('`age` ? desc', ['foo']);
    expect(builder.toSql()).toBe('SELECT * FROM `users` ORDER BY `email` ASC, `age` ? desc');
    expect(builder.getBindings()).toStrictEqual(['foo']);
    builder = getBuilder();
    builder.select('*').from('users').orderByDesc('name');
    expect(builder.toSql()).toBe('SELECT * FROM `users` ORDER BY `name` DESC');
    builder = getBuilder();
    builder.select('*')
      .from('posts')
      .where('public', 1)
      .unionAll(getBuilder().select('*').from('videos').where('public', 1))
      .orderByRaw('field(category, ?, ?) asc', ['news', 'opinion']);
    expect(builder.toSql())
      .toBe(
        '(SELECT * FROM `posts` WHERE `public` = ?) UNION ALL (SELECT * FROM `videos` WHERE `public` = ?) ORDER BY field(category, ?, ?) asc');
    expect(builder.getBindings()).toStrictEqual([1, 1, 'news', 'opinion']);
  });

  it('test reorder', () => {
    builder = getBuilder();
    builder.select('*').from('users').orderBy('name');
    expect(builder.toSql()).toBe('SELECT * FROM `users` ORDER BY `name` ASC');
    builder.reorder();
    expect(builder.toSql()).toBe('SELECT * FROM `users`');
    builder = getBuilder();
    builder.select('*').from('users').orderBy('name');
    expect(builder.toSql()).toBe('SELECT * FROM `users` ORDER BY `name` ASC');
    builder.reorder('email', 'desc');
    expect(builder.toSql()).toBe('SELECT * FROM `users` ORDER BY `email` DESC');
    builder = getBuilder();
    builder.select('*').from('first');
    builder.union(getBuilder().select('*').from('second'));
    builder.orderBy('name');
    expect(builder.toSql()).toBe(
      '(SELECT * FROM `first`) UNION (SELECT * FROM `second`) ORDER BY `name` ASC');
    builder.reorder();
    expect(builder.toSql()).toBe('(SELECT * FROM `first`) UNION (SELECT * FROM `second`)');
    builder = getBuilder();
    builder.select('*').from('users').orderByRaw('?', [true]);
    builder.toSql();
    expect(builder.getBindings()).toStrictEqual([true]);
    builder.reorder();
    builder.toSql();
    expect(builder.getBindings()).toStrictEqual([]);
  });

  it('test order by sub queries', () => {
    const expected = 'SELECT * FROM `users` ORDER BY (SELECT `created_at` FROM `logins` WHERE `user_id` = `users`.`id` LIMIT 1)';
    const subQuery = (query: QueryBuilder) => {
      return query.select('created_at').from('logins').whereColumn('user_id', 'users.id').limit(1);
    };
    builder        = getBuilder().select('*').from('users').orderBy(subQuery);
    expect(builder.toSql()).toBe(`${expected} ASC`);
    builder = getBuilder().select('*').from('users').orderBy(subQuery, 'desc');
    expect(builder.toSql()).toBe(`${expected} DESC`);
    builder = getBuilder().select('*').from('users').orderByDesc(subQuery);
    expect(builder.toSql()).toBe(`${expected} DESC`);
    builder = getBuilder();
    builder.select('*')
      .from('posts')
      .where('public', 1)
      .unionAll(getBuilder().select('*').from('videos').where('public', 1))
      .orderBy(getBuilder().selectRaw('field(category, ?, ?)', ['news', 'opinion']));
    expect(builder.toSql())
      .toBe(
        '(SELECT * FROM `posts` WHERE `public` = ?) UNION ALL (SELECT * FROM `videos` WHERE `public` = ?) ORDER BY (SELECT field(category, ?, ?)) ASC');
    expect(builder.getBindings()).toStrictEqual([1, 1, 'news', 'opinion']);
  });


  it('test order by invalid direction param', () => {
    builder = getBuilder();

    expect(() => {
      builder.select('*').from('users').orderBy('age', 'asec');
    }).toThrowError('InvalidArgumentException');

  });

  it('test havings', () => {
    builder = getBuilder();
    builder.select('*').from('users').having('email', '>', 1);
    expect(builder.toSql()).toBe('SELECT * FROM `users` HAVING `email` > ?');
    builder = getBuilder();
    builder.select('*')
      .from('users')
      .orHaving('email', '=', 'test@example.com')
      .orHaving('email', '=', 'test2@example.com');
    expect(builder.toSql()).toBe('SELECT * FROM `users` HAVING `email` = ? OR `email` = ?');
    builder = getBuilder();
    builder.select('*').from('users').groupBy('email').having('email', '>', 1);
    expect(builder.toSql()).toBe('SELECT * FROM `users` GROUP BY `email` HAVING `email` > ?');
    builder = getBuilder();
    builder.select('email as foo_email').from('users').having('foo_email', '>', 1);
    expect(builder.toSql()).toBe(
      'SELECT `email` AS `foo_email` FROM `users` HAVING `foo_email` > ?');
    builder = getBuilder();
    builder.select(['category', raw('count(*) as `total`')])
      .from('item')
      .where('department', '=', 'popular')
      .groupBy('category')
      .having('total', '>', raw('3'));
    expect(builder.toSql())
      .toBe(
        'SELECT `category`, count(*) as `total` FROM `item` WHERE `department` = ? GROUP BY `category` HAVING `total` > 3');
    builder = getBuilder();
    builder.select(['category', raw('count(*) as `total`')])
      .from('item')
      .where('department', '=', 'popular')
      .groupBy('category')
      .having('total', '>', 3);
    expect(builder.toSql())
      .toBe(
        'SELECT `category`, count(*) as `total` FROM `item` WHERE `department` = ? GROUP BY `category` HAVING `total` > ?');
    builder = getBuilder();
    builder.select('*').from('users').havingBetween('last_login_date',
      ['2018-11-16', '2018-12-16']);
    expect(builder.toSql()).toBe('SELECT * FROM `users` HAVING `last_login_date` BETWEEN ? AND ?');
  });

  it('test having shortcut', () => {
    builder = getBuilder();
    builder.select('*').from('users').having('email', 1).orHaving('email', 2);
    expect(builder.toSql()).toBe('SELECT * FROM `users` HAVING `email` = ? OR `email` = ?');
  });

  it('test having followed by select get', async () => {
    let spySelect, spyProcessSelect, result, query;
    builder          = getBuilder();
    spySelect        = jest.spyOn(builder._connection, 'select').mockImplementation(async () => {
      return [
        {
          'category': 'rock',
          'total'   : 5
        }
      ];
    });
    spyProcessSelect = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (builder, results) => {
        return results;
      });
    query            = 'SELECT `category`, count(*) as `total` FROM `item` WHERE `department` = ? GROUP BY `category` HAVING `total` > ?';

    builder.from('item');

    result = await builder.select(['category', raw('count(*) as `total`')])
      .where('department', '=', 'popular')
      .groupBy('category')
      .having('total', '>', 3)
      .get();
    expect(spySelect).toBeCalledWith(query, ['popular', 3], true);
    expect(result).toStrictEqual([
      {
        'category': 'rock',
        'total'   : 5
      }
    ]);

    builder          = getBuilder();
    spySelect        = jest.spyOn(builder._connection, 'select').mockImplementation(async () => {
      return [
        {
          'category': 'rock',
          'total'   : 5
        }
      ];
    });
    spyProcessSelect = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (builder, results) => {
        return results;
      });
    query            = 'SELECT `category`, count(*) as `total` FROM `item` WHERE `department` = ? GROUP BY `category` HAVING `total` > 3';
    builder.from('item');
    result = await builder.select(['category', raw('count(*) as `total`')])
      .where('department', '=', 'popular')
      .groupBy('category')
      .having('total', '>', raw('3'))
      .get();
    expect(spySelect).toBeCalledWith(query, ['popular'], true);
    expect(result).toStrictEqual([
      {
        'category': 'rock',
        'total'   : 5
      }
    ]);
  });

  it('test raw havings', () => {
    builder = getBuilder();
    builder.select('*').from('users').havingRaw('user_foo < user_bar');
    expect(builder.toSql()).toBe('SELECT * FROM `users` HAVING user_foo < user_bar');
    builder = getBuilder();
    builder.select('*').from('users').having('baz', '=', 1).orHavingRaw('user_foo < user_bar');
    expect(builder.toSql()).toBe('SELECT * FROM `users` HAVING `baz` = ? OR user_foo < user_bar');
    builder = getBuilder();
    builder.select('*')
      .from('users')
      .havingBetween('last_login_date', ['2018-11-16', '2018-12-16'])
      .orHavingRaw('user_foo < user_bar');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` HAVING `last_login_date` BETWEEN ? AND ? OR user_foo < user_bar');
  });

  it('test limits and offsets', () => {
    builder = getBuilder();
    builder.select('*').from('users').offset(5).limit(10);
    expect(builder.toSql()).toBe('SELECT * FROM `users` LIMIT 10 OFFSET 5');
    builder = getBuilder();
    builder.select('*').from('users').skip(5).take(10);
    expect(builder.toSql()).toBe('SELECT * FROM `users` LIMIT 10 OFFSET 5');
    builder = getBuilder();
    builder.select('*').from('users').skip(0).take(0);
    expect(builder.toSql()).toBe('SELECT * FROM `users` LIMIT 0 OFFSET 0');
    builder = getBuilder();
    builder.select('*').from('users').skip(-5).take(-10);
    expect(builder.toSql()).toBe('SELECT * FROM `users` OFFSET 0');
  });

  it('test for page', () => {
    builder = getBuilder();
    builder.select('*').from('users').forPage(2, 15);
    expect(builder.toSql()).toBe('SELECT * FROM `users` LIMIT 15 OFFSET 15');
    builder = getBuilder();
    builder.select('*').from('users').forPage(0, 15);
    expect(builder.toSql()).toBe('SELECT * FROM `users` LIMIT 15 OFFSET 0');
    builder = getBuilder();
    builder.select('*').from('users').forPage(-2, 15);
    expect(builder.toSql()).toBe('SELECT * FROM `users` LIMIT 15 OFFSET 0');
    builder = getBuilder();
    builder.select('*').from('users').forPage(2, 0);
    expect(builder.toSql()).toBe('SELECT * FROM `users` LIMIT 0 OFFSET 0');
    builder = getBuilder();
    builder.select('*').from('users').forPage(0, 0);
    expect(builder.toSql()).toBe('SELECT * FROM `users` LIMIT 0 OFFSET 0');
    builder = getBuilder();
    builder.select('*').from('users').forPage(-2, 0);
    expect(builder.toSql()).toBe('SELECT * FROM `users` LIMIT 0 OFFSET 0');
  });

  it('test get count for pagination with bindings', async () => {
    let spySelector, spyProcessSelector;
    builder = getBuilder();
    builder.from('users').selectSub((q: QueryBuilder) => {
      q.select('body').from('posts').where('id', 4);
    }, 'post');

    spySelector = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'aggregate': 1
      }
    ]));

    // builder.getProcessor().shouldReceive('processSelect').once().andReturnUsing((builder, results) => {
    //   return results;
    // });

    spyProcessSelector = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (builder, results) => {
        return results;
      });

    const count = await builder.getCountForPagination();
    expect(spySelector).toBeCalledWith('SELECT count(*) AS aggregate FROM `users`', [], true);
    expect(count).toBe(1);
    expect(builder.getBindings()).toStrictEqual([]); // todo check
  });

  it('test get count for pagination with column aliases', async () => {
    let spySelector, spyProcessSelector;
    builder = getBuilder();

    spySelector        = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'aggregate': 1
      }
    ]));
    spyProcessSelector = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (builder, results) => {
        return results;
      });
    const columns      = ['body as post_body', 'teaser', 'posts.created as published'];
    builder.from('posts').select(columns);

    const count = await builder.getCountForPagination(columns);
    expect(spySelector)
      .toBeCalledWith('SELECT count(`body`, `teaser`, `posts`.`created`) AS aggregate FROM `posts`',
        [], true);

    expect(count).toBe(1);
  });

  it('test get count for pagination with union', async () => {
    let spySelector, spyProcessSelector;
    builder = getBuilder();
    builder.from('posts').select('id').union(getBuilder().from('videos').select('id'));
    spySelector        = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'aggregate': 1
      }
    ]));
    spyProcessSelector = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (builder, results) => {
        return results;
      });
    const count        = await builder.getCountForPagination();
    expect(spySelector)
      .toBeCalledWith(
        'SELECT count(*) AS aggregate FROM ((SELECT `id` FROM `posts`) UNION (SELECT `id` FROM `videos`)) AS `temp_table`',
        [], true);

    expect(count).toBe(1);
  });

  it('test where shortcut', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('id', 1).orWhere('name', 'foo');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `id` = ? OR `name` = ?');
    expect(builder.getBindings()).toStrictEqual([1, 'foo']);
  });

  it('test where with array conditions', () => {
    builder = getBuilder();
    builder.select('*').from('users').where([['foo', 1], ['bar', 2]]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE (`foo` = ? AND `bar` = ?)');
    expect(builder.getBindings()).toStrictEqual([1, 2]);
    builder = getBuilder();
    builder.select('*').from('users').where({
      'foo': 1,
      'bar': 2
    });
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE (`foo` = ? AND `bar` = ?)');
    expect(builder.getBindings()).toStrictEqual([1, 2]);
    builder = getBuilder();
    builder.select('*').from('users').where([['foo', 1], ['bar', '<', 2]]);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE (`foo` = ? AND `bar` < ?)');
    expect(builder.getBindings()).toStrictEqual([1, 2]);
  });

  it('test nested wheres', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('email', '=', 'foo').orWhere(q => {
      q.where('name', '=', 'bar').where('age', '=', 25);
    });
    expect(builder.toSql()).toBe(
      'SELECT * FROM `users` WHERE `email` = ? OR (`name` = ? AND `age` = ?)');
    expect(builder.getBindings()).toStrictEqual(['foo', 'bar', 25]);
  });

  it('test nested where bindings', () => {
    builder = getBuilder();
    builder.where('email', '=', 'foo').where((q: QueryBuilder) => {
      q.selectRaw('?', ['ignore']).where('name', '=', 'bar');
    });
    builder.toSql();
    expect(builder.getBindings()).toStrictEqual(['foo', 'bar']);
  });

  it('test full sub selects', () => {
    builder = getBuilder();
    builder.select('*').from('users')
      .where('email', '=', 'foo')
      .orWhere('id', '=', q => {
        q.select(raw('max(id)')).from('users').where('email', '=', 'bar');
      });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` WHERE `email` = ? OR `id` = (SELECT max(id) FROM `users` WHERE `email` = ?)');
    expect(builder.getBindings()).toStrictEqual(['foo', 'bar']);
  });

  it('test where exists', () => {
    builder = getBuilder();
    builder.select('*')
      .from('orders')
      .whereExists((q: QueryBuilder) => {
        q.select('*').from('products')
          .where('products.id', '=', raw('`orders`.`id`'));
      });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `orders` WHERE EXISTS (SELECT * FROM `products` WHERE `products`.`id` = `orders`.`id`)');
    builder = getBuilder();
    builder.select('*').from('orders').whereNotExists((q: QueryBuilder) => {
      q.select('*').from('products').where('products.id', '=', raw('`orders`.`id`'));
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `orders` WHERE NOT EXISTS (SELECT * FROM `products` WHERE `products`.`id` = `orders`.`id`)');
    builder = getBuilder();
    builder.select('*').from('orders').where('id', '=', 1).orWhereExists((q: QueryBuilder) => {
      q.select('*').from('products').where('products.id', '=', raw('`orders`.`id`'));
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `orders` WHERE `id` = ? OR EXISTS (SELECT * FROM `products` WHERE `products`.`id` = `orders`.`id`)');
    builder = getBuilder();
    builder.select('*').from('orders').where('id', '=', 1).orWhereNotExists((q: QueryBuilder) => {
      q.select('*').from('products').where('products.id', '=', raw('`orders`.`id`'));
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `orders` WHERE `id` = ? OR NOT EXISTS (SELECT * FROM `products` WHERE `products`.`id` = `orders`.`id`)');
  });

  it('test basic joins', () => {
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', 'users.id', 'contacts.id');
    expect(builder.toSql()).toBe(
      'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id`');
    builder = getBuilder();
    builder.select('*')
      .from('users')
      .join('contacts', 'users.id', '=', 'contacts.id')
      .leftJoin('photos', 'users.id', '=', 'photos.id');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id` LEFT JOIN `photos` ON `users`.`id` = `photos`.`id`');
    builder = getBuilder();
    builder.select('*')
      .from('users')
      .leftJoinWhere('photos', 'users.id', '=', 'bar')
      .joinWhere('photos', 'users.id', '=', 'foo');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` LEFT JOIN `photos` ON `users`.`id` = ? INNER JOIN `photos` ON `users`.`id` = ?');
    expect(builder.getBindings()).toStrictEqual(['bar', 'foo']);
  });

  it('test cross joins', () => {
    builder = getBuilder();
    builder.select('*').from('sizes').crossJoin('colors');
    expect(builder.toSql()).toBe('SELECT * FROM `sizes` CROSS JOIN `colors`');
    builder = getBuilder();
    builder.select('*').from('tableB')
      .join('tableA', 'tableA.column1', '=', 'tableB.column2', 'cross');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `tableB` CROSS JOIN `tableA` ON `tableA`.`column1` = `tableB`.`column2`');
    builder = getBuilder();
    builder.select('*').from('tableB').crossJoin('tableA', 'tableA.column1', '=', 'tableB.column2');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `tableB` CROSS JOIN `tableA` ON `tableA`.`column1` = `tableB`.`column2`');
  });

  it('test complex join', () => {
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', j => {
      j.on('users.id', '=', 'contacts.id')
        .orOn('users.name', '=', 'contacts.name');
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id` OR `users`.`name` = `contacts`.`name`');
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', j => {
      j.where('users.id', '=', 'foo').orWhere('users.name', '=', 'bar');
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = ? OR `users`.`name` = ?');
    expect(builder.getBindings()).toStrictEqual(['foo', 'bar']);
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = ? OR `users`.`name` = ?');
    expect(builder.getBindings()).toStrictEqual(['foo', 'bar']);
  });

  it('test join where null', () => {
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', j => {
      j.on('users.id', '=', 'contacts.id').whereNull('contacts.deleted_at');
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id` AND `contacts`.`deleted_at` IS NULL');
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', j => {
      j.on('users.id', '=', 'contacts.id').orWhereNull('contacts.deleted_at');
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id` OR `contacts`.`deleted_at` IS NULL');
  });

  it('test join where not null', () => {
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', j => {
      j.on('users.id', '=', 'contacts.id').whereNotNull('contacts.deleted_at');
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id` AND `contacts`.`deleted_at` IS NOT NULL');
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', j => {
      j.on('users.id', '=', 'contacts.id').orWhereNotNull('contacts.deleted_at');
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id` OR `contacts`.`deleted_at` IS NOT NULL');
  });

  it('test join where in', () => {
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', j => {
      j.on('users.id', '=', 'contacts.id').whereIn('contacts.name', [48, 'baz', null]);
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id` AND `contacts`.`name` IN (?, ?, ?)');
    expect(builder.getBindings()).toStrictEqual([48, 'baz', null]);
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', j => {
      j.on('users.id', '=', 'contacts.id').orWhereIn('contacts.name', [48, 'baz', null]);
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id` OR `contacts`.`name` IN (?, ?, ?)');
    expect(builder.getBindings()).toStrictEqual([48, 'baz', null]);
  });

  it('test join where in subquery', () => {
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', j => {
      const q = getBuilder();
      q.select('name').from('contacts').where('name', 'baz');
      j.on('users.id', '=', 'contacts.id').whereIn('contacts.name', q);
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id` AND `contacts`.`name` IN (SELECT `name` FROM `contacts` WHERE `name` = ?)');
    expect(builder.getBindings()).toStrictEqual(['baz']);
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', j => {
      const q = getBuilder();
      q.select('name').from('contacts').where('name', 'baz');
      j.on('users.id', '=', 'contacts.id').orWhereIn('contacts.name', q);
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id` OR `contacts`.`name` IN (SELECT `name` FROM `contacts` WHERE `name` = ?)');
    expect(builder.getBindings()).toStrictEqual(['baz']);
  });

  it('test join where not in', () => {
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', j => {
      j.on('users.id', '=', 'contacts.id').whereNotIn('contacts.name', [48, 'baz', null]);
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id` AND `contacts`.`name` NOT IN (?, ?, ?)');
    expect(builder.getBindings()).toStrictEqual([48, 'baz', null]);
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', j => {
      j.on('users.id', '=', 'contacts.id').orWhereNotIn('contacts.name', [48, 'baz', null]);
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id` OR `contacts`.`name` NOT IN (?, ?, ?)');
    expect(builder.getBindings()).toStrictEqual([48, 'baz', null]);
  });

  it('test joins with nested conditions', () => {
    builder = getBuilder();
    builder.select('*').from('users').leftJoin('contacts', j => {
      j.on('users.id', '=', 'contacts.id').where(j => {
        j.where('contacts.country', '=', 'US').orWhere('contacts.is_partner', '=', 1);
      });
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` LEFT JOIN `contacts` ON `users`.`id` = `contacts`.`id` AND (`contacts`.`country` = ? OR `contacts`.`is_partner` = ?)');
    expect(builder.getBindings()).toStrictEqual(['US', 1]);
    builder = getBuilder();
    builder.select('*').from('users').leftJoin('contacts', j => {
      j.on('users.id', '=', 'contacts.id').where('contacts.is_active', '=', 1).orOn(j => {
        j.orWhere(j => {
          j.where('contacts.country', '=', 'UK').orOn('contacts.type', '=', 'users.type');
        }).where(j => {
          j.where('contacts.country', '=', 'US').orWhereNull('contacts.is_partner');
        });
      });
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` LEFT JOIN `contacts` ON `users`.`id` = `contacts`.`id` AND `contacts`.`is_active` = ? OR ((`contacts`.`country` = ? OR `contacts`.`type` = `users`.`type`) AND (`contacts`.`country` = ? OR `contacts`.`is_partner` IS NULL))');
    expect(builder.getBindings()).toStrictEqual([1, 'UK', 'US']);
  });

  it('test joins with advanced conditions', () => {
    builder = getBuilder();
    builder.select('*').from('users').leftJoin('contacts', j => {
      j.on('users.id', 'contacts.id').where(j => {
        j.where('role', 'admin').orWhereNull('contacts.disabled').orWhereRaw(
          'year(contacts.created_at) = 2016');
      });
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` LEFT JOIN `contacts` ON `users`.`id` = `contacts`.`id` AND (`role` = ? OR `contacts`.`disabled` IS NULL OR year(contacts.created_at) = 2016)');
    expect(builder.getBindings()).toStrictEqual(['admin']);
  });

  it('test joins with subquery condition', () => {
    builder = getBuilder();
    builder.select('*').from('users').leftJoin('contacts', j => {
      j.on('users.id', 'contacts.id').whereIn('contact_type_id', q => {
        q.select('id').from('contact_types').where('category_id', '1').whereNull('deleted_at');
      });
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` LEFT JOIN `contacts` ON `users`.`id` = `contacts`.`id` AND `contact_type_id` IN (SELECT `id` FROM `contact_types` WHERE `category_id` = ? AND `deleted_at` IS NULL)');
    expect(builder.getBindings()).toStrictEqual(['1']);
    builder = getBuilder();
    builder.select('*').from('users').leftJoin('contacts', j => {
      j.on('users.id', 'contacts.id').whereExists(q => {
        q.selectRaw('1')
          .from('contact_types')
          .whereRaw('contact_types.id = contacts.contact_type_id')
          .where('category_id', '1')
          .whereNull('deleted_at');
      });
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` LEFT JOIN `contacts` ON `users`.`id` = `contacts`.`id` AND EXISTS (SELECT 1 FROM `contact_types` WHERE contact_types.id = contacts.contact_type_id AND `category_id` = ? AND `deleted_at` IS NULL)');
    expect(builder.getBindings()).toStrictEqual(['1']);
  });

  it('test joins with advanced subquery condition', () => {
    builder = getBuilder();
    builder.select('*').from('users').leftJoin('contacts', j => {
      j.on('users.id', 'contacts.id').whereExists(q => {
        q.selectRaw('1')
          .from('contact_types')
          .whereRaw('contact_types.id = contacts.contact_type_id')
          .where('category_id', '1')
          .whereNull('deleted_at')
          .whereIn('level_id', q => {
            q.select('id').from('levels').where('is_active', true);
          });
      });
    });
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` LEFT JOIN `contacts` ON `users`.`id` = `contacts`.`id` AND EXISTS (SELECT 1 FROM `contact_types` WHERE contact_types.id = contacts.contact_type_id AND `category_id` = ? AND `deleted_at` IS NULL AND `level_id` IN (SELECT `id` FROM `levels` WHERE `is_active` = ?))');
    expect(builder.getBindings()).toStrictEqual(['1', true]);
  });

  it('test joins with nested joins', () => {
    builder = getBuilder();
    builder.select('users.id', 'contacts.id', 'contact_types.id').from('users').leftJoin('contacts',
      j => {
        j.on('users.id', 'contacts.id').join('contact_types', 'contacts.contact_type_id', '=',
          'contact_types.id');
      });
    expect(builder.toSql())
      .toBe(
        'SELECT `users`.`id`, `contacts`.`id`, `contact_types`.`id` FROM `users` LEFT JOIN (`contacts` INNER JOIN `contact_types` ON `contacts`.`contact_type_id` = `contact_types`.`id`) ON `users`.`id` = `contacts`.`id`');
  });

  it('test joins with multiple nested joins', () => {
    builder = getBuilder();
    builder.select('users.id', 'contacts.id', 'contact_types.id', 'countrys.id', 'planets.id')
      .from('users')
      .leftJoin('contacts', j => {
        j.on('users.id', 'contacts.id')
          .join('contact_types', 'contacts.contact_type_id', '=', 'contact_types.id')
          .leftJoin('countrys', q => {
            q.on('contacts.country', '=', 'countrys.country').join('planets', q => {
              q.on('countrys.planet_id', '=', 'planet.id')
                .where('planet.is_settled', '=', 1)
                .where('planet.population', '>=', 10000);
            });
          });
      });
    expect(builder.toSql())
      .toBe(
        'SELECT `users`.`id`, `contacts`.`id`, `contact_types`.`id`, `countrys`.`id`, `planets`.`id` FROM `users` LEFT JOIN (`contacts` INNER JOIN `contact_types` ON `contacts`.`contact_type_id` = `contact_types`.`id` LEFT JOIN (`countrys` INNER JOIN `planets` ON `countrys`.`planet_id` = `planet`.`id` AND `planet`.`is_settled` = ? AND `planet`.`population` >= ?) ON `contacts`.`country` = `countrys`.`country`) ON `users`.`id` = `contacts`.`id`');
    expect(builder.getBindings()).toStrictEqual([1, 10000]);
  });

  it('test joins with nested join with advanced subquery condition', () => {
    builder = getBuilder();
    builder.select('users.id', 'contacts.id', 'contact_types.id').from('users')
      .leftJoin(
        'contacts',
        j => {
          j.on('users.id', 'contacts.id')
            .join('contact_types', 'contacts.contact_type_id', '=', 'contact_types.id')
            .whereExists(q => {
              q.select('*').from('countrys').whereColumn('contacts.country', '=',
                'countrys.country').join('planets', q => {
                q.on('countrys.planet_id', '=', 'planet.id').where('planet.is_settled', '=', 1);
              }).where('planet.population', '>=', 10000);
            });
        });
    expect(builder.toSql())
      .toBe(
        'SELECT `users`.`id`, `contacts`.`id`, `contact_types`.`id` FROM `users` LEFT JOIN (`contacts` INNER JOIN `contact_types` ON `contacts`.`contact_type_id` = `contact_types`.`id`) ON `users`.`id` = `contacts`.`id` AND EXISTS (SELECT * FROM `countrys` INNER JOIN `planets` ON `countrys`.`planet_id` = `planet`.`id` AND `planet`.`is_settled` = ? WHERE `contacts`.`country` = `countrys`.`country` AND `planet`.`population` >= ?)');
    expect(builder.getBindings()).toStrictEqual([1, 10000]);
  });

  it('test join sub', () => {
    builder = getBuilder();
    builder.from('users').joinSub('SELECT * FROM `contacts`', 'sub', 'users.id', '=', 'sub.id');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN (SELECT * FROM `contacts`) AS `sub` ON `users`.`id` = `sub`.`id`');
    builder = getBuilder();
    builder.from('users').joinSub(q => {
      q.from('contacts');
    }, 'sub', 'users.id', '=', 'sub.id');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` INNER JOIN (SELECT * FROM `contacts`) AS `sub` ON `users`.`id` = `sub`.`id`');
    builder = getBuilder();

    // todo support
    // let fedacoBuilder = new EloquentBuilder(getBuilder().from('contacts'));
    // builder.from('users').joinSub(fedacoBuilder, 'sub', 'users.id', '=', 'sub.id');
    // expect(builder.toSql())
    //   .toBe('SELECT * FROM `users` inner join (SELECT * FROM `contacts`) as `sub` on `users`.`id` = `sub`.`id`');

    builder    = getBuilder();
    const sub1 = getBuilder().from('contacts').where('name', 'foo');
    const sub2 = getBuilder().from('contacts').where('name', 'bar');
    builder.from('users')
      .joinSub(sub1, 'sub1', 'users.id', '=', 1, 'inner', true)
      .joinSub(sub2, 'sub2', 'users.id', '=', 'sub2.user_id');
    let expected = 'SELECT * FROM `users` ';
    expected += 'INNER JOIN (SELECT * FROM `contacts` WHERE `name` = ?) AS `sub1` ON `users`.`id` = ? ';
    expected += 'INNER JOIN (SELECT * FROM `contacts` WHERE `name` = ?) AS `sub2` ON `users`.`id` = `sub2`.`user_id`';
    expect(builder.toSql()).toBe(expected);
    expect(builder.getRawBindings()['join']).toStrictEqual(['foo', 1, 'bar']);
    builder = getBuilder();
    expect(() => {
      // @ts-ignore
      builder.from('users').joinSub(['foo'], 'sub', 'users.id', '=', 'sub.id');
    }).toThrowError('InvalidArgumentException');

  });

  it('test join sub with prefix', () => {
    builder = getBuilder();
    builder.getGrammar().setTablePrefix('prefix_');
    builder.from('users').joinSub('SELECT * FROM `contacts`', 'sub', 'users.id', '=', 'sub.id');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `prefix_users` INNER JOIN (SELECT * FROM `contacts`) AS `prefix_sub` ON `prefix_users`.`id` = `prefix_sub`.`id`');
  });

  it('test left join sub', () => {
    builder = getBuilder();
    builder.from('users').leftJoinSub(getBuilder().from('contacts'), 'sub', 'users.id', '=',
      'sub.id');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` LEFT JOIN (SELECT * FROM `contacts`) AS `sub` ON `users`.`id` = `sub`.`id`');
    builder = getBuilder();
    expect(() => {
      // @ts-ignore
      builder.from('users').leftJoinSub(['foo'], 'sub', 'users.id', '=', 'sub.id');
    }).toThrowError('InvalidArgumentException');
  });

  it('test right join sub', () => {
    builder = getBuilder();
    builder.from('users').rightJoinSub(getBuilder().from('contacts'), 'sub', 'users.id', '=',
      'sub.id');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` RIGHT JOIN (SELECT * FROM `contacts`) AS `sub` ON `users`.`id` = `sub`.`id`');
    builder = getBuilder();
    expect(() => {
      // @ts-ignore
      builder.from('users').rightJoinSub(['foo'], 'sub', 'users.id', '=', 'sub.id');
    }).toThrowError('InvalidArgumentException');
  });

  it('test raw expressions in select', () => {
    builder = getBuilder();
    builder.select(raw('substr(foo, 6)')).from('users');
    expect(builder.toSql()).toBe('SELECT substr(foo, 6) FROM `users`');
  });

  it('test find returns first result by i d', async () => {
    let spySelect, spyProcessSelect;
    builder   = getBuilder();
    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'foo': 'bar'
      }
    ]));

    spyProcessSelect = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (query, results) => {
        expect(query).toBe(builder);
        expect(results).toStrictEqual([
          {
            'foo': 'bar'
          }
        ]);
        return results;
      });

    const results = await builder.from('users').find(1);
    expect(spySelect).toBeCalledWith('SELECT * FROM `users` WHERE `id` = ? LIMIT 1', [1], true);
    // expect(spyProcessSelect).toHaveBeenCalledWith(builder, [{
    //   'foo': 'bar'
    // }]);
    expect(results).toStrictEqual({
      'foo': 'bar'
    });
  });

  it('test first method returns first result', async () => {
    let spySelect, spyProcessSelect;
    builder = getBuilder();

    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'foo': 'bar'
      }
    ]));

    spyProcessSelect = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (query, results) => {
        expect(query).toBe(builder);
        expect(results).toStrictEqual([
          {
            'foo': 'bar'
          }
        ]);
        return results;
      });

    const results = await builder.from('users').where('id', '=', 1).first();
    expect(spySelect).toBeCalledWith('SELECT * FROM `users` WHERE `id` = ? LIMIT 1', [1], true);
    expect(results).toStrictEqual({
      'foo': 'bar'
    });
  });

  it('test pluck method gets collection of column values', async () => {
    let spySelect, spyProcessSelect, results;
    builder          = getBuilder();
    spySelect        = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'foo': 'bar'
      }, {
        'foo': 'baz'
      }
    ]));
    spyProcessSelect = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (query, results) => {
        expect(query).toBe(builder);
        expect(results).toStrictEqual([
          {
            'foo': 'bar'
          }, {
            'foo': 'baz'
          }
        ]);
        return results;
      });
    results          = await builder.from('users').where('id', '=', 1).pluck('foo');
    expect(spySelect).toBeCalledWith('SELECT `foo` FROM `users` WHERE `id` = ?', [1], true);
    expect(results).toStrictEqual(['bar', 'baz']);


    builder          = getBuilder();
    spySelect        = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'id' : 1,
        'foo': 'bar'
      }, {
        'id' : 10,
        'foo': 'baz'
      }
    ]));
    spyProcessSelect = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (query, results) => {
        expect(query).toBe(builder);
        expect(results).toStrictEqual([
          {
            'id' : 1,
            'foo': 'bar'
          }, {
            'id' : 10,
            'foo': 'baz'
          }
        ]);
        return results;
      });

    results = await builder.from('users').where('id', '=', 1).pluck('foo', 'id');
    expect(spySelect).toBeCalledWith('SELECT `foo`, `id` FROM `users` WHERE `id` = ?', [1], true);

    expect(results).toStrictEqual({'1': 'bar', '10': 'baz'});

  });

  /*
      it('test implode', () => {
        builder = getBuilder();
        builder.getConnection().shouldReceive('select').once().andReturn([{
          'foo': 'bar'
        }, {
          'foo': 'baz'
        }]);
        builder.getProcessor().shouldReceive('processSelect').once()._with(builder, [{
          'foo': 'bar'
        }, {
          'foo': 'baz'
        }]).andReturnUsing((query, results) => {
          return results;
        });
        let results = builder.from('users').where('id', '=', 1).implode('foo');
        expect(results).toBe('barbaz');
        builder = getBuilder();
        builder.getConnection().shouldReceive('select').once().andReturn([{
          'foo': 'bar'
        }, {
          'foo': 'baz'
        }]);
        builder.getProcessor().shouldReceive('processSelect').once()._with(builder, [{
          'foo': 'bar'
        }, {
          'foo': 'baz'
        }]).andReturnUsing((query, results) => {
          return results;
        });
        let results = builder.from('users').where('id', '=', 1).implode('foo', ',');
        expect(results).toBe('bar,baz');
      });

      it('test value method returns single column', () => {
        let spySelect, spyProcessSelect;
        builder = getBuilder();
        builder.getConnection()
          .shouldReceive('select')
          .once()
          ._with('select "foo" from "users" WHERE "id" = ? limit 1', [1], true)
          .andReturn([{
            'foo': 'bar'
          }]);

        builder.getProcessor().shouldReceive('processSelect').once()._with(builder, [{
          'foo': 'bar'
        }]).andReturn([{
          'foo': 'bar'
        }]);
        let results = builder.from('users').where('id', '=', 1).value('foo');
        expect(results).toBe('bar');
      });
*/

  it('test aggregate functions', async () => {
    let spySelect, spyProcessSelect, results;
    builder   = getBuilder();
    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'aggregate': 1
      }
    ]));

    spyProcessSelect = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (builder, results) => {
        return results;
      });

    results = await builder.from('users').count();
    expect(spySelect).toBeCalledWith('SELECT count(*) AS aggregate FROM `users`', [], true);
    expect(results).toBe(1);
    builder   = getBuilder();
    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'exists': 1
      }
    ]));

    results = await builder.from('users').exists();
    expect(spySelect).toBeCalledWith('SELECT exists(SELECT * FROM `users`) AS `exists`', [], true);
    expect(results).toBeTruthy();
    builder   = getBuilder();
    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'exists': 0
      }
    ]));
    results   = await builder.from('users').doesntExist();
    expect(spySelect).toBeCalledWith('SELECT exists(SELECT * FROM `users`) AS `exists`', [], true);
    expect(results).toBeTruthy();
    builder          = getBuilder();
    spySelect        = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'aggregate': 1
      }
    ]));
    spyProcessSelect = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (builder, results) => {
        return results;
      });
    results          = await builder.from('users').max('id');
    expect(spySelect).toBeCalledWith('SELECT max(`id`) AS aggregate FROM `users`', [], true);
    expect(results).toBeTruthy();
    builder          = getBuilder();
    spySelect        = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'aggregate': 1
      }
    ]));
    spyProcessSelect = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (query, results) => {
        return results;
      });
    results          = await builder.from('users').min('id');
    expect(spySelect).toBeCalledWith('SELECT min(`id`) AS aggregate FROM `users`', [], true);
    expect(results).toBeTruthy();
    builder          = getBuilder();
    spySelect        = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'aggregate': 1
      }
    ]));
    spyProcessSelect = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (query, results) => {
        return results;
      });
    results          = await builder.from('users').sum('id');
    expect(spySelect).toBeCalledWith('SELECT sum(`id`) AS aggregate FROM `users`', [], true);
    expect(results).toBe(1);
  });

  it('test aggregate functions with distinct', async () => {
    let spySelect, spyProcessSelect, results
    builder   = getBuilder();
    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'aggregate': 1
      }
    ]));

    spyProcessSelect = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (builder, results) => {
        return results;
      });

    results = await builder.distinct('foo').from('users').count();
    expect(spySelect).toBeCalledWith('SELECT count(DISTINCT `foo`) AS aggregate FROM `users`', [], true);
    expect(results).toBe(1);

    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'aggregate': 2
      }
    ]));

    spyProcessSelect = jest.spyOn(builder._processor, 'processSelect').mockImplementation(
      (builder, results) => {
        return results;
      });

    results = await builder.distinct().from('users').count('*');
    expect(spySelect).toBeCalledWith('SELECT count(*) AS aggregate FROM `users`', [], true);
    expect(results).toBe(2);

    results = await builder.distinct().from('users').count('bar');
    expect(spySelect).toBeCalledWith('SELECT count(DISTINCT `bar`) AS aggregate FROM `users`', [], true);

  });



  /*
      it('test sql server exists', () => {
        builder = getSqlServerBuilder();
        builder.getConnection()
          .shouldReceive('select')
          .once()
          ._with('select top 1 1 [exists] from [users]', [], true)
          .andReturn([{
            'exists': 1
          }]);
        let results = builder.from('users').exists();
        this.assertTrue(results);
      });

      it('test exists or', () => {
        builder = getBuilder();
        builder.getConnection().shouldReceive('select').andReturn([{
          'exists': 1
        }]);
        let results = builder.from('users').doesntExistOr(() => {
          return 123;
        });
        expect(results).toBe(123);
        builder = getBuilder();
        builder.getConnection().shouldReceive('select').andReturn([{
          'exists': 0
        }]);
        let results = builder.from('users').doesntExistOr(() => {
          throw new RuntimeException();
        });
        this.assertTrue(results);
      });

      it('test doesnt exists or', () => {
        builder = getBuilder();
        builder.getConnection().shouldReceive('select').andReturn([{
          'exists': 0
        }]);
        let results = builder.from('users').existsOr(() => {
          return 123;
        });
        expect(results).toBe(123);
        builder = getBuilder();
        builder.getConnection().shouldReceive('select').andReturn([{
          'exists': 1
        }]);
        let results = builder.from('users').existsOr(() => {
          throw new RuntimeException();
        });
        this.assertTrue(results);
      });
*/

  it('test aggregate reset followed by get', async () => {
    let spySelect, spyProcessSelect, count, result, sum;
    builder   = getBuilder();
    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'aggregate': 1
      }
    ]));
    builder.from('users').select('column1', 'column2');
    count = await builder.count();
    expect(spySelect).toBeCalledWith('SELECT count(*) AS aggregate FROM `users`', [], true);
    expect(count).toBe(1);


    builder   = getBuilder();
    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'aggregate': 2
      }
    ]));
    builder.from('users').select('column1', 'column2');
    sum = await builder.sum('id');
    expect(spySelect).toBeCalledWith('SELECT sum(`id`) AS aggregate FROM `users`', [], true);
    expect(sum).toBe(2);


    builder   = getBuilder();
    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'column1': 'foo',
        'column2': 'bar'
      }
    ]));
    builder.from('users').select('column1', 'column2');
    result = await builder.get();
    expect(spySelect).toBeCalledWith('SELECT `column1`, `column2` FROM `users`', [], true);
    expect(result).toStrictEqual([
      {
        'column1': 'foo',
        'column2': 'bar'
      }
    ]);

  });

  it('test aggregate reset followed by select get', async () => {
    let spySelect, spyProcessSelect, result;
    builder   = getBuilder();
    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'aggregate': 1
      }
    ]));
    builder.from('users');
    const count = await builder.count('column1');
    expect(spySelect).toBeCalledWith('SELECT count(`column1`) AS aggregate FROM `users`', [], true);
    expect(count).toBe(1);


    builder   = getBuilder();
    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'column2': 'foo',
        'column3': 'bar'
      }
    ]));
    builder.from('users');
    result = await builder.select('column2', 'column3').get();
    expect(spySelect).toBeCalledWith('SELECT `column2`, `column3` FROM `users`', [], true);
    expect(result).toStrictEqual([
      {
        'column2': 'foo',
        'column3': 'bar'
      }
    ]);
  });

  it('test aggregate reset followed by get with columns', async () => {
    let spySelect, count, result;
    builder = getBuilder();

    builder   = getBuilder();
    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'aggregate': 1
      }
    ]));
    builder.from('users');
    count = await builder.count('column1');
    expect(spySelect).toBeCalledWith('SELECT count(`column1`) AS aggregate FROM `users`', [], true);
    expect(count).toBe(1);


    builder   = getBuilder();
    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'column2': 'foo',
        'column3': 'bar'
      }
    ]));
    builder.from('users');
    result = await builder.get(['column2', 'column3']);
    expect(spySelect).toBeCalledWith('SELECT `column2`, `column3` FROM `users`', [], true);
    expect(result).toStrictEqual([
      {
        'column2': 'foo',
        'column3': 'bar'
      }
    ]);
  });

  it('test aggregate with sub select', async () => {
    let spySelect, count;
    builder   = getBuilder();
    spySelect = jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([
      {
        'aggregate': 1
      }
    ]));

    builder.from('users').selectSub(query => {
      query.from('posts').select('foo', 'bar').where('title', 'foo');
    }, 'post');
    count = await builder.count();
    expect(spySelect).toHaveBeenLastCalledWith('SELECT count(*) AS aggregate FROM `users`', [],
      true);
    expect(count).toBe(1);

    // expect(builder.toSql()).toBe('SELECT * FROM `users`')
    // expect(builder._columns[0].getValue()).toBe('(select `foo`, `bar` from `posts` where `title` = ?) as `post`')
    expect(builder.toSql()).toBe(
      'SELECT (SELECT `foo`, `bar` FROM `posts` WHERE `title` = ?) AS `post` FROM `users`');
    // expect(builder.getBindings()).toStrictEqual(['foo']);
  });

  it('test subqueries bindings', () => {
    builder      = getBuilder();
    const second = getBuilder().select('*').from('users').orderByRaw('id = ?', 2);
    const third  = getBuilder().select('*').from('users').where('id', 3).groupBy('id').having('id',
      '!=', 4);
    builder.groupBy('a').having('a', '=', 1).union(second).union(third);
    expect(builder.toSql())
      .toBe(
        '(SELECT * GROUP BY `a` HAVING `a` = ?) UNION (SELECT * FROM `users` ORDER BY id = ?) UNION (SELECT * FROM `users` WHERE `id` = ? GROUP BY `id` HAVING `id` != ?)');
    expect(builder.getBindings()).toStrictEqual([1, 2, 3, 4]);
    builder = getBuilder().select('*').from('users')
      .where('email', '=', q => {
        q.select(raw('max(id)'))
          .from('users')
          .where('email', '=', 'bar')
          .orderByRaw('email like ?', '%.com')
          .groupBy('id')
          .having('id', '=', 4);
      })
      .orWhere('id', '=', 'foo').groupBy('id').having('id', '=', 5);
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` WHERE `email` = (SELECT max(id) FROM `users` WHERE `email` = ? GROUP BY `id` HAVING `id` = ? ORDER BY email like ?) OR `id` = ? GROUP BY `id` HAVING `id` = ?');
    expect(builder.getBindings()).toStrictEqual(['bar', 4, '%.com', 'foo', 5]);
  });

  it('test insert method', () => {
    let spyInsert, result;
    builder   = getBuilder();
    spyInsert = jest.spyOn(builder._connection, 'insert').mockReturnValue(Promise.resolve(true));

    result = builder.from('users').insert({
      'email': 'foo'
    });
    expect(spyInsert).toBeCalledWith('INSERT INTO `users` (`email`) VALUES (?)', ['foo']);
    expect(result).toBeTruthy();
  });


  it('test insert using method', async () => {
    let spyInsert, result;
    builder   = getBuilder();
    spyInsert = jest.spyOn(builder._connection, 'affectingStatement').mockReturnValue(
      Promise.resolve(1));

    result = await builder.from('table1').insertUsing(['foo'], query => {
      query.select(['bar']).from('table2').where('foreign_id', '=', 5);
    });
    expect(spyInsert)
      .toBeCalledWith(
        'INSERT INTO `table1` (`foo`) (SELECT `bar` FROM `table2` WHERE `foreign_id` = ?)', [5]);
    expect(result).toBe(1);
  });

  it('test insert using invalid subquery', async () => {
    builder = getBuilder();
    await expect(async () => {
      // @ts-ignore
      await builder.from('table1').insertUsing(['foo'], ['bar']);
    }).rejects.toThrowError('InvalidArgumentException');
  });

  // it('test insert or ignore method', () => {
  //   this.expectException(RuntimeException);
  //   this.expectExceptionMessage('does not support');
  //   builder = getBuilder();
  //   builder.from('users').insertOrIgnore({
  //     'email': 'foo'
  //   });
  // });

  it('test my sql insert or ignore method', async () => {
    let spyInsert, result;
    builder   = getMySqlBuilder();
    spyInsert = jest.spyOn(builder._connection, 'affectingStatement').mockReturnValue(
      Promise.resolve(1));

    result = await builder.from('users').insertOrIgnore({
      'email': 'foo'
    });
    expect(spyInsert).toBeCalledWith('INSERT IGNORE INTO `users` (`email`) VALUES (?)', ['foo']);
    expect(result).toBe(1);
  });

  it('test postgres insert or ignore method', async () => {
    let spyInsert, result;
    builder   = getPostgresBuilder();
    spyInsert = jest.spyOn(builder._connection, 'affectingStatement').mockReturnValue(
      Promise.resolve(1));

    result = await builder.from('users').insertOrIgnore({
      'email': 'foo'
    });
    expect(spyInsert).toBeCalledWith(
      'INSERT INTO "users" ("email") VALUES ($1) ON conflict do nothing', ['foo']);
    expect(result).toBe(1);
  });

  it('test sqlite insert or ignore method', async () => {
    let spyInsert, result;
    builder   = getSQLiteBuilder();
    spyInsert = jest.spyOn(builder._connection, 'affectingStatement').mockReturnValue(
      Promise.resolve(1));

    result = await builder.from('users').insertOrIgnore({
      'email': 'foo'
    });
    expect(spyInsert).toBeCalledWith('INSERT OR IGNORE INTO "users" ("email") VALUES (?)', ['foo']);
    expect(result).toBe(1);
  });

  it('test sql server insert or ignore method', async () => {
    // this.expectException(RuntimeException);
    // this.expectExceptionMessage('does not support');

    await expect(async () => {
      builder = getSqlServerBuilder();
      await builder.from('users').insertOrIgnore({
        'email': 'foo'
      });
    }).rejects.toThrowError('RuntimeException');

  });

  it('test insert get id method', async () => {
    let spyInsert, result;
    builder   = getBuilder();
    spyInsert = jest.spyOn(builder._processor, 'processInsertGetId').mockReturnValue(
      Promise.resolve(1));

    result = await builder.from('users').insertGetId({
      'email': 'foo'
    }, 'id');
    expect(spyInsert).toBeCalledWith(builder,
      'INSERT INTO `users` (`email`) VALUES (?) returning `id`', ['foo'], 'id');
    expect(result).toBe(1);
  });

  it('test insert get id method removes expressions', async () => {
    let spyInsert, result;
    builder   = getBuilder();
    spyInsert = jest.spyOn(builder._processor, 'processInsertGetId')
      .mockReturnValue(Promise.resolve(1));

    result = await builder.from('users').insertGetId({
      'email': 'foo',
      'bar'  : raw('bar')
    }, 'id');
    expect(spyInsert).toBeCalledWith(builder,
      'INSERT INTO `users` (`email`, `bar`) VALUES (?, bar) returning `id`',
      ['foo'], 'id');
    expect(result).toBe(1);
  });


  it('test insert get id with empty values', async () => {
    let spyInsert, result;
    builder   = getMySqlBuilder();
    spyInsert = jest.spyOn(builder._processor, 'processInsertGetId')
      .mockReturnValue(Promise.resolve(1));
    await builder.from('users').insertGetId([]);
    expect(spyInsert).toBeCalledWith(builder, 'INSERT INTO `users` () VALUES () returning `id`', [],
      'id');


    builder   = getPostgresBuilder();
    spyInsert = jest.spyOn(builder._processor, 'processInsertGetId')
      .mockReturnValue(Promise.resolve(1));
    await builder.from('users').insertGetId([]);
    expect(spyInsert).toBeCalledWith(builder, 'INSERT INTO "users" DEFAULT VALUES returning "id"',
      [], 'id');


    builder   = getSQLiteBuilder();
    spyInsert = jest.spyOn(builder._processor, 'processInsertGetId')
      .mockReturnValue(Promise.resolve(1));
    await builder.from('users').insertGetId([]);
    expect(spyInsert).toBeCalledWith(builder, 'INSERT INTO "users" DEFAULT VALUES', [], 'id');

    builder   = getSqlServerBuilder();
    spyInsert = jest.spyOn(builder._processor, 'processInsertGetId')
      .mockReturnValue(Promise.resolve(1));
    await builder.from('users').insertGetId([]);
    expect(spyInsert)
      .toBeCalledWith(builder,
        'set nocount on;INSERT INTO [users] DEFAULT VALUES;select scope_identity() as [id]', [],
        'id');
  });

  it('test insert method respects raw bindings', async () => {
    let spyInsert, result;
    builder   = getBuilder();
    spyInsert = jest.spyOn(builder._connection, 'insert').mockReturnValue(Promise.resolve(true));

    result = await builder.from('users').insert({
      'email': raw('CURRENT TIMESTAMP')
    });
    expect(spyInsert).toBeCalledWith('INSERT INTO `users` (`email`) VALUES (CURRENT TIMESTAMP)',
      []);
    expect(result).toBeTruthy();
  });

  it('test multiple inserts with expression values', async () => {
    let spyInsert, result;
    builder   = getBuilder();
    spyInsert = jest.spyOn(builder._connection, 'insert').mockReturnValue(Promise.resolve(true));


    result = await builder.from('users').insert([
      {
        'email': raw('UPPER(\'Foo\')')
      }, {
        'email': raw('LOWER(\'Foo\')')
      }
    ]);


    expect(spyInsert).toBeCalledWith(
      'INSERT INTO `users` (`email`) VALUES (UPPER(\'Foo\')), (LOWER(\'Foo\'))', []);
    expect(result).toBeTruthy();
  });

  it('test update method', async () => {
    let spyUpdate, result;
    builder   = getBuilder();
    // @ts-ignore
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));

    result = await builder.from('users').where('id', '=', 1).update({
      'email': 'foo',
      'name' : 'bar'
    });
    expect(spyUpdate).toBeCalledWith('UPDATE `users` SET `email` = ?, `name` = ? WHERE `id` = ?',
      ['foo', 'bar', 1]);
    expect(result).toBe(1);
    builder   = getMySqlBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').where('id', '=', 1).orderBy('foo', 'desc').limit(
      5).update({
      'email': 'foo',
      'name' : 'bar'
    });
    expect(spyUpdate)
      .toBeCalledWith(
        'UPDATE `users` SET `email` = ?, `name` = ? WHERE `id` = ? ORDER BY `foo` DESC LIMIT 5',
        ['foo', 'bar', 1]);
    expect(result).toBe(1);
  });

  it('test update method with joins', async () => {
    let spyUpdate, result;
    builder   = getBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));

    result = await builder.from('users')
      .join('orders', 'users.id', '=', 'orders.user_id')
      .where('users.id', '=', 1)
      .update({
        'email': 'foo',
        'name' : 'bar'
      });
    expect(spyUpdate)
      .toBeCalledWith(
        'UPDATE `users` INNER JOIN `orders` ON `users`.`id` = `orders`.`user_id` SET `users`.`email` = ?, `users`.`name` = ? WHERE `users`.`id` = ?',
        ['foo', 'bar', 1]);

    expect(result).toBe(1);
    builder   = getBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));

    result = await builder.from('users').join('orders', join => {
      join.on('users.id', '=', 'orders.user_id').where('users.id', '=', 1);
    }).update({
      'email': 'foo',
      'name' : 'bar'
    });
    expect(spyUpdate)
      .toBeCalledWith(
        'UPDATE `users` INNER JOIN `orders` ON `users`.`id` = `orders`.`user_id` AND `users`.`id` = ? SET `users`.`email` = ?, `users`.`name` = ?',
        [1, 'foo', 'bar']);
    expect(result).toBe(1);
  });

  it('test update method with joins on sql server', async () => {
    let spyUpdate, result;
    builder   = getSqlServerBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users')
      .join('orders', 'users.id', '=', 'orders.user_id')
      .where('users.id', '=', 1)
      .update({
        'email': 'foo',
        'name' : 'bar'
      });
    expect(spyUpdate)
      .toBeCalledWith(
        'UPDATE [users] SET [users].[email] = ?, [users].[name] = ? FROM [users] INNER JOIN [orders] ON [users].[id] = [orders].[user_id] WHERE [users].[id] = ?',
        ['foo', 'bar', 1]);
    expect(result).toBe(1);

    builder   = getSqlServerBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').join('orders', join => {
      join.on('users.id', '=', 'orders.user_id').where('users.id', '=', 1);
    }).update({
      'email': 'foo',
      'name' : 'bar'
    });
    expect(spyUpdate)
      .toBeCalledWith(
        'UPDATE [users] SET [users].[email] = ?, [users].[name] = ? FROM [users] INNER JOIN [orders] ON [users].[id] = [orders].[user_id] AND [users].[id] = ?',
        ['foo', 'bar', 1]);
    expect(result).toBe(1);
  });

  it('test update method with joins on my sql', async () => {
    let spyUpdate, result;
    builder   = getMySqlBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users')
      .join('orders', 'users.id', '=', 'orders.user_id')
      .where('users.id', '=', 1)
      .update({
        'email': 'foo',
        'name' : 'bar'
      });
    expect(spyUpdate)
      .toBeCalledWith(
        'UPDATE `users` INNER JOIN `orders` ON `users`.`id` = `orders`.`user_id` SET `users`.`email` = ?, `users`.`name` = ? WHERE `users`.`id` = ?',
        ['foo', 'bar', 1]);
    expect(result).toBe(1);

    builder   = getMySqlBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').join('orders', join => {
      join.on('users.id', '=', 'orders.user_id').where('users.id', '=', 1);
    }).update({
      'email': 'foo',
      'name' : 'bar'
    });
    expect(spyUpdate)
      .toBeCalledWith(
        'UPDATE `users` INNER JOIN `orders` ON `users`.`id` = `orders`.`user_id` AND `users`.`id` = ? SET `users`.`email` = ?, `users`.`name` = ?',
        [1, 'foo', 'bar']);
    expect(result).toBe(1);
  });

  xit('test update method with joins on sqlite', async () => {
    let spyUpdate, result;
    builder   = getSQLiteBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').where('users.id', '>', 1).limit(3).oldest('id').update({
      'email': 'foo',
      'name' : 'bar'
    });
    expect(spyUpdate)
      .toBeCalledWith(
        'UPDATE "users" SET "email" = ?, "name" = ? WHERE "rowid" IN (SELECT "users"."rowid" FROM "users" WHERE "users"."id" > ? ORDER BY "id" ASC limit 3)',
        ['foo', 'bar', 1]);
    expect(result).toBe(1);

    builder   = getSQLiteBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users')
      .join('orders', 'users.id', '=', 'orders.user_id')
      .where('users.id', '=', 1)
      .update({
        'email': 'foo',
        'name' : 'bar'
      });
    expect(spyUpdate)
      .toBeCalledWith(
        'UPDATE "users" SET "email" = ?, "name" = ? WHERE "rowid" IN (SELECT "users"."rowid" FROM "users" INNER JOIN "orders" ON "users"."id" = "orders"."user_id" WHERE "users"."id" = ?)',
        ['foo', 'bar', 1]);
    expect(result).toBe(1);

    builder   = getSQLiteBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').join('orders', join => {
      join.on('users.id', '=', 'orders.user_id').where('users.id', '=', 1);
    }).update({
      'email': 'foo',
      'name' : 'bar'
    });
    expect(spyUpdate)
      .toBeCalledWith(
        'UPDATE "users" SET "email" = ?, "name" = ? WHERE "rowid" IN (SELECT "users"."rowid" FROM "users" INNER JOIN "orders" ON "users"."id" = "orders"."user_id" AND "users"."id" = ?)',
        ['foo', 'bar', 1]);
    expect(result).toBe(1);

    builder   = getSQLiteBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users as u').join('orders as o', 'u.id', '=',
      'o.user_id').update({
      'email': 'foo',
      'name' : 'bar'
    });
    expect(spyUpdate)
      .toBeCalledWith(
        'update "users" as "u" set "email" = ?, "name" = ? where "rowid" in (select "u"."rowid" from "users" as "u" inner join "orders" as "o" on "u"."id" = "o"."user_id")',
        ['foo', 'bar']);
    expect(result).toBe(1);
  });

  it('test update method with joins and aliases on sql server', async () => {
    let spyUpdate, result;
    builder   = getSqlServerBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users as u').join('orders', 'u.id', '=',
      'orders.user_id').where(
      'u.id', '=', 1).update({
      'email': 'foo',
      'name' : 'bar'
    });
    expect(spyUpdate)
      .toBeCalledWith(
        'UPDATE [u] SET [u].[email] = ?, [u].[name] = ? FROM [users] AS [u] INNER JOIN [orders] ON [u].[id] = [orders].[user_id] WHERE [u].[id] = ?',
        ['foo', 'bar', 1]);
    expect(result).toBe(1);
  });

  it('test update method without joins on postgres', async () => {
    let spyUpdate, result;
    builder   = getPostgresBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').where('id', '=', 1).update({
      'users.email': 'foo',
      'name'       : 'bar'
    });
    expect(spyUpdate).toBeCalledWith('UPDATE "users" SET "email" = $1, "name" = $2 WHERE "id" = $3',
      ['foo', 'bar', 1]);
    expect(result).toBe(1);


    builder   = getPostgresBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').where('id', '=', 1).selectRaw('?', ['ignore']).update({
      'users.email': 'foo',
      'name'       : 'bar'
    });
    expect(spyUpdate).toBeCalledWith('UPDATE "users" SET "email" = $1, "name" = $2 WHERE "id" = $3',
      ['foo', 'bar', 1]);
    expect(result).toBe(1);


    builder   = getPostgresBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users.users').where('id', '=', 1).selectRaw('?',
      ['ignore']).update({
      'users.users.email': 'foo',
      'name'             : 'bar'
    });
    expect(spyUpdate)
      .toBeCalledWith('UPDATE "users"."users" SET "email" = $1, "name" = $2 WHERE "id" = $3',
        ['foo', 'bar', 1]);
    expect(result).toBe(1);
  });

  it('test update method with joins on postgres', async () => {
    let spyUpdate, result;
    builder   = getPostgresBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users')
      .join('orders', 'users.id', '=', 'orders.user_id')
      .where('users.id', '=', 1)
      .update({
        'email': 'foo',
        'name' : 'bar'
      });
    expect(spyUpdate)
      .toBeCalledWith(
        'UPDATE "users" SET "email" = $1, "name" = $2 WHERE "ctid" IN (SELECT "users"."ctid" FROM "users" INNER JOIN "orders" ON "users"."id" = "orders"."user_id" WHERE "users"."id" = $3)',
        ['foo', 'bar', 1]);
    expect(result).toBe(1);


    builder   = getPostgresBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').join('orders', join => {
      join.on('users.id', '=', 'orders.user_id').where('users.id', '=', 1);
    }).update({
      'email': 'foo',
      'name' : 'bar'
    });
    expect(spyUpdate)
      .toBeCalledWith(
        'UPDATE "users" SET "email" = $1, "name" = $2 WHERE "ctid" IN (SELECT "users"."ctid" FROM "users" INNER JOIN "orders" ON "users"."id" = "orders"."user_id" AND "users"."id" = $3)',
        ['foo', 'bar', 1]);
    expect(result).toBe(1);


    builder   = getPostgresBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').join('orders', join => {
      join.on('users.id', '=', 'orders.user_id').where('users.id', '=', 1);
    }).where('name', 'baz').update({
      'email': 'foo',
      'name' : 'bar'
    });
    expect(spyUpdate)
      .toBeCalledWith(
        'UPDATE "users" SET "email" = $1, "name" = $2 WHERE "ctid" IN (SELECT "users"."ctid" FROM "users" INNER JOIN "orders" ON "users"."id" = "orders"."user_id" AND "users"."id" = $3 WHERE "name" = $4)',
        ['foo', 'bar', 1, 'baz']);
    expect(result).toBe(1);
  });

  it('test update method respects raw', async () => {
    let spyUpdate, result;
    builder   = getBuilder();
    spyUpdate = jest.spyOn(builder._connection, 'update').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').where('id', '=', 1).update({
      'email': raw('foo'),
      'name' : 'bar'
    });
    expect(spyUpdate)
      .toBeCalledWith('UPDATE `users` SET `email` = foo, `name` = ? WHERE `id` = ?', ['bar', 1]);
    expect(result).toBe(1);
  });

  // it('test update or insert method', () => {
  //   let builder = m.mock(Builder + '[where,exists,insert]',
  //     [m.mock(ConnectionInterface), new Grammar(), m.mock(Processor)]);
  //   builder.shouldReceive('where').once()._with({
  //     'email': 'foo'
  //   }).andReturn(m.self());
  //   builder.shouldReceive('exists').once().andReturn(false);
  //   builder.shouldReceive('insert').once()._with({
  //     'email': 'foo',
  //     'name' : 'bar'
  //   }).andReturn(true);
  //   this.assertTrue(builder.updateOrInsert({
  //     'email': 'foo'
  //   }, {
  //     'name': 'bar'
  //   }));
  //   let builder = m.mock(Builder + '[where,exists,update]',
  //     [m.mock(ConnectionInterface), new Grammar(), m.mock(Processor)]);
  //   builder.shouldReceive('where').once()._with({
  //     'email': 'foo'
  //   }).andReturn(m.self());
  //   builder.shouldReceive('exists').once().andReturn(true);
  //   builder.shouldReceive('take').andReturnSelf();
  //   builder.shouldReceive('update').once()._with({
  //     'name': 'bar'
  //   }).andReturn(1);
  //   this.assertTrue(builder.updateOrInsert({
  //     'email': 'foo'
  //   }, {
  //     'name': 'bar'
  //   }));
  // });
  //
  it('test update or insert method works with empty update values without from', async () => {
    let spyUpdate, spyExists, spyWhere;
    builder = getBuilder();
    jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([{exists: 0}]));
    spyUpdate = jest.spyOn(builder, 'update').mockRestore();
    spyExists = jest.spyOn(builder, 'exists').mockRestore();
    spyWhere  = jest.spyOn(builder, 'where').mockRestore();

    await expect(async () => {
      await builder.updateOrInsert({
        'email': 'foo'
      });
    }).rejects.toThrowError('must call from before insert');

  });

  it('test update or insert method works with empty update values', async () => {
    let spyUpdate, spyExists, spyWhere;
    builder = getBuilder();
    jest.spyOn(builder._connection, 'select').mockReturnValue(Promise.resolve([{exists: 0}]));
    jest.spyOn(builder._connection, 'insert').mockReturnValue(Promise.resolve(true));
    spyUpdate = jest.spyOn(builder, 'update');
    spyExists = jest.spyOn(builder, 'exists');
    spyWhere  = jest.spyOn(builder, 'where');

    expect(builder.from('users').updateOrInsert({
      'email': 'foo'
    })).toBeTruthy();
    expect(spyWhere).toBeCalledWith({'email': 'foo'});
    expect(spyUpdate).toBeCalledTimes(0);

  });

  it('test delete method', async () => {
    let spyDelete, result;
    builder   = getBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').where('email', '=', 'foo').delete();
    expect(spyDelete)
      .toBeCalledWith('DELETE FROM `users` WHERE `email` = ?', ['foo']);
    expect(result).toBe(1);


    builder   = getBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').delete(1);
    expect(spyDelete)
      .toBeCalledWith('DELETE FROM `users` WHERE `users`.`id` = ?', [1]);
    expect(result).toBe(1);


    builder   = getBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').selectRaw('?', ['ignore']).delete(1);
    expect(spyDelete)
      .toBeCalledWith('DELETE FROM `users` WHERE `users`.`id` = ?', [1]);
    expect(result).toBe(1);


    builder   = getSQLiteBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').where('email', '=', 'foo').orderBy('id').take(
      1).delete();
    expect(spyDelete)
      .toBeCalledWith(
        'DELETE FROM "users" WHERE "rowid" IN (SELECT "users"."rowid" FROM "users" WHERE "email" = ? ORDER BY "id" ASC LIMIT 1)',
        ['foo']);
    expect(result).toBe(1);


    builder   = getMySqlBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').where('email', '=', 'foo').orderBy('id').take(
      1).delete();
    expect(spyDelete)
      .toBeCalledWith('DELETE FROM `users` WHERE `email` = ? ORDER BY `id` ASC LIMIT 1', ['foo']);
    expect(result).toBe(1);


    builder   = getSqlServerBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').where('email', '=', 'foo').delete();
    expect(spyDelete)
      .toBeCalledWith('DELETE FROM [users] WHERE [email] = ?', ['foo']);
    expect(result).toBe(1);


    builder   = getSqlServerBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').where('email', '=', 'foo').orderBy('id').take(
      1).delete();
    expect(spyDelete)
      .toBeCalledWith('DELETE top (1) FROM [users] WHERE [email] = ?', ['foo']);
    expect(result).toBe(1);
  });

  it('test delete with join method', async () => {
    let spyDelete, result;
    builder   = getSQLiteBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users')
      .join('contacts', 'users.id', '=', 'contacts.id')
      .where('users.email', '=', 'foo')
      .orderBy('users.id')
      .limit(1)
      .delete();
    expect(spyDelete)
      .toBeCalledWith(
        'DELETE FROM "users" WHERE "rowid" IN (SELECT "users"."rowid" FROM "users" INNER JOIN "contacts" ON "users"."id" = "contacts"."id" WHERE "users"."email" = ? ORDER BY "users"."id" ASC LIMIT 1)',
        ['foo']);
    expect(result).toBe(1);


    builder   = getSQLiteBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users as u').join('contacts as c', 'u.id', '=',
      'c.id').delete();
    expect(spyDelete)
      .toBeCalledWith(
        'DELETE FROM "users" AS "u" WHERE "rowid" IN (SELECT "u"."rowid" FROM "users" AS "u" INNER JOIN "contacts" AS "c" ON "u"."id" = "c"."id")',
        []);
    expect(result).toBe(1);


    builder   = getMySqlBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users')
      .join('contacts', 'users.id', '=', 'contacts.id')
      .where('email', '=', 'foo')
      .orderBy('id')
      .limit(1)
      .delete();
    expect(spyDelete)
      .toBeCalledWith(
        'DELETE `users` FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id` WHERE `email` = ?',
        ['foo']);
    expect(result).toBe(1);


    builder   = getMySqlBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users AS a')
      .join('users AS b', 'a.id', '=', 'b.user_id')
      .where('email', '=', 'foo')
      .orderBy('id')
      .limit(1)
      .delete();
    expect(spyDelete)
      .toBeCalledWith(
        'DELETE `a` FROM `users` AS `a` INNER JOIN `users` AS `b` ON `a`.`id` = `b`.`user_id` WHERE `email` = ?',
        ['foo']);
    expect(result).toBe(1);


    builder   = getMySqlBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').join('contacts', 'users.id', '=',
      'contacts.id').orderBy(
      'id').take(1).delete(1);
    expect(spyDelete)
      .toBeCalledWith(
        'DELETE `users` FROM `users` INNER JOIN `contacts` ON `users`.`id` = `contacts`.`id` WHERE `users`.`id` = ?',
        [1]);
    expect(result).toBe(1);


    builder   = getSqlServerBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users')
      .join('contacts', 'users.id', '=', 'contacts.id')
      .where('email', '=', 'foo')
      .delete();
    expect(spyDelete)
      .toBeCalledWith(
        'DELETE [users] FROM [users] INNER JOIN [contacts] ON [users].[id] = [contacts].[id] WHERE [email] = ?',
        ['foo']);
    expect(result).toBe(1);


    builder   = getSqlServerBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users AS a')
      .join('users AS b', 'a.id', '=', 'b.user_id')
      .where('email', '=', 'foo')
      .orderBy('id')
      .limit(1)
      .delete();
    expect(spyDelete)
      .toBeCalledWith(
        'DELETE [a] FROM [users] AS [a] INNER JOIN [users] AS [b] ON [a].[id] = [b].[user_id] WHERE [email] = ?',
        ['foo']);
    expect(result).toBe(1);


    builder   = getSqlServerBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').join('contacts', 'users.id', '=', 'contacts.id').delete(
      1);
    expect(spyDelete)
      .toBeCalledWith(
        'DELETE [users] FROM [users] INNER JOIN [contacts] ON [users].[id] = [contacts].[id] WHERE [users].[id] = ?',
        [1]);
    expect(result).toBe(1);


    builder   = getPostgresBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users')
      .join('contacts', 'users.id', '=', 'contacts.id')
      .where('users.email', '=', 'foo')
      .delete();
    expect(spyDelete)
      .toBeCalledWith(
        'DELETE FROM "users" WHERE "ctid" IN (SELECT "users"."ctid" FROM "users" INNER JOIN "contacts" ON "users"."id" = "contacts"."id" WHERE "users"."email" = $1)',
        ['foo']);
    expect(result).toBe(1);


    builder   = getPostgresBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users AS a')
      .join('users AS b', 'a.id', '=', 'b.user_id')
      .where('email', '=', 'foo')
      .orderBy('id')
      .limit(1)
      .delete();
    expect(spyDelete)
      .toBeCalledWith(
        'DELETE FROM "users" AS "a" WHERE "ctid" IN (SELECT "a"."ctid" FROM "users" AS "a" INNER JOIN "users" AS "b" ON "a"."id" = "b"."user_id" WHERE "email" = $1 ORDER BY "id" ASC LIMIT 1)',
        ['foo']);
    expect(result).toBe(1);


    builder   = getPostgresBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').join('contacts', 'users.id', '=',
      'contacts.id').orderBy(
      'id').take(1).delete(1);
    expect(spyDelete)
      .toBeCalledWith(
        'DELETE FROM "users" WHERE "ctid" IN (SELECT "users"."ctid" FROM "users" INNER JOIN "contacts" ON "users"."id" = "contacts"."id" WHERE "users"."id" = $1 ORDER BY "id" ASC LIMIT 1)',
        [1]);
    expect(result).toBe(1);


    builder   = getPostgresBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').join('contacts', join => {
      join.on('users.id', '=', 'contacts.user_id').where('users.id', '=', 1);
    }).where('name', 'baz').delete();
    expect(spyDelete)
      .toBeCalledWith(
        'DELETE FROM "users" WHERE "ctid" IN (SELECT "users"."ctid" FROM "users" INNER JOIN "contacts" ON "users"."id" = "contacts"."user_id" AND "users"."id" = $1 WHERE "name" = $2)',
        [1, 'baz']);
    expect(result).toBe(1);


    builder   = getPostgresBuilder();
    spyDelete = jest.spyOn(builder._connection, 'delete').mockReturnValue(Promise.resolve(1));
    result    = await builder.from('users').join('contacts', 'users.id', '=',
      'contacts.id').delete();
    expect(spyDelete)
      .toBeCalledWith(
        'DELETE FROM "users" WHERE "ctid" IN (SELECT "users"."ctid" FROM "users" INNER JOIN "contacts" ON "users"."id" = "contacts"."id")',
        []);
    expect(result).toBe(1);

  });

  it('test truncate method', async () => {
    let spyStatement;
    builder      = getBuilder();
    spyStatement = jest.spyOn(builder._connection, 'statement').mockReturnValue(Promise.resolve(1));
    await builder.from('users').truncate();
    expect(spyStatement).toBeCalledWith('TRUNCATE TABLE `users`', []);

    const sqlite = new SqliteQueryGrammar();
    builder      = getSQLiteBuilder();
    builder.from('usersx');
    expect(sqlite.compileTruncate(builder)).toStrictEqual({
      'DELETE FROM sqlite_sequence WHERE name = ?': ['usersx'],
      'DELETE FROM "usersx"'                      : []
    });
  });

  it('test postgres insert get id', async () => {
    let spyInsertGetId, result;
    builder        = getPostgresBuilder();
    spyInsertGetId = jest.spyOn(builder._processor, 'processInsertGetId').mockReturnValue(
      Promise.resolve(1));
    result         = await builder.from('users').insertGetId({
      'email': 'foo'
    }, 'id');
    expect(spyInsertGetId).toBeCalledWith(builder,
      'INSERT INTO "users" ("email") VALUES ($1) returning "id"',
      ['foo'], 'id');
    expect(result).toBe(1);
  });

  it('test sql server insert get id', async () => {
    let spyInsertGetId, result;
    builder        = getSqlServerBuilder();
    spyInsertGetId = jest.spyOn(builder._processor, 'processInsertGetId').mockReturnValue(
      Promise.resolve(1));
    result         = await builder.from('users').insertGetId({
      'email': 'foo'
    }, 'id');
    expect(spyInsertGetId).toBeCalledWith(builder,
      'set nocount on;INSERT INTO [users] ([email]) VALUES (?);select scope_identity() as [id]',
      ['foo'], 'id');
    expect(result).toBe(1);
  });

  it('test my sql wrapping', async () => {
    builder = getMySqlBuilder();
    await builder.select('*').from('users');
    expect(builder.toSql()).toBe('SELECT * FROM `users`');
  });
  //
  // it('test my sql update wrapping json', () => {
  //   let grammar    = new MySqlGrammar();
  //   let processor  = m.mock(Processor);
  //   let connection = this.createMock(ConnectionInterface);
  //   connection.expects(this.once())
  //     .method('update')
  //     ._with(
  //       'update `users` set `name` = json_set(`name`, \'$."first_name"\', ?), `name` = json_set(`name`, \'$."last_name"\', ?) where `active` = ?',
  //       ['John', 'Doe', 1]);
  //   let builder = new Builder(connection, grammar, processor);
  //   builder.from('users').where('active', '=', 1).update({
  //     'name->first_name': 'John',
  //     'name->last_name' : 'Doe'
  //   });
  // });
  //
  // it('test my sql update wrapping nested json', () => {
  //   let grammar    = new MySqlGrammar();
  //   let processor  = m.mock(Processor);
  //   let connection = this.createMock(ConnectionInterface);
  //   connection.expects(this.once())
  //     .method('update')
  //     ._with(
  //       'update `users` set `meta` = json_set(`meta`, \'$."name"."first_name"\', ?), `meta` = json_set(`meta`, \'$."name"."last_name"\', ?) where `active` = ?',
  //       ['John', 'Doe', 1]);
  //   let builder = new Builder(connection, grammar, processor);
  //   builder.from('users').where('active', '=', 1).update({
  //     'meta->name->first_name': 'John',
  //     'meta->name->last_name' : 'Doe'
  //   });
  // });
  //
  // it('test my sql update wrapping json array', () => {
  //   let grammar    = new MySqlGrammar();
  //   let processor  = m.mock(Processor);
  //   let connection = this.createMock(ConnectionInterface);
  //   connection.expects(this.once())
  //     .method('update')
  //     ._with(
  //       'update `users` set `options` = ?, `meta` = json_set(`meta`, \'$."tags"\', cast(? as json)), `group_id` = 45, `created_at` = ? where `active` = ?',
  //       [json_encode({
  //         '2fa'    : false,
  //         'presets': ['laravel', 'vue']
  //       }), json_encode(['white', 'large']), new DateTime('2019-08-06'), 1]);
  //   let builder = new Builder(connection, grammar, processor);
  //   builder.from('users').where('active', 1).update({
  //     'options'   : {
  //       '2fa'    : false,
  //       'presets': ['laravel', 'vue']
  //     },
  //     'meta->tags': ['white', 'large'],
  //     'group_id'  : raw('45'),
  //     'created_at': new DateTime('2019-08-06')
  //   });
  // });
  //
  // it('test my sql update with json prepares bindings correctly', () => {
  //   let grammar    = new MySqlGrammar();
  //   let processor  = m.mock(Processor);
  //   let connection = m.mock(ConnectionInterface);
  //   connection.shouldReceive('update')
  //     .once()
  //     ._with(
  //       'update `users` set `options` = json_set(`options`, \'$."enable"\', false), `updated_at` = ? where `id` = ?',
  //       ['2015-05-26 22:02:06', 0]);
  //   let builder = new Builder(connection, grammar, processor);
  //   builder.from('users').where('id', '=', 0).update({
  //     'options->enable': false,
  //     'updated_at'     : '2015-05-26 22:02:06'
  //   });
  //   connection.shouldReceive('update')
  //     .once()
  //     ._with('update `users` set `options` = json_set(`options`, \'$."size"\', ?), `updated_at` = ? where `id` = ?',
  //       [45, '2015-05-26 22:02:06', 0]);
  //   let builder = new Builder(connection, grammar, processor);
  //   builder.from('users').where('id', '=', 0).update({
  //     'options->size': 45,
  //     'updated_at'   : '2015-05-26 22:02:06'
  //   });
  //   builder = getMySqlBuilder();
  //   builder.getConnection()
  //     .shouldReceive('update')
  //     .once()
  //     ._with('update `users` set `options` = json_set(`options`, \'$."size"\', ?)', [null]);
  //   builder.from('users').update({
  //     'options->size': null
  //   });
  //   builder = getMySqlBuilder();
  //   builder.getConnection()
  //     .shouldReceive('update')
  //     .once()
  //     ._with('update `users` set `options` = json_set(`options`, \'$."size"\', 45)', []);
  //   builder.from('users').update({
  //     'options->size': raw('45')
  //   });
  // });
  //
  // it('test postgres update wrapping json', () => {
  //   builder = getPostgresBuilder();
  //   builder.getConnection()
  //     .shouldReceive('update')
  //     ._with('update "users" set "options" = jsonb_set("options"::jsonb, \'{"name","first_name"}\', ?)',
  //       ['"John"']);
  //   builder.from('users').update({
  //     'users.options->name->first_name': 'John'
  //   });
  //   builder = getPostgresBuilder();
  //   builder.getConnection()
  //     .shouldReceive('update')
  //     ._with('update "users" set "options" = jsonb_set("options"::jsonb, \'{"language"}\', \'null\')', []);
  //   builder.from('users').update({
  //     'options->language': raw('\'null\'')
  //   });
  // });
  //
  // it('test postgres update wrapping json array', () => {
  //   builder = getPostgresBuilder();
  //   builder.getConnection()
  //     .shouldReceive('update')
  //     ._with(
  //       'update "users" set "options" = ?, "meta" = jsonb_set("meta"::jsonb, \'{"tags"}\', ?), "group_id" = 45, "created_at" = ?',
  //       [json_encode({
  //         '2fa'    : false,
  //         'presets': ['laravel', 'vue']
  //       }), json_encode(['white', 'large']), new DateTime('2019-08-06')]);
  //   builder.from('users').update({
  //     'options'   : {
  //       '2fa'    : false,
  //       'presets': ['laravel', 'vue']
  //     },
  //     'meta->tags': ['white', 'large'],
  //     'group_id'  : raw('45'),
  //     'created_at': new DateTime('2019-08-06')
  //   });
  // });
  //
  // it('test sqlite update wrapping json array', () => {
  //   builder = getSQLiteBuilder();
  //   builder.getConnection()
  //     .shouldReceive('update')
  //     ._with('update "users" set "options" = ?, "group_id" = 45, "created_at" = ?', [json_encode({
  //       '2fa'    : false,
  //       'presets': ['laravel', 'vue']
  //     }), new DateTime('2019-08-06')]);
  //   builder.from('users').update({
  //     'options'   : {
  //       '2fa'    : false,
  //       'presets': ['laravel', 'vue']
  //     },
  //     'group_id'  : raw('45'),
  //     'created_at': new DateTime('2019-08-06')
  //   });
  // });
  //
  // it('test sqlite update wrapping nested json array', () => {
  //   builder = getSQLiteBuilder();
  //   builder.getConnection()
  //     .shouldReceive('update')
  //     ._with(
  //       'update "users" set "group_id" = 45, "created_at" = ?, "options" = json_patch(ifnull("options", json(\'{}\')), json(?))',
  //       [new DateTime('2019-08-06'), json_encode({
  //         'name'    : 'Taylor',
  //         'security': {
  //           '2fa'    : false,
  //           'presets': ['laravel', 'vue']
  //         },
  //         'sharing' : {
  //           'twitter': 'username'
  //         }
  //       })]);
  //   builder.from('users').update({
  //     'options->name'            : 'Taylor',
  //     'group_id'                 : raw('45'),
  //     'options->security'        : {
  //       '2fa'    : false,
  //       'presets': ['laravel', 'vue']
  //     },
  //     'options->sharing->twitter': 'username',
  //     'created_at'               : new DateTime('2019-08-06')
  //   });
  // });
  //
  // it('test my sql wrapping json with string', () => {
  //   builder = getMySqlBuilder();
  //   builder.select('*').from('users').where('items->sku', '=', 'foo-bar');
  //   expect(builder.toSql()).toBe('SELECT * FROM `users` where json_unquote(json_extract(`items`, \'$."sku"\')) = ?');
  //   this.assertCount(1, builder.getRawBindings()['where']);
  //   this.assertSame('foo-bar', builder.getRawBindings()['where'][0]);
  // });
  //
  // it('test my sql wrapping json with integer', () => {
  //   builder = getMySqlBuilder();
  //   builder.select('*').from('users').where('items->price', '=', 1);
  //   expect(builder.toSql()).toBe('SELECT * FROM `users` where json_unquote(json_extract(`items`, \'$."price"\')) = ?');
  // });
  //
  // it('test my sql wrapping json with double', () => {
  //   builder = getMySqlBuilder();
  //   builder.select('*').from('users').where('items->price', '=', 1.5);
  //   expect(builder.toSql()).toBe('SELECT * FROM `users` where json_unquote(json_extract(`items`, \'$."price"\')) = ?');
  // });
  //
  // it('test my sql wrapping json with boolean', () => {
  //   builder = getMySqlBuilder();
  //   builder.select('*').from('users').where('items->available', '=', true);
  //   expect(builder.toSql()).toBe('SELECT * FROM `users` where json_extract(`items`, \'$."available"\') = true');
  //   builder = getMySqlBuilder();
  //   builder.select('*').from('users').where(raw('items->\'$.available\''), '=', true);
  //   expect(builder.toSql()).toBe('SELECT * FROM `users` where items->\'$.available\' = true');
  // });
  //
  // it('test my sql wrapping json with boolean and integer that looks like one', () => {
  //   builder = getMySqlBuilder();
  //   builder.select('*')
  //     .from('users')
  //     .where('items->available', '=', true)
  //     .where('items->active', '=', false)
  //     .where('items->number_available', '=', 0);
  //   expect(builder.toSql())
  //     .toBe(
  //       'SELECT * FROM `users` where json_extract(`items`, \'$."available"\') = true and json_extract(`items`, \'$."active"\') = false and json_unquote(json_extract(`items`, \'$."number_available"\')) = ?');
  // });
  //
  // it('test json path escaping', () => {
  //   let expectedWithJsonEscaped = 'select json_unquote(json_extract(`json`, \'$."\\\'))#"\'))';
  //   let builder                 = getMySqlBuilder();
  //   builder.select('json->\'))#');
  //   this.assertEquals(expectedWithJsonEscaped, builder.toSql());
  //   builder = getMySqlBuilder();
  //   builder.select('json->\\\'))#');
  //   this.assertEquals(expectedWithJsonEscaped, builder.toSql());
  //   builder = getMySqlBuilder();
  //   builder.select('json->\\\'))#');
  //   this.assertEquals(expectedWithJsonEscaped, builder.toSql());
  //   builder = getMySqlBuilder();
  //   builder.select('json->\\\\\'))#');
  //   this.assertEquals(expectedWithJsonEscaped, builder.toSql());
  // });
  //
  // it('test my sql wrapping json', () => {
  //   builder = getMySqlBuilder();
  //   builder.select('*').from('users').whereRaw('items->\'$."price"\' = 1');
  //   expect(builder.toSql()).toBe('SELECT * FROM `users` where items->\'$."price"\' = 1');
  //   builder = getMySqlBuilder();
  //   builder.select('items->price').from('users').where('users.items->price', '=', 1).orderBy('items->price');
  //   expect(builder.toSql())
  //     .toBe(
  //       'select json_unquote(json_extract(`items`, \'$."price"\')) from `users` where json_unquote(json_extract(`users`.`items`, \'$."price"\')) = ? ORDER BY json_unquote(json_extract(`items`, \'$."price"\')) asc');
  //   builder = getMySqlBuilder();
  //   builder.select('*').from('users').where('items->price->in_usd', '=', 1);
  //   expect(builder.toSql())
  //     .toBe('SELECT * FROM `users` where json_unquote(json_extract(`items`, \'$."price"."in_usd"\')) = ?');
  //   builder = getMySqlBuilder();
  //   builder.select('*').from('users').where('items->price->in_usd', '=', 1).where('items->age', '=', 2);
  //   expect(builder.toSql())
  //     .toBe(
  //       'SELECT * FROM `users` where json_unquote(json_extract(`items`, \'$."price"."in_usd"\')) = ? and json_unquote(json_extract(`items`, \'$."age"\')) = ?');
  // });
  //
  // it('test postgres wrapping json', () => {
  //   builder = getPostgresBuilder();
  //   builder.select('items->price').from('users').where('users.items->price', '=', 1).orderBy('items->price');
  //   expect(builder.toSql())
  //     .toBe(
  //       'select "items"->>\'price\' from "users" WHERE "users"."items"->>\'price\' = ? ORDER BY "items"->>\'price\' asc');
  //   builder = getPostgresBuilder();
  //   builder.select('*').from('users').where('items->price->in_usd', '=', 1);
  //   expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE "items"->\'price\'->>\'in_usd\' = ?');
  //   builder = getPostgresBuilder();
  //   builder.select('*').from('users').where('items->price->in_usd', '=', 1).where('items->age', '=', 2);
  //   expect(builder.toSql())
  //     .toBe('SELECT * FROM "users" WHERE "items"->\'price\'->>\'in_usd\' = ? and "items"->>\'age\' = ?');
  //   builder = getPostgresBuilder();
  //   builder.select('*').from('users').where('items->prices->0', '=', 1).where('items->age', '=', 2);
  //   expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE "items"->\'prices\'->>0 = ? and "items"->>\'age\' = ?');
  //   builder = getPostgresBuilder();
  //   builder.select('*').from('users').where('items->available', '=', true);
  //   expect(builder.toSql()).toBe('SELECT * FROM "users" where ("items"->\'available\')::jsonb = \'true\'::jsonb');
  // });
  //
  // it('test sql server wrapping json', () => {
  //   builder = getSqlServerBuilder();
  //   builder.select('items->price').from('users').where('users.items->price', '=', 1).orderBy('items->price');
  //   expect(builder.toSql())
  //     .toBe(
  //       'select json_value([items], \'$."price"\') from [users] where json_value([users].[items], \'$."price"\') = ? ORDER BY json_value([items], \'$."price"\') asc');
  //   builder = getSqlServerBuilder();
  //   builder.select('*').from('users').where('items->price->in_usd', '=', 1);
  //   expect(builder.toSql()).toBe('SELECT * FROM [users] where json_value([items], \'$."price"."in_usd"\') = ?');
  //   builder = getSqlServerBuilder();
  //   builder.select('*').from('users').where('items->price->in_usd', '=', 1).where('items->age', '=', 2);
  //   expect(builder.toSql())
  //     .toBe(
  //       'SELECT * FROM [users] where json_value([items], \'$."price"."in_usd"\') = ? and json_value([items], \'$."age"\') = ?');
  //   builder = getSqlServerBuilder();
  //   builder.select('*').from('users').where('items->available', '=', true);
  //   expect(builder.toSql()).toBe('SELECT * FROM [users] where json_value([items], \'$."available"\') = \'true\'');
  // });
  //
  // it('test sqlite wrapping json', () => {
  //   builder = getSQLiteBuilder();
  //   builder.select('items->price').from('users').where('users.items->price', '=', 1).orderBy('items->price');
  //   expect(builder.toSql())
  //     .toBe(
  //       'select json_extract("items", \'$."price"\') from "users" where json_extract("users"."items", \'$."price"\') = ? ORDER BY json_extract("items", \'$."price"\') asc');
  //   builder = getSQLiteBuilder();
  //   builder.select('*').from('users').where('items->price->in_usd', '=', 1);
  //   expect(builder.toSql()).toBe('SELECT * FROM "users" where json_extract("items", \'$."price"."in_usd"\') = ?');
  //   builder = getSQLiteBuilder();
  //   builder.select('*').from('users').where('items->price->in_usd', '=', 1).where('items->age', '=', 2);
  //   expect(builder.toSql())
  //     .toBe(
  //       'SELECT * FROM "users" where json_extract("items", \'$."price"."in_usd"\') = ? and json_extract("items", \'$."age"\') = ?');
  //   builder = getSQLiteBuilder();
  //   builder.select('*').from('users').where('items->available', '=', true);
  //   expect(builder.toSql()).toBe('SELECT * FROM "users" where json_extract("items", \'$."available"\') = true');
  // });
  //
  it('test sqlite order by', () => {
    builder = getSQLiteBuilder();
    builder.select('*').from('users').orderBy('email', 'desc');
    expect(builder.toSql()).toBe('SELECT * FROM "users" ORDER BY "email" DESC');
  });

  xit('test sql server limits and offsets', () => {
    builder = getSqlServerBuilder();
    builder.select('*').from('users').take(10);
    expect(builder.toSql()).toBe('SELECT top 10 * FROM [users]');
    builder = getSqlServerBuilder();
    builder.select('*').from('users').skip(10);
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM (select *, row_number() over (order by (select 0)) as row_num from [users]) as temp_table where row_num >= 11 ORDER BY row_num');
    builder = getSqlServerBuilder();
    builder.select('*').from('users').skip(10).take(10);
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM (select *, row_number() over (order by (select 0)) as row_num from [users]) as temp_table where row_num between 11 and 20 ORDER BY row_num');
    builder = getSqlServerBuilder();
    builder.select('*').from('users').skip(10).take(10).orderBy('email', 'desc');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM (select *, row_number() over (order by [email] desc) as row_num from [users]) as temp_table where row_num between 11 and 20 ORDER BY row_num');
  });

  it('test my sql sounds like operator', () => {
    builder = getMySqlBuilder();
    builder.select('*').from('users').where('name', 'sounds like', 'John Doe');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `name` sounds like ?');
    expect(builder.getBindings()).toStrictEqual(['John Doe']);
  });

  // it('test merge wheres can merge wheres and bindings', () => {
  //   builder = getBuilder();
  //   builder._wheres = ['foo'];
  //   builder.mergeWheres(['wheres'], {
  //     12: 'foo',
  //     13: 'bar'
  //   });
  //   // this.assertEquals(['foo', 'wheres'], builder._wheres);
  //   expect(builder._wheres).toStrictEqual(['foo', 'wheres']);
  //   expect(builder.getBindings()).toStrictEqual(['foo', 'bar']);
  // });
  //
  it('test providing null with operators builds correctly', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('foo', null);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `foo` is null');
    builder = getBuilder();
    builder.select('*').from('users').where('foo', '=', null);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `foo` is null');
    builder = getBuilder();
    builder.select('*').from('users').where('foo', '!=', null);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `foo` is not null');
    builder = getBuilder();
    builder.select('*').from('users').where('foo', '<>', null);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `foo` is not null');
  });
  //
  // it('test dynamic where', () => {
  //   let method     = 'whereFooBarAndBazOrQux';
  //   let parameters = ['corge', 'waldo', 'fred'];
  //   let builder    = m.mock(Builder).makePartial();
  //   builder.shouldReceive('where')._with('foo_bar', '=', parameters[0], 'and').once().andReturnSelf();
  //   builder.shouldReceive('where')._with('baz', '=', parameters[1], 'and').once().andReturnSelf();
  //   builder.shouldReceive('where')._with('qux', '=', parameters[2], 'or').once().andReturnSelf();
  //   this.assertEquals(builder, builder.dynamicWhere(method, parameters));
  // });
  //
  // it('test dynamic where is not greedy', () => {
  //   let method     = 'whereIosVersionAndAndroidVersionOrOrientation';
  //   let parameters = ['6.1', '4.2', 'Vertical'];
  //   let builder    = m.mock(Builder).makePartial();
  //   builder.shouldReceive('where')._with('ios_version', '=', '6.1', 'and').once().andReturnSelf();
  //   builder.shouldReceive('where')._with('android_version', '=', '4.2', 'and').once().andReturnSelf();
  //   builder.shouldReceive('where')._with('orientation', '=', 'Vertical', 'or').once().andReturnSelf();
  //   builder.dynamicWhere(method, parameters);
  // });
  //
  // it('test call triggers dynamic where', () => {
  //   builder = getBuilder();
  //   this.assertEquals(builder, builder.whereFooAndBar('baz', 'qux'));
  //   this.assertCount(2, builder.wheres);
  // });
  //
  // it('test builder throws expected exception with undefined method', () => {
  //   this.expectException(BadMethodCallException);
  //   builder = getBuilder();
  //   builder.getConnection().shouldReceive('select');
  //   builder.getProcessor().shouldReceive('processSelect').andReturn([]);
  //   builder.noValidMethodHere();
  // });
  //
  it('test my sql lock', () => {
    builder = getMySqlBuilder();
    builder.select('*').from('foo').where('bar', '=', 'baz').lock();
    expect(builder.toSql()).toBe('SELECT * FROM `foo` WHERE `bar` = ? for update');
    expect(builder.getBindings()).toStrictEqual(['baz']);
    builder = getMySqlBuilder();
    builder.select('*').from('foo').where('bar', '=', 'baz').lock(false);
    expect(builder.toSql()).toBe('SELECT * FROM `foo` WHERE `bar` = ? lock in share mode');
    expect(builder.getBindings()).toStrictEqual(['baz']);
    builder = getMySqlBuilder();
    builder.select('*').from('foo').where('bar', '=', 'baz').lock('lock in share mode');
    expect(builder.toSql()).toBe('SELECT * FROM `foo` WHERE `bar` = ? lock in share mode');
    expect(builder.getBindings()).toStrictEqual(['baz']);
  });

  it('test postgres lock', () => {
    builder = getPostgresBuilder();
    builder.select('*').from('foo').where('bar', '=', 'baz').lock();
    expect(builder.toSql()).toBe('SELECT * FROM "foo" WHERE "bar" = $1 for update');
    expect(builder.getBindings()).toStrictEqual(['baz']);
    builder = getPostgresBuilder();
    builder.select('*').from('foo').where('bar', '=', 'baz').lock(false);
    expect(builder.toSql()).toBe('SELECT * FROM "foo" WHERE "bar" = $1 for share');
    expect(builder.getBindings()).toStrictEqual(['baz']);
    builder = getPostgresBuilder();
    builder.select('*').from('foo').where('bar', '=', 'baz').lock('for key share');
    expect(builder.toSql()).toBe('SELECT * FROM "foo" WHERE "bar" = $1 for key share');
    expect(builder.getBindings()).toStrictEqual(['baz']);
  });

  it('test sql server lock', () => {
    builder = getSqlServerBuilder();
    builder.select('*').from('foo').where('bar', '=', 'baz').lock();
    expect(builder.toSql()).toBe(
      'SELECT * FROM [foo] with(rowlock,updlock,holdlock) WHERE [bar] = ?');
    expect(builder.getBindings()).toStrictEqual(['baz']);
    builder = getSqlServerBuilder();
    builder.select('*').from('foo').where('bar', '=', 'baz').lock(false);
    expect(builder.toSql()).toBe('SELECT * FROM [foo] with(rowlock,holdlock) WHERE [bar] = ?');
    expect(builder.getBindings()).toStrictEqual(['baz']);
    builder = getSqlServerBuilder();
    builder.select('*').from('foo').where('bar', '=', 'baz').lock('with(holdlock)');
    expect(builder.toSql()).toBe('SELECT * FROM [foo] with(holdlock) WHERE [bar] = ?');
    expect(builder.getBindings()).toStrictEqual(['baz']);
  });

  it('test select with lock uses write pdo', () => {
    builder = getMySqlBuilder();
    builder.select('*').from('foo').where('bar', '=', 'baz').lock();
    expect(builder.toSql()).toBe('SELECT * FROM `foo` WHERE `bar` = ? for update');
    builder = getMySqlBuilder();
    builder.select('*').from('foo').where('bar', '=', 'baz').lock(false);
    expect(builder.toSql()).toBe('SELECT * FROM `foo` WHERE `bar` = ? lock in share mode');
  });

  it('test binding order', () => {
    const expectedSql      = 'SELECT * FROM `users` INNER JOIN `othertable` ON `bar` = ? WHERE `registered` = ? GROUP BY `city` HAVING `population` > ? ORDER BY match ("foo") against(?)';
    const expectedBindings = ['foo', 1, 3, 'bar'];
    builder                = getBuilder();
    builder.select('*')
      .from('users')
      .join('othertable', join => {
        join.where('bar', '=', 'foo');
      })
      .where('registered', 1)
      .groupBy('city')
      .having('population', '>', 3)
      .orderByRaw('match ("foo") against(?)', ['bar']);
    expect(builder.toSql()).toBe(expectedSql);
    expect(builder.getBindings()).toStrictEqual(expectedBindings);
    builder = getBuilder();
    builder.select('*')
      .from('users')
      .orderByRaw('match ("foo") against(?)', ['bar'])
      .having('population', '>', 3)
      .groupBy('city')
      .where('registered', 1)
      .join('othertable', join => {
        join.where('bar', '=', 'foo');
      });
    expect(builder.toSql()).toBe(expectedSql);
    expect(builder.getBindings()).toStrictEqual(expectedBindings);
  });

  it('test add binding with array merges bindings', () => {
    builder = getBuilder();
    builder.addBinding(['foo', 'bar']);
    builder.addBinding(['baz']);
    expect(builder.getBindings()).toStrictEqual(['foo', 'bar', 'baz']);
  });

  it('test add binding with array merges bindings in correct order', () => {
    builder = getBuilder();
    builder.addBinding(['bar', 'baz'], 'having');
    builder.addBinding(['foo'], 'where');
    expect(builder.getBindings()).toStrictEqual(['foo', 'bar', 'baz']);
  });
  //
  // it('test merge builders', () => {
  //   builder = getBuilder();
  //   builder.addBinding(['foo', 'bar']);
  //   let otherBuilder = getBuilder();
  //   otherBuilder.addBinding(['baz']);
  //   builder.mergeBindings(otherBuilder);
  //   expect(builder.getBindings()).toStrictEqual(['foo', 'bar', 'baz']);
  // });

  // it('test merge builders binding order', () => {
  //   builder = getBuilder();
  //   builder.addBinding('foo', 'where');
  //   builder.addBinding('baz', 'having');
  //   let otherBuilder = getBuilder();
  //   otherBuilder.addBinding('bar', 'where');
  //   builder.mergeBindings(otherBuilder);
  //   expect(builder.getBindings()).toStrictEqual(['foo', 'bar', 'baz']);
  // });

  it('test sub select', () => {
    const expectedSql      = 'SELECT "foo", "bar", (SELECT "baz" FROM "two" WHERE "subkey" = $1) AS "sub" FROM "one" WHERE "_key" = $2';
    const expectedBindings = ['subval', 'val'];
    builder                = getPostgresBuilder();
    builder.from('one').select(['foo', 'bar'])
      .where('_key', '=', 'val');
    builder.selectSub(query => {
      query.from('two').select('baz').where('subkey', '=', 'subval');
    }, 'sub');
    expect(builder.toSql()).toBe(expectedSql);

    expect(builder.getBindings()).toStrictEqual(expectedBindings);
    builder = getPostgresBuilder();
    builder.from('one').select(['foo', 'bar']).where('_key', '=', 'val');
    const subBuilder = getPostgresBuilder();
    subBuilder.from('two').select('baz').where('subkey', '=', 'subval');
    builder.selectSub(subBuilder, 'sub');
    expect(builder.toSql()).toBe(expectedSql);

    expect(builder.getBindings()).toStrictEqual(expectedBindings);
    builder = getPostgresBuilder();
    expect(() => {
      // @ts-ignore
      builder.selectSub(['foo'], 'sub');
    }).toThrowError('InvalidArgumentException');
  });

  it('test sub select reset bindings', () => {
    builder = getPostgresBuilder();
    builder.from('one').selectSub(query => {
      query.from('two').select('baz').where('subkey', '=', 'subval');
    }, 'sub');
    expect(builder.toSql()).toBe(
      'SELECT (SELECT "baz" FROM "two" WHERE "subkey" = $1) AS "sub" FROM "one"');
    expect(builder.getBindings()).toStrictEqual(['subval']);
    builder.select('*');
    expect(builder.toSql()).toBe('SELECT * FROM "one"');
    expect(builder.getBindings()).toStrictEqual([]);
  });

  it('test sql server where date', () => {
    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereDate('created_at', '=', '2015-09-23');
    expect(builder.toSql()).toBe('SELECT * FROM [users] WHERE cast([created_at] AS date) = ?');
    expect(builder.getBindings()).toStrictEqual([
      '2015-09-23'
    ]);
  });
  //
  it('test uppercase leading booleans are removed', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('name', '=', 'Taylor', 'AND');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `name` = ?');
  });

  it('test lowercase leading booleans are removed', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('name', '=', 'Taylor', 'and');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `name` = ?');
  });
  //
  it('test case insensitive leading booleans are removed', () => {
    builder = getBuilder();
    builder.select('*').from('users').where('name', '=', 'Taylor', 'And');
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE `name` = ?');
  });

  xit('test table valued function as table in sql server', () => {
    builder = getSqlServerBuilder();
    builder.select('*').from('users()');
    expect(builder.toSql()).toBe('SELECT * FROM [users]()');
    builder = getSqlServerBuilder();
    builder.select('*').from('users(1,2)');
    expect(builder.toSql()).toBe('SELECT * FROM [users](1,2)');
  });

  // it('test chunk with last chunk complete', () => {
  //   builder = getBuilder();
  //   builder.orders.push({
  //     'column'   : 'foobar',
  //     'direction': 'asc'
  //   });
  //   let chunk1 = ['foo1', 'foo2'];
  //   let chunk2 = ['foo3', 'foo4'];
  //   let chunk3 = [];
  //   builder.shouldReceive('forPage').once()._with(1, 2).andReturnSelf();
  //   builder.shouldReceive('forPage').once()._with(2, 2).andReturnSelf();
  //   builder.shouldReceive('forPage').once()._with(3, 2).andReturnSelf();
  //   builder.shouldReceive('get').times(3).andReturn(chunk1, chunk2, chunk3);
  //   let callbackAssertor = m.mock(stdClass);
  //   callbackAssertor.shouldReceive('doSomething').once()._with(chunk1);
  //   callbackAssertor.shouldReceive('doSomething').once()._with(chunk2);
  //   callbackAssertor.shouldReceive('doSomething').never()._with(chunk3);
  //   builder.chunk(2, results => {
  //     callbackAssertor.doSomething(results);
  //   });
  // });
  //
  // it('test chunk with last chunk partial', () => {
  //   let builder = getMockQueryBuilder();
  //   builder.orders.push({
  //     'column'   : 'foobar',
  //     'direction': 'asc'
  //   });
  //   let chunk1 = collect(['foo1', 'foo2']);
  //   let chunk2 = collect(['foo3']);
  //   builder.shouldReceive('forPage').once()._with(1, 2).andReturnSelf();
  //   builder.shouldReceive('forPage').once()._with(2, 2).andReturnSelf();
  //   builder.shouldReceive('get').times(2).andReturn(chunk1, chunk2);
  //   let callbackAssertor = m.mock(stdClass);
  //   callbackAssertor.shouldReceive('doSomething').once()._with(chunk1);
  //   callbackAssertor.shouldReceive('doSomething').once()._with(chunk2);
  //   builder.chunk(2, results => {
  //     callbackAssertor.doSomething(results);
  //   });
  // });
  //
  // it('test chunk can be stopped by returning false', () => {
  //   let builder = getMockQueryBuilder();
  //   builder.orders.push({
  //     'column'   : 'foobar',
  //     'direction': 'asc'
  //   });
  //   let chunk1 = collect(['foo1', 'foo2']);
  //   let chunk2 = collect(['foo3']);
  //   builder.shouldReceive('forPage').once()._with(1, 2).andReturnSelf();
  //   builder.shouldReceive('forPage').never()._with(2, 2);
  //   builder.shouldReceive('get').times(1).andReturn(chunk1);
  //   let callbackAssertor = m.mock(stdClass);
  //   callbackAssertor.shouldReceive('doSomething').once()._with(chunk1);
  //   callbackAssertor.shouldReceive('doSomething').never()._with(chunk2);
  //   builder.chunk(2, results => {
  //     callbackAssertor.doSomething(results);
  //     return false;
  //   });
  // });
  //
  // it('test chunk with count zero', () => {
  //   let builder = getMockQueryBuilder();
  //   builder.orders.push({
  //     'column'   : 'foobar',
  //     'direction': 'asc'
  //   });
  //   let chunk = collect([]);
  //   builder.shouldReceive('forPage').once()._with(1, 0).andReturnSelf();
  //   builder.shouldReceive('get').times(1).andReturn(chunk);
  //   let callbackAssertor = m.mock(stdClass);
  //   callbackAssertor.shouldReceive('doSomething').never();
  //   builder.chunk(0, results => {
  //     callbackAssertor.doSomething(results);
  //   });
  // });
  //
  // it('test chunk paginates using id with last chunk complete', () => {
  //   let builder = getMockQueryBuilder();
  //   builder.orders.push({
  //     'column'   : 'foobar',
  //     'direction': 'asc'
  //   });
  //   let chunk1 = collect([
  //     //cast type object
  //     {
  //       'someIdField': 1
  //     },
  //     //cast type object
  //     {
  //       'someIdField': 2
  //     }]);
  //   let chunk2 = collect([
  //     //cast type object
  //     {
  //       'someIdField': 10
  //     },
  //     //cast type object
  //     {
  //       'someIdField': 11
  //     }]);
  //   let chunk3 = collect([]);
  //   builder.shouldReceive('forPageAfterId').once()._with(2, 0, 'someIdField').andReturnSelf();
  //   builder.shouldReceive('forPageAfterId').once()._with(2, 2, 'someIdField').andReturnSelf();
  //   builder.shouldReceive('forPageAfterId').once()._with(2, 11, 'someIdField').andReturnSelf();
  //   builder.shouldReceive('get').times(3).andReturn(chunk1, chunk2, chunk3);
  //   let callbackAssertor = m.mock(stdClass);
  //   callbackAssertor.shouldReceive('doSomething').once()._with(chunk1);
  //   callbackAssertor.shouldReceive('doSomething').once()._with(chunk2);
  //   callbackAssertor.shouldReceive('doSomething').never()._with(chunk3);
  //   builder.chunkById(2, results => {
  //     callbackAssertor.doSomething(results);
  //   }, 'someIdField');
  // });
  //
  // it('test chunk paginates using id with last chunk partial', () => {
  //   let builder = getMockQueryBuilder();
  //   builder.orders.push({
  //     'column'   : 'foobar',
  //     'direction': 'asc'
  //   });
  //   let chunk1 = collect([
  //     //cast type object
  //     {
  //       'someIdField': 1
  //     },
  //     //cast type object
  //     {
  //       'someIdField': 2
  //     }]);
  //   let chunk2 = collect([
  //     //cast type object
  //     {
  //       'someIdField': 10
  //     }]);
  //   builder.shouldReceive('forPageAfterId').once()._with(2, 0, 'someIdField').andReturnSelf();
  //   builder.shouldReceive('forPageAfterId').once()._with(2, 2, 'someIdField').andReturnSelf();
  //   builder.shouldReceive('get').times(2).andReturn(chunk1, chunk2);
  //   let callbackAssertor = m.mock(stdClass);
  //   callbackAssertor.shouldReceive('doSomething').once()._with(chunk1);
  //   callbackAssertor.shouldReceive('doSomething').once()._with(chunk2);
  //   builder.chunkById(2, results => {
  //     callbackAssertor.doSomething(results);
  //   }, 'someIdField');
  // });
  //
  // it('test chunk paginates using id with count zero', () => {
  //   let builder = getMockQueryBuilder();
  //   builder.orders.push({
  //     'column'   : 'foobar',
  //     'direction': 'asc'
  //   });
  //   let chunk = collect([]);
  //   builder.shouldReceive('forPageAfterId').once()._with(0, 0, 'someIdField').andReturnSelf();
  //   builder.shouldReceive('get').times(1).andReturn(chunk);
  //   let callbackAssertor = m.mock(stdClass);
  //   callbackAssertor.shouldReceive('doSomething').never();
  //   builder.chunkById(0, results => {
  //     callbackAssertor.doSomething(results);
  //   }, 'someIdField');
  // });
  //
  // it('test chunk paginates using id with alias', () => {
  //   let builder = getMockQueryBuilder();
  //   builder.orders.push({
  //     'column'   : 'foobar',
  //     'direction': 'asc'
  //   });
  //   let chunk1 = collect([
  //     //cast type object
  //     {
  //       'table_id': 1
  //     },
  //     //cast type object
  //     {
  //       'table_id': 10
  //     }]);
  //   let chunk2 = collect([]);
  //   builder.shouldReceive('forPageAfterId').once()._with(2, 0, 'table.id').andReturnSelf();
  //   builder.shouldReceive('forPageAfterId').once()._with(2, 10, 'table.id').andReturnSelf();
  //   builder.shouldReceive('get').times(2).andReturn(chunk1, chunk2);
  //   let callbackAssertor = m.mock(stdClass);
  //   callbackAssertor.shouldReceive('doSomething').once()._with(chunk1);
  //   callbackAssertor.shouldReceive('doSomething').never()._with(chunk2);
  //   builder.chunkById(2, results => {
  //     callbackAssertor.doSomething(results);
  //   }, 'table.id', 'table_id');
  // });
  //
  // it('test paginate', () => {
  //   const perPage  = 16;
  //   const columns  = ['test'];
  //   const pageName = 'page-name';
  //   const page     = 1;
  //   builder      = getBuilder();
  //   const path     = 'http://foo.bar?page=3';
  //   const results  = [{
  //     'test': 'foo'
  //   }, {
  //     'test': 'bar'
  //   }];
  //   builder.shouldReceive('getCountForPagination').once().andReturn(2);
  //   builder.shouldReceive('forPage').once()._with(page, perPage).andReturnSelf();
  //   builder.shouldReceive('get').once().andReturn(results);
  //   Paginator.currentPathResolver(() => {
  //     return path;
  //   });
  //   const result = builder.paginate(perPage, columns, pageName, page);
  //   this.assertEquals(new LengthAwarePaginator(results, 2, perPage, page, {
  //     'path'    : path,
  //     'pageName': pageName
  //   }), result);
  //
  // });

  // it('test paginate with default arguments', () => {
  //   let perPage  = 15;
  //   let pageName = 'page';
  //   let page     = 1;
  //   builder      = getMockQueryBuilder();
  //   let path     = 'http://foo.bar?page=3';
  //   let results  = collect([{
  //     'test': 'foo'
  //   }, {
  //     'test': 'bar'
  //   }]);
  //   builder.shouldReceive('getCountForPagination').once().andReturn(2);
  //   builder.shouldReceive('forPage').once()._with(page, perPage).andReturnSelf();
  //   builder.shouldReceive('get').once().andReturn(results);
  //   Paginator.currentPageResolver(() => {
  //     return 1;
  //   });
  //   Paginator.currentPathResolver(() => {
  //     return path;
  //   });
  //   let result = builder.paginate();
  //   this.assertEquals(new LengthAwarePaginator(results, 2, perPage, page, {
  //     'path'    : path,
  //     'pageName': pageName
  //   }), result);
  // });
  //
  // it('test paginate when no results', () => {
  //   let perPage  = 15;
  //   let pageName = 'page';
  //   let page     = 1;
  //   builder      = getMockQueryBuilder();
  //   let path     = 'http://foo.bar?page=3';
  //   let results  = [];
  //   builder.shouldReceive('getCountForPagination').once().andReturn(0);
  //   builder.shouldNotReceive('forPage');
  //   builder.shouldNotReceive('get');
  //   Paginator.currentPageResolver(() => {
  //     return 1;
  //   });
  //   Paginator.currentPathResolver(() => {
  //     return path;
  //   });
  //   let result = builder.paginate();
  //   this.assertEquals(new LengthAwarePaginator(results, 0, perPage, page, {
  //     'path'    : path,
  //     'pageName': pageName
  //   }), result);
  // });
  //
  // it('test paginate with specific columns', () => {
  //   let perPage  = 16;
  //   let columns  = ['id', 'name'];
  //   let pageName = 'page-name';
  //   let page     = 1;
  //   builder      = getMockQueryBuilder();
  //   let path     = 'http://foo.bar?page=3';
  //   let results  = collect([{
  //     'id'  : 3,
  //     'name': 'Taylor'
  //   }, {
  //     'id'  : 5,
  //     'name': 'Mohamed'
  //   }]);
  //   builder.shouldReceive('getCountForPagination').once().andReturn(2);
  //   builder.shouldReceive('forPage').once()._with(page, perPage).andReturnSelf();
  //   builder.shouldReceive('get').once().andReturn(results);
  //   Paginator.currentPathResolver(() => {
  //     return path;
  //   });
  //   let result = builder.paginate(perPage, columns, pageName, page);
  //   this.assertEquals(new LengthAwarePaginator(results, 2, perPage, page, {
  //     'path'    : path,
  //     'pageName': pageName
  //   }), result);
  // });

  // it('test where row values', () => {
  //   builder = getBuilder();
  //   builder.select('*').from('orders').whereRowValues(['last_update', 'order_number'], '<', [1, 2]);
  //   expect(builder.toSql()).toBe('SELECT * FROM "orders" where ("last_update", "order_number") < (?, ?)');
  //   builder = getBuilder();
  //   builder.select('*')
  //     .from('orders')
  //     .where('company_id', 1)
  //     .orWhereRowValues(['last_update', 'order_number'], '<', [1, 2]);
  //   expect(builder.toSql())
  //     .toBe('SELECT * FROM "orders" where "company_id" = ? or ("last_update", "order_number") < (?, ?)');
  //   builder = getBuilder();
  //   builder.select('*').from('orders').whereRowValues(['last_update', 'order_number'], '<', [1, raw('2')]);
  //   expect(builder.toSql()).toBe('SELECT * FROM "orders" where ("last_update", "order_number") < (?, 2)');
  //   expect(builder.getBindings()).toStrictEqual([1]);
  // });

  // it('test where row values arity mismatch', () => {
  //   this.expectException(InvalidArgumentException);
  //   this.expectExceptionMessage('The number of columns must match the number of values');
  //   builder = getBuilder();
  //   builder.select('*').from('orders').whereRowValues(['last_update'], '<', [1, 2]);
  // });

  it('test where json contains my sql', () => {
    builder = getMySqlBuilder();
    builder.select('*').from('users').whereJsonContains('options', ['en']);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE json_contains(`options`, ?)');
    expect(builder.getBindings()).toStrictEqual(['["en"]']);
    builder = getMySqlBuilder();
    builder.select('*').from('users').whereJsonContains('users.options->languages', ['en']);
    expect(builder.toSql()).toBe(
      'SELECT * FROM `users` WHERE json_contains(json_extract(`users`.`options`, "$.languages"), ?)');
    expect(builder.getBindings()).toStrictEqual(['["en"]']);
    builder = getMySqlBuilder();
    builder.select('*')
      .from('users')
      .where('id', '=', 1)
      .orWhereJsonContains('options->languages', raw('\'["en"]\''));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` WHERE `id` = ? OR json_contains(json_extract(`options`, "$.languages"), \'["en"]\')');
    expect(builder.getBindings()).toStrictEqual([1]);

    builder = getMySqlBuilder();
    builder.select('*')
      .from('users')
      .where('id', '=', 1)
      .orWhereJsonContains('options->>languages', raw('\'["en"]\''));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` WHERE `id` = ? OR json_contains(json_unquote(json_extract(`options`, "$.languages")), \'["en"]\')');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test where json contains postgres', () => {
    builder = getPostgresBuilder();
    builder.select('*').from('users').whereJsonContains('options', ['en']);
    expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE ("options")::jsonb @> $1');
    expect(builder.getBindings()).toStrictEqual(['["en"]']);
    builder = getPostgresBuilder();
    builder.select('*').from('users').whereJsonContains('users.options->languages', ['en']);
    expect(builder.toSql()).toBe(
      'SELECT * FROM "users" WHERE ("users"."options"->"languages")::jsonb @> $1');
    expect(builder.getBindings()).toStrictEqual(['["en"]']);
    builder = getPostgresBuilder();
    builder.select('*')
      .from('users')
      .where('id', '=', 1)
      .orWhereJsonContains('options->languages', raw('\'["en\\"]\''));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM "users" WHERE "id" = $1 OR ("options"->"languages")::jsonb @> \'["en\\"]\'');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test where json contains sqlite', () => {
    expect(() => {
      builder = getSQLiteBuilder();
      builder.select('*').from('users').whereJsonContains('options->languages', ['en']).toSql();
    }).toThrowError('ExceptionRuntimeException');
  });

  it('test where json contains sql server', () => {
    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereJsonContains('options', true);
    expect(builder.toSql()).toBe(
      'SELECT * FROM [users] WHERE ? in (select [value] from openjson([options]))');
    expect(builder.getBindings()).toStrictEqual(['true']);
    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereJsonContains('users.options->languages', 'en');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM [users] WHERE ? in (select [value] from openjson([users].[options], "$.languages"))');
    expect(builder.getBindings()).toStrictEqual(['en']);
    builder = getSqlServerBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereJsonContains('options->languages',
      raw('\'en\''));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM [users] WHERE [id] = ? OR \'en\' in (select [value] from openjson([options], "$.languages"))');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test where json doesnt contain my sql', () => {
    builder = getMySqlBuilder();
    builder.select('*').from('users').whereJsonDoesntContain('options->languages', ['en']);
    expect(builder.toSql()).toBe(
      'SELECT * FROM `users` WHERE not json_contains(json_extract(`options`, "$.languages"), ?)');
    expect(builder.getBindings()).toStrictEqual(['["en"]']);
    builder = getMySqlBuilder();
    builder.select('*')
      .from('users')
      .where('id', '=', 1)
      .orWhereJsonDoesntContain('options->languages', raw('\'["en\\"]\''));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` WHERE `id` = ? OR not json_contains(json_extract(`options`, "$.languages"), \'["en\\"]\')');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test where json doesnt contain postgres', () => {
    builder = getPostgresBuilder();
    builder.select('*').from('users').whereJsonDoesntContain('options->languages', ['en']);
    expect(builder.toSql()).toBe(
      'SELECT * FROM "users" WHERE not ("options"->"languages")::jsonb @> $1');
    expect(builder.getBindings()).toStrictEqual(['["en"]']);
    builder = getPostgresBuilder();
    builder.select('*')
      .from('users')
      .where('id', '=', 1)
      .orWhereJsonDoesntContain('options->languages', raw('\'["en\\"]\''));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM "users" WHERE "id" = $1 OR not ("options"->"languages")::jsonb @> \'["en\\"]\'');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test where json doesnt contain sqlite', () => {
    expect(() => {
      builder = getSQLiteBuilder();
      builder.select('*').from('users').whereJsonDoesntContain('options->languages',
        ['en']).toSql();
    }).toThrowError('RuntimeException');
  });

  it('test where json doesnt contain sql server', () => {
    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereJsonDoesntContain('options->languages', 'en');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM [users] WHERE not ? in (select [value] from openjson([options], "$.languages"))');
    expect(builder.getBindings()).toStrictEqual(['en']);
    builder = getSqlServerBuilder();
    builder.select('*')
      .from('users')
      .where('id', '=', 1)
      .orWhereJsonDoesntContain('options->languages', raw('\'en\''));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM [users] WHERE [id] = ? OR not \'en\' in (select [value] from openjson([options], "$.languages"))');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test where json length mysql', () => {
    builder = getMySqlBuilder();
    builder.select('*').from('users').whereJsonLength('options', 0);
    expect(builder.toSql()).toBe('SELECT * FROM `users` WHERE json_length(`options`) = ?');
    expect(builder.getBindings()).toStrictEqual([0]);
    builder = getMySqlBuilder();
    builder.select('*').from('users').whereJsonLength('users.options->languages', '>', 0);
    expect(builder.toSql()).toBe(
      'SELECT * FROM `users` WHERE json_length(`users`.`options`, "$.languages") > ?');
    expect(builder.getBindings()).toStrictEqual([0]);
    builder = getMySqlBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereJsonLength('options->languages',
      raw('0'));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` WHERE `id` = ? OR json_length(`options`, "$.languages") = 0');
    expect(builder.getBindings()).toStrictEqual([1]);
    builder = getMySqlBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereJsonLength('options->languages',
      '>', raw('0'));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM `users` WHERE `id` = ? OR json_length(`options`, "$.languages") > 0');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test where json length postgres', () => {
    builder = getPostgresBuilder();
    builder.select('*').from('users').whereJsonLength('options', 0);
    expect(builder.toSql()).toBe(
      'SELECT * FROM "users" WHERE json_array_length(("options")::json) = $1');
    expect(builder.getBindings()).toStrictEqual([0]);
    builder = getPostgresBuilder();
    builder.select('*').from('users').whereJsonLength('users.options->languages', '>', 0);
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM "users" WHERE json_array_length(("users"."options"->"languages")::json) > $1');
    expect(builder.getBindings()).toStrictEqual([0]);
    builder = getPostgresBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereJsonLength('options->languages',
      raw('0'));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM "users" WHERE "id" = $1 OR json_array_length(("options"->"languages")::json) = 0');
    expect(builder.getBindings()).toStrictEqual([1]);
    builder = getPostgresBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereJsonLength('options->languages',
      '>', raw('0'));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM "users" WHERE "id" = $1 OR json_array_length(("options"->"languages")::json) > 0');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test where json length sqlite', () => {
    builder = getSQLiteBuilder();
    builder.select('*').from('users').whereJsonLength('options', 0);
    expect(builder.toSql()).toBe('SELECT * FROM "users" WHERE json_array_length("options") = ?');
    expect(builder.getBindings()).toStrictEqual([0]);
    builder = getSQLiteBuilder();
    builder.select('*').from('users').whereJsonLength('users.options->languages', '>', 0);
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM "users" WHERE json_array_length("users"."options", "$.languages") > ?');
    expect(builder.getBindings()).toStrictEqual([0]);
    builder = getSQLiteBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereJsonLength('options->languages',
      raw('0'));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM "users" WHERE "id" = ? OR json_array_length("options", "$.languages") = 0');
    expect(builder.getBindings()).toStrictEqual([1]);
    builder = getSQLiteBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereJsonLength('options->languages',
      '>', raw('0'));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM "users" WHERE "id" = ? OR json_array_length("options", "$.languages") > 0');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test where json length sql server', () => {
    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereJsonLength('options', 0);
    expect(builder.toSql()).toBe(
      'SELECT * FROM [users] WHERE (select count(*) from openjson([options])) = ?');
    expect(builder.getBindings()).toStrictEqual([0]);
    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereJsonLength('users.options->languages', '>', 0);
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM [users] WHERE (select count(*) from openjson([users].[options], "$.languages")) > ?');
    expect(builder.getBindings()).toStrictEqual([0]);
    builder = getSqlServerBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereJsonLength('options->languages',
      raw('0'));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM [users] WHERE [id] = ? OR (select count(*) from openjson([options], "$.languages")) = 0');
    expect(builder.getBindings()).toStrictEqual([1]);
    builder = getSqlServerBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereJsonLength('options->languages',
      '>', raw('0'));
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM [users] WHERE [id] = ? OR (select count(*) from openjson([options], "$.languages")) > 0');
    expect(builder.getBindings()).toStrictEqual([1]);
  });

  it('test from sub', () => {
    builder = getBuilder();
    builder.fromSub(query => {
      query.select(raw('max(last_seen_at) as last_seen_at')).from('user_sessions').where('foo', '=',
        '1');
    }, 'sessions').where('bar', '<', '10');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM (SELECT max(last_seen_at) as last_seen_at FROM `user_sessions` WHERE `foo` = ?) AS `sessions` WHERE `bar` < ?');
    expect(builder.getBindings()).toStrictEqual(['1', '10']);

    builder = getBuilder();
    expect(() => {
      builder.fromSub(['invalid'], 'sessions').where('bar', '<', '10');
    }).toThrowError('InvalidArgumentException');
  });

  it('test from sub with prefix', () => {
    builder = getBuilder();
    builder.getGrammar().setTablePrefix('prefix_');
    builder.fromSub(query => {
      query.select(raw('max(last_seen_at) as last_seen_at')).from('user_sessions').where('foo', '=',
        '1');
    }, 'sessions').where('bar', '<', '10');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM (SELECT max(last_seen_at) as last_seen_at FROM `prefix_user_sessions` WHERE `foo` = ?) AS `prefix_sessions` WHERE `bar` < ?');
    expect(builder.getBindings()).toStrictEqual(['1', '10']);
  });

  it('test from sub without bindings', () => {
    builder = getBuilder();
    builder.fromSub(query => {
      query.select(raw('max(last_seen_at) as last_seen_at')).from('user_sessions');
    }, 'sessions');
    expect(builder.toSql())
      .toBe(
        'SELECT * FROM (SELECT max(last_seen_at) as last_seen_at FROM `user_sessions`) AS `sessions`');
    expect(() => {
        getBuilder();
        builder.fromSub(['invalid'], 'sessions');
      }
    ).toThrowError('InvalidArgumentException');
    expect(() => {
      builder = getBuilder();
      builder.fromSub(['invalid'], 'sessions');
    }).toThrowError('InvalidArgumentException');

  });

  it('test group by raw', ()=>{
    builder = getBuilder();
    const sql = builder.from('users').selectRaw('COUNT(*) as count').toSql();
    expect(sql).toEqual('SELECT COUNT(*) as count FROM `users`')
  })

  // it('test from raw', () => {
  //   builder = getBuilder();
  //   builder.fromRaw(
  //     raw('(select max(last_seen_at) as last_seen_at from "user_sessions") as "sessions"'));
  //   expect(builder.toSql())
  //     .toBe(
  //       'SELECT * FROM (select max(last_seen_at) as last_seen_at from "user_sessions") as "sessions"');
  // });
  //
  // it('testFromRawOnSqlServer', () => {
  //   builder = getSqlServerBuilder();
  //   builder.fromRaw('dbo.[SomeNameWithRoundBrackets (test)]');
  //   expect(builder.toSql()).toBe('SELECT * FROM dbo.[SomeNameWithRoundBrackets (test)]');
  //
  // });

  // it('testFromRawWithWhereOnTheMainQuery', () => {
  //   builder = getBuilder();
  //   builder.fromRaw(
  //     raw('(select max(last_seen_at) as last_seen_at from "sessions") as "last_seen_at"'))
  //     .where('last_seen_at', '>', '1520652582');
  //   expect(builder.toSql())
  //     .toBe(
  //       'SELECT * FROM (select max(last_seen_at) as last_seen_at from "sessions") as "last_seen_at" where "last_seen_at" > ?');
  //   expect(builder.getBindings()).toStrictEqual(['1520652582']);
  //
  // });


});

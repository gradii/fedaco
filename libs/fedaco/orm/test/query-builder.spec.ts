/* tslint:disable:max-line-length */
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
import { QueryBuilder } from '../src/query-builder/query-builder';
import { SchemaBuilder } from '../src/schema/schema-builder';



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

  });


});

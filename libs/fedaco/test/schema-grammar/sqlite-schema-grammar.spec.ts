// noinspection DuplicatedCode
import { Connection } from '../../src/connection';
import { WrappedConnection } from '../../src/connector/wrapped-connection';
import { DatabaseConfig } from '../../src/database-config';
import { ConnectionInterface } from '../../src/query-builder/connection-interface';
import { QueryGrammar } from '../../src/query-builder/grammar/query-grammar';
import { SqliteQueryGrammar } from '../../src/query-builder/grammar/sqlite-query-grammar';
import { Processor } from '../../src/query-builder/processor';
import { QueryBuilder } from '../../src/query-builder/query-builder';
import { Blueprint } from '../../src/schema/blueprint';
import { ForeignIdColumnDefinition } from '../../src/schema/foreign-id-column-definition';
import { SqliteSchemaGrammar } from '../../src/schema/grammar/sqlite-schema-grammar';
import { SchemaBuilder } from '../../src/schema/schema-builder';

jest.setTimeout(100000);

class Conn extends Connection implements ConnectionInterface {

  constructor() {
    super(undefined, undefined, undefined, undefined);
  }

  // @ts-ignore
  getDefaultQueryGrammar(): QueryGrammar {
  }

  // @ts-ignore
  getDefaultPostProcessor(): Processor {
  }

  getSchemaBuilder(): SchemaBuilder {
    throw new Error('Method not implemented.');
  }

  getConfig(): any {

  }

  table(table: string | Function | QueryBuilder, as?: string): QueryBuilder {
    throw new Error('Method not implemented.');
  }

  getPdo(): Promise<WrappedConnection> {
    throw new Error('Method not implemented.');
  }

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
      new SqliteQueryGrammar(),
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

  recordsHaveBeenModified(): any {
  }

  selectFromWriteConnection(sql: string, values: any): any {
  }
}

function getConnection() {
  return new Conn();
}

function getGrammar() {
  return new SqliteSchemaGrammar();
}

describe('test database sq lite schema grammar', () => {

  it('basic create table', () => {
    let blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.increments('id');
    blueprint.string('email');
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create table "users" ("id" integer not null primary key autoincrement, "email" varchar not null)');
    blueprint = new Blueprint('users');
    blueprint.increments('id');
    blueprint.string('email');
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(2);
    const expected = [
      'alter table "users" add column "id" integer not null primary key autoincrement',
      'alter table "users" add column "email" varchar not null'
    ];
    expect(statements).toEqual(expected);
  });
  it('create temporary table', () => {
    const blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.temporary();
    blueprint.increments('id');
    blueprint.string('email');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create temporary table "users" ("id" integer not null primary key autoincrement, "email" varchar not null)');
  });
  it('drop table', () => {
    const blueprint = new Blueprint('users');
    blueprint.drop();
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop table "users"');
  });
  it('drop table if exists', () => {
    const blueprint = new Blueprint('users');
    blueprint.dropIfExists();
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop table if exists "users"');
  });
  it('drop unique', () => {
    const blueprint = new Blueprint('users');
    blueprint.dropUnique('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop index "foo"');
  });
  it('drop index', () => {
    const blueprint = new Blueprint('users');
    blueprint.dropIndex('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop index "foo"');
  });
  it('drop column', async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      'driver'  : 'sqlite',
      'database': ':memory:',
      'prefix'  : 'prefix_'
    });
    db.setAsGlobal();
    const schema = db.getConnection().getSchemaBuilder();
    await schema.create('users', table => {
      table.string('email');
      table.string('name');
    });
    expect(await schema.hasTable('users')).toBeTruthy();
    expect(await schema.hasColumn('users', 'name')).toBeTruthy();
    await schema.table('users', table => {
      table.dropColumn('name');
    });
    expect(await schema.hasColumn('users', 'name')).toBeFalsy();
  });
  it('drop spatial index', () => {
    expect(() => {
      const blueprint = new Blueprint('geo');
      blueprint.dropSpatialIndex(['coordinates']);
      blueprint.toSql(getConnection(), getGrammar());
    }).toThrowError(
      'RuntimeException The database driver in use does not support spatial indexes.');
  });
  it('rename table', () => {
    const blueprint = new Blueprint('users');
    blueprint.rename('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" rename to "foo"');
  });
  it('rename index', async () => {
    // if (!class_exists(SqliteSchemaManager)) {
    //   this.markTestSkipped('Doctrine should be installed to run renameIndex tests');
    // }
    const db = new DatabaseConfig();
    db.addConnection({
      'driver'  : 'sqlite',
      'database': ':memory:',
      'prefix'  : 'prefix_'
    });
    const schema = db.getConnection().getSchemaBuilder();
    await schema.create('users', table => {
      table.string('name');
      table.string('email');
    });
    await schema.table('users', table => {
      table.index(['name', 'email'], 'index1');
    });
    const manager = db.getConnection().getSchemaBuilder();
    let details   = await manager.listTableDetails('prefix_users');
    expect('index1' in details.indexes).toBeTruthy();
    expect('index2' in details.indexes).toBeFalsy();
    await schema.table('users', table => {
      table.renameIndex('index1', 'index2');
    });
    details = await manager.listTableDetails('prefix_users');
    expect('index1' in details.indexes).toBeFalsy();
    expect('index2' in details.indexes).toBeTruthy();
    expect(details.indexes('index2').getUnquotedColumns()).toEqual(['name', 'email']);
  });
  it('adding primary key', () => {
    const blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.string('foo').withPrimary();
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create table "users" ("foo" varchar not null, primary key ("foo"))');
  });
  it('adding foreign key', () => {
    const blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.string('foo').withPrimary();
    blueprint.string('order_id');
    blueprint.foreign(['order_id']).withReferences('id').withOn('orders');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create table "users" ("foo" varchar not null, "order_id" varchar not null, foreign key("order_id") references "orders"("id"), primary key ("foo"))');
  });
  it('adding unique key', () => {
    const blueprint = new Blueprint('users');
    blueprint.unique(['foo'], 'bar');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('create unique index "bar" on "users" ("foo")');
  });
  it('adding index', () => {
    const blueprint = new Blueprint('users');
    blueprint.index(['foo', 'bar'], 'baz');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('create index "baz" on "users" ("foo", "bar")');
  });
  it('adding spatial index', () => {
    expect(() => {
      const blueprint = new Blueprint('geo');
      blueprint.spatialIndex(['coordinates']);
      blueprint.toSql(getConnection(), getGrammar());
    }).toThrowError(
      'RuntimeException The database driver in use does not support spatial indexes.');
  });
  it('adding fluent spatial index', () => {
    expect(() => {
      const blueprint = new Blueprint('geo');
      blueprint.point('coordinates').withSpatialIndex();
      blueprint.toSql(getConnection(), getGrammar());
    }).toThrowError(
      'RuntimeException The database driver in use does not support spatial indexes.');
  });
  it('adding raw index', () => {
    const blueprint = new Blueprint('users');
    blueprint.rawIndex('(function(column))', 'raw_index');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('create index "raw_index" on "users" ((function(column)))');
  });
  it('adding incrementing id', () => {
    const blueprint = new Blueprint('users');
    blueprint.increments('id');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "id" integer not null primary key autoincrement');
  });
  it('adding small incrementing id', () => {
    const blueprint = new Blueprint('users');
    blueprint.smallIncrements('id');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "id" integer not null primary key autoincrement');
  });
  it('adding medium incrementing id', () => {
    const blueprint = new Blueprint('users');
    blueprint.mediumIncrements('id');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "id" integer not null primary key autoincrement');
  });
  it('adding id', () => {
    let blueprint = new Blueprint('users');
    blueprint.id();
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "id" integer not null primary key autoincrement');
    blueprint = new Blueprint('users');
    blueprint.id('foo');
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" integer not null primary key autoincrement');
  });
  it('adding foreign id', () => {
    const blueprint = new Blueprint('users');
    const foreignId = blueprint.foreignId('foo');
    blueprint.foreignId('company_id').withConstrained();
    blueprint.foreignId('laravel_idea_id').withConstrained();
    blueprint.foreignId('team_id').withReferences('id').withOn('teams');
    blueprint.foreignId('team_column_id').withConstrained('teams');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(foreignId).toBeInstanceOf(ForeignIdColumnDefinition);
    expect(statements).toEqual([
      'alter table "users" add column "foo" integer not null',
      'alter table "users" add column "company_id" integer not null',
      'alter table "users" add column "laravel_idea_id" integer not null',
      'alter table "users" add column "team_id" integer not null',
      'alter table "users" add column "team_column_id" integer not null'
    ]);
  });
  it('adding big incrementing id', () => {
    const blueprint = new Blueprint('users');
    blueprint.bigIncrements('id');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "id" integer not null primary key autoincrement');
  });
  it('adding string', () => {
    let blueprint = new Blueprint('users');
    blueprint.string('foo');
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" varchar not null');
    blueprint = new Blueprint('users');
    blueprint.string('foo', 100);
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" varchar not null');
    blueprint = new Blueprint('users');
    blueprint.string('foo', 100).withNullable().withDefault('bar');
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" varchar default \'bar\'');
  });
  it('adding text', () => {
    const blueprint = new Blueprint('users');
    blueprint.text('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" text not null');
  });
  it('adding big integer', () => {
    let blueprint = new Blueprint('users');
    blueprint.bigInteger('foo');
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer not null');
    blueprint = new Blueprint('users');
    blueprint.bigInteger('foo', true);
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" integer not null primary key autoincrement');
  });
  it('adding integer', () => {
    let blueprint = new Blueprint('users');
    blueprint.integer('foo');
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer not null');
    blueprint = new Blueprint('users');
    blueprint.integer('foo', true);
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" integer not null primary key autoincrement');
  });
  it('adding medium integer', () => {
    let blueprint = new Blueprint('users');
    blueprint.mediumInteger('foo');
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer not null');
    blueprint = new Blueprint('users');
    blueprint.mediumInteger('foo', true);
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" integer not null primary key autoincrement');
  });
  it('adding tiny integer', () => {
    let blueprint = new Blueprint('users');
    blueprint.tinyInteger('foo');
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer not null');
    blueprint = new Blueprint('users');
    blueprint.tinyInteger('foo', true);
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" integer not null primary key autoincrement');
  });
  it('adding small integer', () => {
    let blueprint = new Blueprint('users');
    blueprint.smallInteger('foo');
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer not null');
    blueprint = new Blueprint('users');
    blueprint.smallInteger('foo', true);
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" integer not null primary key autoincrement');
  });
  it('adding float', () => {
    const blueprint = new Blueprint('users');
    blueprint.float('foo', 5, 2);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" float not null');
  });
  it('adding double', () => {
    const blueprint = new Blueprint('users');
    blueprint.double('foo', 15, 8);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" float not null');
  });
  it('adding decimal', () => {
    const blueprint = new Blueprint('users');
    blueprint.decimal('foo', 5, 2);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" numeric not null');
  });
  it('adding boolean', () => {
    const blueprint = new Blueprint('users');
    blueprint.boolean('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" tinyint(1) not null');
  });
  it('adding enum', () => {
    const blueprint = new Blueprint('users');
    blueprint.enum('role', ['member', 'admin']);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "role" varchar check ("role" in (\'member\', \'admin\')) not null');
  });
  it('adding json', () => {
    const blueprint = new Blueprint('users');
    blueprint.json('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" text not null');
  });
  it('adding jsonb', () => {
    const blueprint = new Blueprint('users');
    blueprint.jsonb('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" text not null');
  });
  it('adding date', () => {
    const blueprint = new Blueprint('users');
    blueprint.date('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" date not null');
  });
  it('adding year', () => {
    const blueprint = new Blueprint('users');
    blueprint.year('birth_year');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "birth_year" integer not null');
  });
  it('adding date time', () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTime('created_at');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding date time with precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTime('created_at', 1);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding date time tz', () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTimeTz('created_at');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding date time tz with precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTimeTz('created_at', 1);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding time', () => {
    const blueprint = new Blueprint('users');
    blueprint.time('created_at');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" time not null');
  });
  it('adding time with precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.time('created_at', 1);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" time not null');
  });
  it('adding time tz', () => {
    const blueprint = new Blueprint('users');
    blueprint.timeTz('created_at');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" time not null');
  });
  it('adding time tz with precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.timeTz('created_at', 1);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" time not null');
  });
  it('adding timestamp', () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamp('created_at');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding timestamp with precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamp('created_at', 1);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding timestamp tz', () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampTz('created_at');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding timestamp tz with precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampTz('created_at', 1);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding timestamps', () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamps();
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(2);
    expect(statements).toEqual([
      'alter table "users" add column "created_at" datetime',
      'alter table "users" add column "updated_at" datetime'
    ]);
  });
  it('adding timestamps tz', () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampsTz();
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(2);
    expect(statements).toEqual([
      'alter table "users" add column "created_at" datetime',
      'alter table "users" add column "updated_at" datetime'
    ]);
  });
  it('adding remember token', () => {
    const blueprint = new Blueprint('users');
    blueprint.rememberToken();
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "remember_token" varchar');
  });
  it('adding binary', () => {
    const blueprint = new Blueprint('users');
    blueprint.binary('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" blob not null');
  });
  it('adding uuid', () => {
    const blueprint = new Blueprint('users');
    blueprint.uuid('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" varchar not null');
  });
  it('adding foreign uuid', () => {
    const blueprint   = new Blueprint('users');
    const foreignUuid = blueprint.foreignUuid('foo');
    blueprint.foreignUuid('company_id').withConstrained();
    blueprint.foreignUuid('laravel_idea_id').withConstrained();
    blueprint.foreignUuid('team_id').withReferences('id').withOn('teams');
    blueprint.foreignUuid('team_column_id').withConstrained('teams');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(foreignUuid).toBeInstanceOf(ForeignIdColumnDefinition);
    expect(statements).toEqual([
      'alter table "users" add column "foo" varchar not null',
      'alter table "users" add column "company_id" varchar not null',
      'alter table "users" add column "laravel_idea_id" varchar not null',
      'alter table "users" add column "team_id" varchar not null',
      'alter table "users" add column "team_column_id" varchar not null'
    ]);
  });
  it('adding ip address', () => {
    const blueprint = new Blueprint('users');
    blueprint.ipAddress('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" varchar not null');
  });
  it('adding mac address', () => {
    const blueprint = new Blueprint('users');
    blueprint.macAddress('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" varchar not null');
  });
  it('adding geometry', () => {
    const blueprint = new Blueprint('geo');
    blueprint.geometry('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add column "coordinates" geometry not null');
  });
  it('adding point', () => {
    const blueprint = new Blueprint('geo');
    blueprint.point('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add column "coordinates" point not null');
  });
  it('adding line string', () => {
    const blueprint = new Blueprint('geo');
    blueprint.lineString('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "geo" add column "coordinates" linestring not null');
  });
  it('adding polygon', () => {
    const blueprint = new Blueprint('geo');
    blueprint.polygon('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add column "coordinates" polygon not null');
  });
  it('adding geometry collection', () => {
    const blueprint = new Blueprint('geo');
    blueprint.geometryCollection('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "geo" add column "coordinates" geometrycollection not null');
  });
  it('adding multi point', () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiPoint('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "geo" add column "coordinates" multipoint not null');
  });
  it('adding multi line string', () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiLineString('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "geo" add column "coordinates" multilinestring not null');
  });
  it('adding multi polygon', () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiPolygon('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "geo" add column "coordinates" multipolygon not null');
  });
  // it('grammars are macroable', () => {
  //   getGrammar().macro('compileReplace', () => {
  //     return true;
  //   });
  //   var c = getGrammar().compileReplace();
  //   expect(c).toBeTruthy();
  // });
});

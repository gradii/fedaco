// noinspection DuplicatedCode
import { Connection } from '../../src/connection';
import { type WrappedConnection } from '../../src/connector/wrapped-connection';
import { DatabaseConfig } from '../../src/database-config';
import { type ConnectionInterface } from '../../src/query-builder/connection-interface';
import { type QueryGrammar } from '../../src/query-builder/grammar/query-grammar';
import { SqliteQueryGrammar } from '../../src/query-builder/grammar/sqlite-query-grammar';
import { Processor } from '../../src/query-builder/processor';
import { QueryBuilder } from '../../src/query-builder/query-builder';
import { Blueprint } from '../../src/schema/blueprint';
import { ForeignIdColumnDefinition } from '../../src/schema/foreign-id-column-definition';
import { SqliteSchemaGrammar } from '../../src/schema/grammar/sqlite-schema-grammar';
import { type SchemaBuilder } from '../../src/schema/schema-builder';

jest.setTimeout(100000);

class Conn extends Connection implements ConnectionInterface {
  constructor() {
    super(undefined, undefined, undefined, undefined);
  }

  // @ts-ignore
  getDefaultQueryGrammar(): QueryGrammar {}

  // @ts-ignore
  getDefaultPostProcessor(): Processor {}

  getSchemaBuilder(): SchemaBuilder {
    throw new Error('Method not implemented.');
  }

  getConfig(): any {}

  table(table: string | Function | QueryBuilder, as?: string): QueryBuilder {
    throw new Error('Method not implemented.');
  }

  getPdo(): Promise<WrappedConnection> {
    throw new Error('Method not implemented.');
  }

  getQueryGrammar(): any {}

  getDatabaseName(): string {
    return 'default-database';
  }

  getPostProcessor(): any {}

  query(): QueryBuilder {
    return new QueryBuilder(this, new SqliteQueryGrammar(), new Processor());
  }

  async select() {
    return await Promise.resolve();
  }

  async insert(sql: string, bindings: any[]): Promise<boolean> {
    throw new Error('not implement');
  }

  async update() {}

  async delete() {}

  async statement() {}

  async affectingStatement() {}

  getName() {
    return '';
  }

  recordsHaveBeenModified(): any {}

  selectFromWriteConnection(sql: string, values: any): any {}
}

function getConnection() {
  return new Conn();
}

function getGrammar() {
  return new SqliteSchemaGrammar();
}

describe('test database sqlite schema grammar', () => {
  it('basic create table', async () => {
    let blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.increments('id');
    blueprint.string('email');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create table "users" ("id" integer primary key autoincrement not null, "email" varchar not null)',
    );
    blueprint = new Blueprint('users');
    blueprint.increments('id');
    blueprint.string('email');
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(2);
    const expected = [
      'alter table "users" add column "id" integer primary key autoincrement not null',
      'alter table "users" add column "email" varchar not null',
    ];
    expect(statements).toEqual(expected);
  });
  it('create temporary table', async () => {
    const blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.temporary();
    blueprint.increments('id');
    blueprint.string('email');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create temporary table "users" ("id" integer primary key autoincrement not null, "email" varchar not null)',
    );
  });
  it('drop table', async () => {
    const blueprint = new Blueprint('users');
    blueprint.drop();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop table "users"');
  });
  it('drop table if exists', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropIfExists();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop table if exists "users"');
  });
  it('drop unique', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropUnique('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop index "foo"');
  });
  it('drop index', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropIndex('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop index "foo"');
  });
  it('drop column', async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      driver  : 'sqlite',
      database: ':memory:',
      prefix  : 'prefix_',
    });
    db.setAsGlobal();
    const schema = db.getConnection().getSchemaBuilder();
    await schema.create('users', (table) => {
      table.string('email');
      table.string('name');
    });
    expect(await schema.hasTable('users')).toBeTruthy();
    expect(await schema.hasColumn('users', 'name')).toBeTruthy();
    await schema.table('users', (table) => {
      table.dropColumn('name');
    });
    expect(await schema.hasColumn('users', 'name')).toBeFalsy();
  });
  it('drop spatial index', async () => {
    await expect(async () => {
      const blueprint = new Blueprint('geo');
      blueprint.dropSpatialIndex(['coordinates']);
      await blueprint.toSql(getConnection(), getGrammar());
    }).rejects.toThrow('RuntimeException The database driver in use does not support spatial indexes.');
  });
  it('rename table', async () => {
    const blueprint = new Blueprint('users');
    blueprint.rename('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" rename to "foo"');
  });
  it('rename index', async () => {
    // if (!class_exists(SqliteSchemaManager)) {
    //   this.markTestSkipped('Doctrine should be installed to run renameIndex tests');
    // }
    const db = new DatabaseConfig();
    db.addConnection({
      driver  : 'sqlite',
      database: ':memory:',
      prefix  : 'prefix_',
    });
    db.setAsGlobal();
    const schema = db.getConnection().getSchemaBuilder();
    await schema.create('users', (table) => {
      table.string('name');
      table.string('email');
    });
    await schema.table('users', (table) => {
      table.index(['name', 'email'], 'index1');
    });
    const indexes = await schema.getIndexListing('users');
    expect(indexes.includes('index1')).toBeTruthy();
    expect(indexes.includes('index2')).toBeFalsy();
    await schema.table('users', (table) => {
      table.renameIndex('index1', 'index2');
    });
    expect(await schema.hasIndex('users', 'index1')).toBeFalsy();
    const _indexes = await schema.getIndexes('users');
    expect(
      _indexes.find(
        (index) => index['name'] === 'index2' && index['columns'][0] === 'name' && index['columns'][1] === 'email',
      ),
    );
  });
  it('adding primary key', async () => {
    const blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.string('foo').withPrimary();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('create table "users" ("foo" varchar not null, primary key ("foo"))');
  });
  it('adding foreign key', async () => {
    const blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.string('foo').withPrimary();
    blueprint.string('order_id');
    blueprint.foreign(['order_id']).withReferences('id').withOn('orders');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create table "users" ("foo" varchar not null, "order_id" varchar not null, foreign key("order_id") references "orders"("id"), primary key ("foo"))',
    );
  });
  it('adding unique key', async () => {
    const blueprint = new Blueprint('users');
    blueprint.unique(['foo'], 'bar');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('create unique index "bar" on "users" ("foo")');
  });
  it('adding index', async () => {
    const blueprint = new Blueprint('users');
    blueprint.index(['foo', 'bar'], 'baz');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('create index "baz" on "users" ("foo", "bar")');
  });
  it('adding spatial index', async () => {
    await expect(async () => {
      const blueprint = new Blueprint('geo');
      blueprint.spatialIndex(['coordinates']);
      await blueprint.toSql(getConnection(), getGrammar());
    }).rejects.toThrow('RuntimeException The database driver in use does not support spatial indexes.');
  });
  it('adding fluent spatial index', async () => {
    await expect(async () => {
      const blueprint = new Blueprint('geo');
      blueprint.point('coordinates').withSpatialIndex();
      await blueprint.toSql(getConnection(), getGrammar());
    }).rejects.toThrow('RuntimeException The database driver in use does not support spatial indexes.');
  });
  it('adding raw index', async () => {
    const blueprint = new Blueprint('users');
    blueprint.rawIndex('(function(column))', 'raw_index');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('create index "raw_index" on "users" ((function(column)))');
  });
  it('adding incrementing id', async () => {
    const blueprint = new Blueprint('users');
    blueprint.increments('id');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "id" integer primary key autoincrement not null');
  });
  it('adding small incrementing id', async () => {
    const blueprint = new Blueprint('users');
    blueprint.smallIncrements('id');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "id" integer primary key autoincrement not null');
  });
  it('adding medium incrementing id', async () => {
    const blueprint = new Blueprint('users');
    blueprint.mediumIncrements('id');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "id" integer primary key autoincrement not null');
  });
  it('adding id', async () => {
    let blueprint = new Blueprint('users');
    blueprint.id();
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "id" integer primary key autoincrement not null');
    blueprint = new Blueprint('users');
    blueprint.id('foo');
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer primary key autoincrement not null');
  });
  it('adding foreign id', async () => {
    const blueprint = new Blueprint('users');
    const foreignId = blueprint.foreignId('foo');
    blueprint.foreignId('company_id').withConstrained();
    blueprint.foreignId('laravel_idea_id').withConstrained();
    blueprint.foreignId('team_id').withReferences('id').withOn('teams');
    blueprint.foreignId('team_column_id').withConstrained('teams');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(foreignId).toBeInstanceOf(ForeignIdColumnDefinition);
    expect(statements).toEqual([
      'alter table "users" add column "foo" integer not null',
      'alter table "users" add column "company_id" integer not null',
      'alter table "users" add column "laravel_idea_id" integer not null',
      'alter table "users" add column "team_id" integer not null',
      'alter table "users" add column "team_column_id" integer not null',
    ]);
  });
  it('adding big incrementing id', async () => {
    const blueprint = new Blueprint('users');
    blueprint.bigIncrements('id');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "id" integer primary key autoincrement not null');
  });
  it('adding string', async () => {
    let blueprint = new Blueprint('users');
    blueprint.string('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" varchar not null');
    blueprint = new Blueprint('users');
    blueprint.string('foo', 100);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" varchar not null');
    blueprint = new Blueprint('users');
    blueprint.string('foo', 100).withNullable().withDefault('bar');
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" varchar default \'bar\'');
  });
  it('adding text', async () => {
    const blueprint = new Blueprint('users');
    blueprint.text('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" text not null');
  });
  it('adding big integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.bigInteger('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer not null');
    blueprint = new Blueprint('users');
    blueprint.bigInteger('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer primary key autoincrement not null');
  });
  it('adding integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.integer('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer not null');
    blueprint = new Blueprint('users');
    blueprint.integer('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer primary key autoincrement not null');
  });
  it('adding medium integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.mediumInteger('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer not null');
    blueprint = new Blueprint('users');
    blueprint.mediumInteger('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer primary key autoincrement not null');
  });
  it('adding tiny integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.tinyInteger('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer not null');
    blueprint = new Blueprint('users');
    blueprint.tinyInteger('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer primary key autoincrement not null');
  });
  it('adding small integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.smallInteger('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer not null');
    blueprint = new Blueprint('users');
    blueprint.smallInteger('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" integer primary key autoincrement not null');
  });
  it('adding float', async () => {
    const blueprint = new Blueprint('users');
    blueprint.float('foo', 5, 2);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" float not null');
  });
  it('adding double', async () => {
    const blueprint = new Blueprint('users');
    blueprint.double('foo', 15, 8);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" float not null');
  });
  it('adding decimal', async () => {
    const blueprint = new Blueprint('users');
    blueprint.decimal('foo', 5, 2);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" numeric not null');
  });
  it('adding boolean', async () => {
    const blueprint = new Blueprint('users');
    blueprint.boolean('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" tinyint(1) not null');
  });
  it('adding enum', async () => {
    const blueprint = new Blueprint('users');
    blueprint.enum('role', ['member', 'admin']);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "role" varchar check ("role" in (\'member\', \'admin\')) not null',
    );
  });
  it('adding json', async () => {
    const blueprint = new Blueprint('users');
    blueprint.json('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" text not null');
  });
  it('adding jsonb', async () => {
    const blueprint = new Blueprint('users');
    blueprint.jsonb('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" text not null');
  });
  it('adding date', async () => {
    const blueprint = new Blueprint('users');
    blueprint.date('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" date not null');
  });
  it('adding year', async () => {
    const blueprint = new Blueprint('users');
    blueprint.year('birth_year');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "birth_year" integer not null');
  });
  it('adding date time', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTime('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding date time with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTime('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding date time tz', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTimeTz('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding date time tz with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTimeTz('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding time', async () => {
    const blueprint = new Blueprint('users');
    blueprint.time('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" time not null');
  });
  it('adding time with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.time('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" time not null');
  });
  it('adding time tz', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timeTz('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" time not null');
  });
  it('adding time tz with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timeTz('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" time not null');
  });
  it('adding timestamp', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamp('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding timestamp with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamp('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding timestamp tz', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampTz('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding timestamp tz with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampTz('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "created_at" datetime not null');
  });
  it('adding timestamps', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamps();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(2);
    expect(statements).toEqual([
      'alter table "users" add column "created_at" datetime',
      'alter table "users" add column "updated_at" datetime',
    ]);
  });
  it('adding timestamps tz', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampsTz();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(2);
    expect(statements).toEqual([
      'alter table "users" add column "created_at" datetime',
      'alter table "users" add column "updated_at" datetime',
    ]);
  });
  it('adding remember token', async () => {
    const blueprint = new Blueprint('users');
    blueprint.rememberToken();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "remember_token" varchar');
  });
  it('adding binary', async () => {
    const blueprint = new Blueprint('users');
    blueprint.binary('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" blob not null');
  });
  it('adding uuid', async () => {
    const blueprint = new Blueprint('users');
    blueprint.uuid('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" varchar not null');
  });
  it('adding foreign uuid', async () => {
    const blueprint = new Blueprint('users');
    const foreignUuid = blueprint.foreignUuid('foo');
    blueprint.foreignUuid('company_id').withConstrained();
    blueprint.foreignUuid('laravel_idea_id').withConstrained();
    blueprint.foreignUuid('team_id').withReferences('id').withOn('teams');
    blueprint.foreignUuid('team_column_id').withConstrained('teams');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(foreignUuid).toBeInstanceOf(ForeignIdColumnDefinition);
    expect(statements).toEqual([
      'alter table "users" add column "foo" varchar not null',
      'alter table "users" add column "company_id" varchar not null',
      'alter table "users" add column "laravel_idea_id" varchar not null',
      'alter table "users" add column "team_id" varchar not null',
      'alter table "users" add column "team_column_id" varchar not null',
    ]);
  });
  it('adding ip address', async () => {
    const blueprint = new Blueprint('users');
    blueprint.ipAddress('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" varchar not null');
  });
  it('adding mac address', async () => {
    const blueprint = new Blueprint('users');
    blueprint.macAddress('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" varchar not null');
  });
  it('adding geometry', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.geometry('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add column "coordinates" geometry not null');
  });
  it('adding point', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.point('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add column "coordinates" point not null');
  });
  it('adding line string', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.lineString('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add column "coordinates" linestring not null');
  });
  it('adding polygon', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.polygon('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add column "coordinates" polygon not null');
  });
  it('adding geometry collection', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.geometryCollection('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add column "coordinates" geometrycollection not null');
  });
  it('adding multi point', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiPoint('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add column "coordinates" multipoint not null');
  });
  it('adding multi line string', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiLineString('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add column "coordinates" multilinestring not null');
  });
  it('adding multi polygon', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiPolygon('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add column "coordinates" multipolygon not null');
  });
  // it('grammars are macroable', () => {
  //   getGrammar().macro('compileReplace', () => {
  //     return true;
  //   });
  //   var c = getGrammar().compileReplace();
  //   expect(c).toBeTruthy();
  // });
});

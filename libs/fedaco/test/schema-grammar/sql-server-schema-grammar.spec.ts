/* tslint:disable:max-line-length */
import { Connection } from '../../src/connection';
import { WrappedConnection } from '../../src/connector/wrapped-connection';
import { ConnectionInterface } from '../../src/query-builder/connection-interface';
import { QueryGrammar } from '../../src/query-builder/grammar/query-grammar';
import { SqlserverQueryGrammar } from '../../src/query-builder/grammar/sqlserver-query-grammar';
import { Processor } from '../../src/query-builder/processor';
import { QueryBuilder } from '../../src/query-builder/query-builder';
import { Blueprint } from '../../src/schema/blueprint';
import { ForeignIdColumnDefinition } from '../../src/schema/foreign-id-column-definition';
import { SqlServerSchemaGrammar } from '../../src/schema/grammar/sql-server-schema-grammar';
import { SchemaBuilder } from '../../src/schema/schema-builder';


// noinspection DuplicatedCode
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
      new SqlserverQueryGrammar(),
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
  return new SqlServerSchemaGrammar();
}

describe('test database sql server schema grammar', () => {

  it('basic create table', async () => {
    let blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.increments('id');
    blueprint.string('email');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create table "users" ("id" int identity primary key not null, "email" nvarchar(255) not null)');
    blueprint = new Blueprint('users');
    blueprint.increments('id');
    blueprint.string('email');
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "id" int identity primary key not null, "email" nvarchar(255) not null');
    blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.increments('id');
    blueprint.string('email');
    statements = await blueprint.toSql(getConnection(),
      getGrammar().setTablePrefix('prefix_'));
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create table "prefix_users" ("id" int identity primary key not null, "email" nvarchar(255) not null)');
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
      'create table "#users" ("id" int identity primary key not null, "email" nvarchar(255) not null)');
  });
  it('drop table', async () => {
    let blueprint = new Blueprint('users');
    blueprint.drop();
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop table "users"');
    blueprint = new Blueprint('users');
    blueprint.drop();
    statements = await blueprint.toSql(getConnection(),
      getGrammar().setTablePrefix('prefix_'));
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop table "prefix_users"');
  });
  it('drop table if exists', async () => {
    let blueprint = new Blueprint('users');
    blueprint.dropIfExists();
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'if exists (select * from sys.sysobjects where id = object_id(\'users\', \'U\')) drop table "users"');
    blueprint = new Blueprint('users');
    blueprint.dropIfExists();
    statements = await blueprint.toSql(getConnection(),
      getGrammar().setTablePrefix('prefix_'));
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'if exists (select * from sys.sysobjects where id = object_id(\'prefix_users\', \'U\')) drop table "prefix_users"');
  });
  it('drop column', async () => {
    let blueprint = new Blueprint('users');
    blueprint.dropColumn('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toContain('alter table "users" drop column "foo"');
    blueprint = new Blueprint('users');
    blueprint.dropColumn(['foo', 'bar']);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toContain(
      'alter table "users" drop column "foo", "bar"');
    blueprint = new Blueprint('users');
    blueprint.dropColumn('foo', 'bar');
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toContain(
      'alter table "users" drop column "foo", "bar"');
  });
  it('drop column drops creates sql to drop default constraints', async () => {
    const blueprint = new Blueprint('foo');
    blueprint.dropColumn('bar');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'DECLARE @sql NVARCHAR(MAX) = \'\';SELECT @sql += \'ALTER TABLE [dbo].[foo] DROP CONSTRAINT \' + OBJECT_NAME([default_object_id]) + \';\' FROM SYS.COLUMNS WHERE [object_id] = OBJECT_ID(\'[dbo].[foo]\') AND [name] in (\'bar\') AND [default_object_id] <> 0;EXEC(@sql);alter table "foo" drop column "bar"');
  });
  it('drop primary', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropPrimary('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" drop constraint "foo"');
  });
  it('drop unique', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropUnique('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop index "foo" on "users"');
  });
  it('drop index', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropIndex('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop index "foo" on "users"');
  });
  it('drop spatial index', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.dropSpatialIndex(['coordinates']);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop index "geo_coordinates_spatialindex" on "geo"');
  });
  it('drop foreign', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropForeign('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" drop constraint "foo"');
  });
  it('drop timestamps', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropTimestamps();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toContain(
      'alter table "users" drop column "created_at", "updated_at"');
  });
  it('drop timestamps tz', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropTimestampsTz();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toContain(
      'alter table "users" drop column "created_at", "updated_at"');
  });
  it('drop morphs', async () => {
    const blueprint = new Blueprint('photos');
    blueprint.dropMorphs('imageable');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(2);
    expect(statements[0]).toBe(
      'drop index "photos_imageable_type_imageable_id_index" on "photos"');
    expect(statements[1]).toContain(
      'alter table "photos" drop column "imageable_type", "imageable_id"');
  });
  it('rename table', async () => {
    const blueprint = new Blueprint('users');
    blueprint.rename('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('sp_rename "users", "foo"');
  });
  it('rename index', async () => {
    const blueprint = new Blueprint('users');
    blueprint.renameIndex('foo', 'bar');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('sp_rename N\'"users"."foo"\', "bar", N\'INDEX\'');
  });
  it('adding primary key', async () => {
    const blueprint = new Blueprint('users');
    blueprint.primary(['foo'], 'bar');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add constraint "bar" primary key ("foo")');
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
    const blueprint = new Blueprint('geo');
    blueprint.spatialIndex(['coordinates']);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create spatial index "geo_coordinates_spatialindex" on "geo" ("coordinates")');
  });
  it('adding fluent spatial index', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.point('coordinates').withSpatialIndex();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(2);
    expect(statements[1]).toBe(
      'create spatial index "geo_coordinates_spatialindex" on "geo" ("coordinates")');
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
    expect(statements[0]).toBe(
      'alter table "users" add "id" int identity primary key not null');
  });
  it('adding small incrementing id', async () => {
    const blueprint = new Blueprint('users');
    blueprint.smallIncrements('id');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "id" smallint identity primary key not null');
  });
  it('adding medium incrementing id', async () => {
    const blueprint = new Blueprint('users');
    blueprint.mediumIncrements('id');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "id" int identity primary key not null');
  });
  it('adding id', async () => {
    let blueprint = new Blueprint('users');
    blueprint.id();
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "id" bigint identity primary key not null');
    blueprint = new Blueprint('users');
    blueprint.id('foo');
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "foo" bigint identity primary key not null');
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
      'alter table "users" add "foo" bigint not null, "company_id" bigint not null, "laravel_idea_id" bigint not null, "team_id" bigint not null, "team_column_id" bigint not null',
      'alter table "users" add constraint "users_company_id_foreign" foreign key ("company_id") references "companies" ("id")',
      'alter table "users" add constraint "users_laravel_idea_id_foreign" foreign key ("laravel_idea_id") references "laravel_ideas" ("id")',
      'alter table "users" add constraint "users_team_id_foreign" foreign key ("team_id") references "teams" ("id")',
      'alter table "users" add constraint "users_team_column_id_foreign" foreign key ("team_column_id") references "teams" ("id")'
    ]);
  });
  it('adding big incrementing id', async () => {
    const blueprint = new Blueprint('users');
    blueprint.bigIncrements('id');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "id" bigint identity primary key not null');
  });
  it('adding string', async () => {
    let blueprint = new Blueprint('users');
    blueprint.string('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" nvarchar(255) not null');
    blueprint = new Blueprint('users');
    blueprint.string('foo', 100);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" nvarchar(100) not null');
    blueprint = new Blueprint('users');
    blueprint.string('foo', 100).withNullable().withDefault('bar');
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "foo" nvarchar(100) null default \'bar\'');
  });
  it('adding text', async () => {
    const blueprint = new Blueprint('users');
    blueprint.text('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" nvarchar(max) not null');
  });
  it('adding big integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.bigInteger('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" bigint not null');
    blueprint = new Blueprint('users');
    blueprint.bigInteger('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "foo" bigint identity primary key not null');
  });
  it('adding integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.integer('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" int not null');
    blueprint = new Blueprint('users');
    blueprint.integer('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "foo" int identity primary key not null');
  });
  it('adding medium integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.mediumInteger('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" int not null');
    blueprint = new Blueprint('users');
    blueprint.mediumInteger('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "foo" int identity primary key not null');
  });
  it('adding tiny integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.tinyInteger('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" tinyint not null');
    blueprint = new Blueprint('users');
    blueprint.tinyInteger('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "foo" tinyint identity primary key not null');
  });
  it('adding small integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.smallInteger('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" smallint not null');
    blueprint = new Blueprint('users');
    blueprint.smallInteger('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "foo" smallint identity primary key not null');
  });
  it('adding float', async () => {
    const blueprint = new Blueprint('users');
    blueprint.float('foo', 5, 2);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" float not null');
  });
  it('adding double', async () => {
    const blueprint = new Blueprint('users');
    blueprint.double('foo', 15, 2);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" float not null');
  });
  it('adding decimal', async () => {
    const blueprint = new Blueprint('users');
    blueprint.decimal('foo', 5, 2);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" decimal(5, 2) not null');
  });
  it('adding boolean', async () => {
    const blueprint = new Blueprint('users');
    blueprint.boolean('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" bit not null');
  });
  it('adding enum', async () => {
    const blueprint = new Blueprint('users');
    blueprint.enum('role', ['member', 'admin']);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "role" nvarchar(255) check ("role" in (N\'member\', N\'admin\')) not null');
  });
  it('adding json', async () => {
    const blueprint = new Blueprint('users');
    blueprint.json('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" nvarchar(max) not null');
  });
  it('adding jsonb', async () => {
    const blueprint = new Blueprint('users');
    blueprint.jsonb('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" nvarchar(max) not null');
  });
  it('adding date', async () => {
    const blueprint = new Blueprint('users');
    blueprint.date('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" date not null');
  });
  it('adding year', async () => {
    const blueprint = new Blueprint('users');
    blueprint.year('birth_year');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "birth_year" int not null');
  });
  it('adding date time', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTime('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "created_at" datetime not null');
  });
  it('adding date time with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTime('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "created_at" datetime2(1) not null');
  });
  it('adding date time tz', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTimeTz('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" datetimeoffset not null');
  });
  it('adding date time tz with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTimeTz('foo', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" datetimeoffset(1) not null');
  });
  it('adding time', async () => {
    const blueprint = new Blueprint('users');
    blueprint.time('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "created_at" time not null');
  });
  it('adding time with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.time('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "created_at" time(1) not null');
  });
  it('adding time tz', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timeTz('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "created_at" time not null');
  });
  it('adding time tz with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timeTz('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "created_at" time(1) not null');
  });
  it('adding timestamp', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamp('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "created_at" datetime not null');
  });
  it('adding timestamp with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamp('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "created_at" datetime2(1) not null');
  });
  it('adding timestamp tz', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampTz('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "created_at" datetimeoffset not null');
  });
  it('adding timestamp tz with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampTz('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "created_at" datetimeoffset(1) not null');
  });
  it('adding timestamps', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamps();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "created_at" datetime null, "updated_at" datetime null');
  });
  it('adding timestamps tz', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampsTz();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add "created_at" datetimeoffset null, "updated_at" datetimeoffset null');
  });
  it('adding remember token', async () => {
    const blueprint = new Blueprint('users');
    blueprint.rememberToken();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "remember_token" nvarchar(100) null');
  });
  it('adding binary', async () => {
    const blueprint = new Blueprint('users');
    blueprint.binary('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" varbinary(max) not null');
  });
  it('adding uuid', async () => {
    const blueprint = new Blueprint('users');
    blueprint.uuid('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" uniqueidentifier not null');
  });
  it('adding foreign uuid', async () => {
    const blueprint = new Blueprint('users');
    const foreignId = blueprint.foreignUuid('foo');
    blueprint.foreignUuid('company_id').withConstrained();
    blueprint.foreignUuid('laravel_idea_id').withConstrained();
    blueprint.foreignUuid('team_id').withReferences('id').withOn('teams');
    blueprint.foreignUuid('team_column_id').withConstrained('teams');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(foreignId).toBeInstanceOf(ForeignIdColumnDefinition);
    expect(statements).toEqual([
      'alter table "users" add "foo" uniqueidentifier not null, "company_id" uniqueidentifier not null, "laravel_idea_id" uniqueidentifier not null, "team_id" uniqueidentifier not null, "team_column_id" uniqueidentifier not null',
      'alter table "users" add constraint "users_company_id_foreign" foreign key ("company_id") references "companies" ("id")',
      'alter table "users" add constraint "users_laravel_idea_id_foreign" foreign key ("laravel_idea_id") references "laravel_ideas" ("id")',
      'alter table "users" add constraint "users_team_id_foreign" foreign key ("team_id") references "teams" ("id")',
      'alter table "users" add constraint "users_team_column_id_foreign" foreign key ("team_column_id") references "teams" ("id")'
    ]);
  });
  it('adding ip address', async () => {
    const blueprint = new Blueprint('users');
    blueprint.ipAddress('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" nvarchar(45) not null');
  });
  it('adding mac address', async () => {
    const blueprint = new Blueprint('users');
    blueprint.macAddress('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add "foo" nvarchar(17) not null');
  });
  it('adding geometry', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.geometry('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add "coordinates" geography not null');
  });
  it('adding point', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.point('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add "coordinates" geography not null');
  });
  it('adding line string', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.lineString('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add "coordinates" geography not null');
  });
  it('adding polygon', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.polygon('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add "coordinates" geography not null');
  });
  it('adding geometry collection', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.geometryCollection('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add "coordinates" geography not null');
  });
  it('adding multi point', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiPoint('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add "coordinates" geography not null');
  });
  it('adding multi line string', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiLineString('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add "coordinates" geography not null');
  });
  it('adding multi polygon', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiPolygon('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "geo" add "coordinates" geography not null');
  });
  it('adding generated column', async () => {
    const blueprint = new Blueprint('products');
    blueprint.integer('price');
    blueprint.computed('discounted_virtual', 'price - 5');
    blueprint.computed('discounted_stored', 'price - 5').withPersisted();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "products" add "price" int not null, "discounted_virtual" as (price - 5), "discounted_stored" as (price - 5) persisted');
  });
  // it('grammars are macroable', async () => {
  //   getGrammar().macro('compileReplace', async () => {
  //     return true;
  //   });
  //   var c = getGrammar().compileReplace();
  //   expect(c).toBeTruthy();
  // });
  it('quote string', () => {
    expect(getGrammar().quoteString('\u4E2D\u6587\u6E2C\u8A66')).toBe(
      'N\'\u4E2D\u6587\u6E2C\u8A66\'');
  });
  it('quote string on array', () => {
    expect(getGrammar().quoteString(['\u4E2D\u6587', '\u6E2C\u8A66'])).toBe(
      'N\'\u4E2D\u6587\', N\'\u6E2C\u8A66\'');
  });
});

/* tslint:disable:max-line-length */
import { Connection } from '../../src/connection';
import { WrappedConnection } from '../../src/connector/wrapped-connection';
import { ConnectionInterface } from '../../src/query-builder/connection-interface';
import { PostgresQueryGrammar } from '../../src/query-builder/grammar/postgres-query-grammar';
import { QueryGrammar } from '../../src/query-builder/grammar/query-grammar';
import { Processor } from '../../src/query-builder/processor';
import { QueryBuilder } from '../../src/query-builder/query-builder';
import { Blueprint } from '../../src/schema/blueprint';
import { ForeignIdColumnDefinition } from '../../src/schema/foreign-id-column-definition';
import { PostgresSchemaGrammar } from '../../src/schema/grammar/postgres-schema-grammar';
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
      new PostgresQueryGrammar(),
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
  return new PostgresSchemaGrammar();
}

describe('test database postgres schema grammar', () => {

  it('basic create table', () => {
    let blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.increments('id');
    blueprint.string('email');
    blueprint.string('name').withCollation('nb_NO.utf8');
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create table "users" ("id" serial primary key not null, "email" varchar(255) not null, "name" varchar(255) collate "nb_NO.utf8" not null)');
    blueprint = new Blueprint('users');
    blueprint.increments('id');
    blueprint.string('email');
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "id" serial primary key not null, add column "email" varchar(255) not null');
  });
  it('create table and comment column', () => {
    const blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.increments('id');
    blueprint.string('email').withComment('my first comment');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(2);
    expect(statements[0]).toBe(
      'create table "users" ("id" serial primary key not null, "email" varchar(255) not null)');
    expect(statements[1]).toBe('comment on column "users"."email" is \'my first comment\'');
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
      'create temporary table "users" ("id" serial primary key not null, "email" varchar(255) not null)');
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
  it('drop column', () => {
    let blueprint = new Blueprint('users');
    blueprint.dropColumn('foo');
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" drop column "foo"');
    blueprint = new Blueprint('users');
    blueprint.dropColumn(['foo', 'bar']);
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" drop column "foo", drop column "bar"');
    blueprint = new Blueprint('users');
    blueprint.dropColumn('foo', 'bar');
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" drop column "foo", drop column "bar"');
  });
  it('drop primary', () => {
    const blueprint = new Blueprint('users');
    blueprint.dropPrimary();
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" drop constraint "users_pkey"');
  });
  it('drop unique', () => {
    const blueprint = new Blueprint('users');
    blueprint.dropUnique('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" drop constraint "foo"');
  });
  it('drop index', () => {
    const blueprint = new Blueprint('users');
    blueprint.dropIndex('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop index "foo"');
  });
  it('drop spatial index', () => {
    const blueprint = new Blueprint('geo');
    blueprint.dropSpatialIndex(['coordinates']);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop index "geo_coordinates_spatialindex"');
  });
  it('drop foreign', () => {
    const blueprint = new Blueprint('users');
    blueprint.dropForeign('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" drop constraint "foo"');
  });
  it('drop timestamps', () => {
    const blueprint = new Blueprint('users');
    blueprint.dropTimestamps();
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" drop column "created_at", drop column "updated_at"');
  });
  it('drop timestamps tz', () => {
    const blueprint = new Blueprint('users');
    blueprint.dropTimestampsTz();
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" drop column "created_at", drop column "updated_at"');
  });
  it('drop morphs', () => {
    const blueprint = new Blueprint('photos');
    blueprint.dropMorphs('imageable');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(2);
    expect(statements[0]).toBe('drop index "photos_imageable_type_imageable_id_index"');
    expect(statements[1]).toBe(
      'alter table "photos" drop column "imageable_type", drop column "imageable_id"');
  });
  it('rename table', () => {
    const blueprint = new Blueprint('users');
    blueprint.rename('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" rename to "foo"');
  });
  it('rename index', () => {
    const blueprint = new Blueprint('users');
    blueprint.renameIndex('foo', 'bar');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter index "foo" rename to "bar"');
  });
  it('adding primary key', () => {
    const blueprint = new Blueprint('users');
    blueprint.primary(['foo']);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add primary key ("foo")');
  });
  it('adding unique key', () => {
    const blueprint = new Blueprint('users');
    blueprint.unique(['foo'], 'bar');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add constraint "bar" unique ("foo")');
  });
  it('adding index', () => {
    const blueprint = new Blueprint('users');
    blueprint.index(['foo', 'bar'], 'baz');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('create index "baz" on "users" ("foo", "bar")');
  });
  it('adding index with algorithm', () => {
    const blueprint = new Blueprint('users');
    blueprint.index(['foo', 'bar'], 'baz', 'hash');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('create index "baz" on "users" using hash ("foo", "bar")');
  });
  it('adding spatial index', () => {
    const blueprint = new Blueprint('geo');
    blueprint.spatialIndex('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create index "geo_coordinates_spatialindex" on "geo" using gist ("coordinates")');
  });
  it('adding fluent spatial index', () => {
    const blueprint = new Blueprint('geo');
    blueprint.point('coordinates').withSpatialIndex();
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(2);
    expect(statements[1]).toBe(
      'create index "geo_coordinates_spatialindex" on "geo" using gist ("coordinates")');
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
      'alter table "users" add column "id" serial primary key not null');
  });
  it('adding small incrementing id', () => {
    const blueprint = new Blueprint('users');
    blueprint.smallIncrements('id');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "id" smallserial primary key not null');
  });
  it('adding medium incrementing id', () => {
    const blueprint = new Blueprint('users');
    blueprint.mediumIncrements('id');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "id" serial primary key not null');
  });
  it('adding id', () => {
    let blueprint = new Blueprint('users');
    blueprint.id();
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "id" bigserial primary key not null');
    blueprint = new Blueprint('users');
    blueprint.id('foo');
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" bigserial primary key not null');
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
      'alter table "users" add column "foo" bigint not null, add column "company_id" bigint not null, add column "laravel_idea_id" bigint not null, add column "team_id" bigint not null, add column "team_column_id" bigint not null',
      'alter table "users" add constraint "users_company_id_foreign" foreign key ("company_id") references "companies" ("id")',
      'alter table "users" add constraint "users_laravel_idea_id_foreign" foreign key ("laravel_idea_id") references "laravel_ideas" ("id")',
      'alter table "users" add constraint "users_team_id_foreign" foreign key ("team_id") references "teams" ("id")',
      'alter table "users" add constraint "users_team_column_id_foreign" foreign key ("team_column_id") references "teams" ("id")'
    ]);
  });
  it('adding big incrementing id', () => {
    const blueprint = new Blueprint('users');
    blueprint.bigIncrements('id');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "id" bigserial primary key not null');
  });
  it('adding string', () => {
    let blueprint = new Blueprint('users');
    blueprint.string('foo');
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" varchar(255) not null');
    blueprint = new Blueprint('users');
    blueprint.string('foo', 100);
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" varchar(100) not null');
    blueprint = new Blueprint('users');
    blueprint.string('foo', 100).withNullable().withDefault('bar');
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" varchar(100) null default \'bar\'');
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
    expect(statements[0]).toBe('alter table "users" add column "foo" bigint not null');
    blueprint = new Blueprint('users');
    blueprint.bigInteger('foo', true);
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" bigserial primary key not null');
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
      'alter table "users" add column "foo" serial primary key not null');
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
      'alter table "users" add column "foo" serial primary key not null');
  });
  it('adding tiny integer', () => {
    let blueprint = new Blueprint('users');
    blueprint.tinyInteger('foo');
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" smallint not null');
    blueprint = new Blueprint('users');
    blueprint.tinyInteger('foo', true);
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" smallserial primary key not null');
  });
  it('adding small integer', () => {
    let blueprint = new Blueprint('users');
    blueprint.smallInteger('foo');
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" smallint not null');
    blueprint = new Blueprint('users');
    blueprint.smallInteger('foo', true);
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" smallserial primary key not null');
  });
  it('adding float', () => {
    const blueprint = new Blueprint('users');
    blueprint.float('foo', 5, 2);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" double precision not null');
  });
  it('adding double', () => {
    const blueprint = new Blueprint('users');
    blueprint.double('foo', 15, 8);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" double precision not null');
  });
  it('adding decimal', () => {
    const blueprint = new Blueprint('users');
    blueprint.decimal('foo', 5, 2);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" decimal(5, 2) not null');
  });
  it('adding boolean', () => {
    const blueprint = new Blueprint('users');
    blueprint.boolean('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" boolean not null');
  });
  it('adding enum', () => {
    const blueprint = new Blueprint('users');
    blueprint.enum('role', ['member', 'admin']);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "role" varchar(255) check ("role" in (\'member\', \'admin\')) not null');
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
  it('adding json', () => {
    const blueprint = new Blueprint('users');
    blueprint.json('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" json not null');
  });
  it('adding jsonb', () => {
    const blueprint = new Blueprint('users');
    blueprint.jsonb('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" jsonb not null');
  });
  it('adding date time', () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTime('created_at');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" timestamp(0) without time zone not null');
  });
  it('adding date time with precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTime('created_at', 1);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" timestamp(1) without time zone not null');
  });
  it('adding date time with null precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTime('created_at', null);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" timestamp without time zone not null');
  });
  it('adding date time tz', () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTimeTz('created_at');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" timestamp(0) with time zone not null');
  });
  it('adding date time tz with precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTimeTz('created_at', 1);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" timestamp(1) with time zone not null');
  });
  it('adding date time tz with null precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.dateTimeTz('created_at', null);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" timestamp with time zone not null');
  });
  it('adding time', () => {
    const blueprint = new Blueprint('users');
    blueprint.time('created_at');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" time(0) without time zone not null');
  });
  it('adding time with precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.time('created_at', 1);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" time(1) without time zone not null');
  });
  it('adding time with null precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.time('created_at', null);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" time without time zone not null');
  });
  it('adding time tz', () => {
    const blueprint = new Blueprint('users');
    blueprint.timeTz('created_at');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" time(0) with time zone not null');
  });
  it('adding time tz with precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.timeTz('created_at', 1);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" time(1) with time zone not null');
  });
  it('adding time tz with null precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.timeTz('created_at', null);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" time with time zone not null');
  });
  it('adding timestamp', () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamp('created_at');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" timestamp(0) without time zone not null');
  });
  it('adding timestamp with precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamp('created_at', 1);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" timestamp(1) without time zone not null');
  });
  it('adding timestamp with null precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamp('created_at', null);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" timestamp without time zone not null');
  });
  it('adding timestamp tz', () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampTz('created_at');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" timestamp(0) with time zone not null');
  });
  it('adding timestamp tz with precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampTz('created_at', 1);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" timestamp(1) with time zone not null');
  });
  it('adding timestamp tz with null precision', () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampTz('created_at', null);
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" timestamp with time zone not null');
  });
  it('adding timestamps', () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamps();
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" timestamp(0) without time zone null, add column "updated_at" timestamp(0) without time zone null');
  });
  it('adding timestamps tz', () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampsTz();
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "created_at" timestamp(0) with time zone null, add column "updated_at" timestamp(0) with time zone null');
  });
  it('adding binary', () => {
    const blueprint = new Blueprint('users');
    blueprint.binary('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" bytea not null');
  });
  it('adding uuid', () => {
    const blueprint = new Blueprint('users');
    blueprint.uuid('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" uuid not null');
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
      'alter table "users" add column "foo" uuid not null, add column "company_id" uuid not null, add column "laravel_idea_id" uuid not null, add column "team_id" uuid not null, add column "team_column_id" uuid not null',
      'alter table "users" add constraint "users_company_id_foreign" foreign key ("company_id") references "companies" ("id")',
      'alter table "users" add constraint "users_laravel_idea_id_foreign" foreign key ("laravel_idea_id") references "laravel_ideas" ("id")',
      'alter table "users" add constraint "users_team_id_foreign" foreign key ("team_id") references "teams" ("id")',
      'alter table "users" add constraint "users_team_column_id_foreign" foreign key ("team_column_id") references "teams" ("id")'
    ]);
  });
  it('adding generated as', () => {
    let blueprint = new Blueprint('users');
    blueprint.increments('foo').withGeneratedAs();
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" integer generated by default as identity primary key not null');
    blueprint = new Blueprint('users');
    blueprint.increments('foo').withGeneratedAs().withAlways();
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" integer generated always as identity primary key not null');
    blueprint = new Blueprint('users');
    blueprint.increments('foo').withGeneratedAs('increment by 10 start with 100');
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" integer generated by default as identity (increment by 10 start with 100) primary key not null');
    blueprint = new Blueprint('users');
    blueprint.integer('foo').withGeneratedAs();
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" integer generated by default as identity not null');
  });
  it('adding virtual as', () => {
    const blueprint = new Blueprint('users');
    blueprint.integer('foo').withNullable();
    blueprint.boolean('bar').withVirtualAs('foo is not null');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" integer null, add column "bar" boolean not null generated always as (foo is not null)');
  });
  it('adding stored as', () => {
    const blueprint = new Blueprint('users');
    blueprint.integer('foo').withNullable();
    blueprint.boolean('bar').withStoredAs('foo is not null');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add column "foo" integer null, add column "bar" boolean not null generated always as (foo is not null) stored');
  });
  it('adding ip address', () => {
    const blueprint = new Blueprint('users');
    blueprint.ipAddress('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" inet not null');
  });
  it('adding mac address', () => {
    const blueprint = new Blueprint('users');
    blueprint.macAddress('foo');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table "users" add column "foo" macaddr not null');
  });
  it('compile foreign', () => {
    let blueprint = new Blueprint('users');
    blueprint.foreign('parent_id').withReferences('id')
      .withOn('parents')
      .withOnDelete('cascade')
      .withDeferrable();
    let statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add constraint "users_parent_id_foreign" foreign key ("parent_id") references "parents" ("id") on delete cascade deferrable');
    blueprint = new Blueprint('users');
    blueprint.foreign('parent_id')
      .withReferences('id')
      .withOn('parents')
      .withOnDelete('cascade')
      .withDeferrable(false)
      .withInitiallyImmediate();
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add constraint "users_parent_id_foreign" foreign key ("parent_id") references "parents" ("id") on delete cascade not deferrable');
    blueprint = new Blueprint('users');
    blueprint.foreign('parent_id')
      .withReferences('id')
      .withOn('parents')
      .withOnDelete('cascade')
      .withDeferrable()
      .withInitiallyImmediate(false);
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add constraint "users_parent_id_foreign" foreign key ("parent_id") references "parents" ("id") on delete cascade deferrable initially deferred');
    blueprint = new Blueprint('users');
    blueprint.foreign('parent_id')
      .withReferences('id')
      .withOn('parents')
      .withOnDelete('cascade')
      .withDeferrable()
      .withNotValid();
    statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "users" add constraint "users_parent_id_foreign" foreign key ("parent_id") references "parents" ("id") on delete cascade deferrable not valid');
  });
  it('adding geometry', () => {
    const blueprint = new Blueprint('geo');
    blueprint.geometry('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "geo" add column "coordinates" geography(geometry, 4326) not null');
  });
  it('adding point', () => {
    const blueprint = new Blueprint('geo');
    blueprint.point('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "geo" add column "coordinates" geography(point, 4326) not null');
  });
  it('adding line string', () => {
    const blueprint = new Blueprint('geo');
    blueprint.lineString('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "geo" add column "coordinates" geography(linestring, 4326) not null');
  });
  it('adding polygon', () => {
    const blueprint = new Blueprint('geo');
    blueprint.polygon('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "geo" add column "coordinates" geography(polygon, 4326) not null');
  });
  it('adding geometry collection', () => {
    const blueprint = new Blueprint('geo');
    blueprint.geometryCollection('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "geo" add column "coordinates" geography(geometrycollection, 4326) not null');
  });
  it('adding multi point', () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiPoint('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "geo" add column "coordinates" geography(multipoint, 4326) not null');
  });
  it('adding multi line string', () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiLineString('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "geo" add column "coordinates" geography(multilinestring, 4326) not null');
  });
  it('adding multi polygon', () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiPolygon('coordinates');
    const statements = blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table "geo" add column "coordinates" geography(multipolygon, 4326) not null');
  });
  it('drop all tables escapes table names', () => {
    const statement = getGrammar().compileDropAllTables(['alpha', 'beta', 'gamma']);
    expect(statement).toBe('drop table "alpha","beta","gamma" cascade');
  });
  it('drop all views escapes table names', () => {
    const statement = getGrammar().compileDropAllViews(['alpha', 'beta', 'gamma']);
    expect(statement).toBe('drop view "alpha","beta","gamma" cascade');
  });
  it('drop all types escapes table names', () => {
    const statement = getGrammar().compileDropAllTypes(['alpha', 'beta', 'gamma']);
    expect(statement).toBe('drop type "alpha","beta","gamma" cascade');
  });
  // it('grammars are macroable', () => {
  //   getGrammar().macro('compileReplace', () => {
  //     return true;
  //   });
  //   var c = getGrammar().compileReplace();
  //   expect(c).toBeTruthy();
  // });
});

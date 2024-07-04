/* tslint:disable:max-line-length */
import { raw } from '../../src/query-builder/ast-factory';
import { Connection } from '../../src/connection';
import { WrappedConnection } from '../../src/connector/wrapped-connection';
import { ConnectionInterface } from '../../src/query-builder/connection-interface';
import { MysqlQueryGrammar } from '../../src/query-builder/grammar/mysql-query-grammar';
import { QueryGrammar } from '../../src/query-builder/grammar/query-grammar';
import { Processor } from '../../src/query-builder/processor';
import { QueryBuilder } from '../../src/query-builder/query-builder';
import { Blueprint } from '../../src/schema/blueprint';
import { ForeignIdColumnDefinition } from '../../src/schema/foreign-id-column-definition';
import { MysqlSchemaGrammar } from '../../src/schema/grammar/mysql-schema-grammar';
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

  recordsHaveBeenModified(): any {
  }

  selectFromWriteConnection(sql: string, values: any): any {
  }
}

function getConnection() {
  return new Conn();
}

function getGrammar() {
  return new MysqlSchemaGrammar();
}

describe('test database my sql schema grammar', () => {

  it('basic create table', async () => {
    let blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.increments('id');
    blueprint.string('email');
    let conn = getConnection();

    jest.spyOn(conn, 'getConfig').mockReturnValueOnce('utf8'); // charset
    jest.spyOn(conn, 'getConfig').mockReturnValueOnce('utf8_unicode_ci'); // collation
    jest.spyOn(conn, 'getConfig').mockReturnValueOnce(null); // engine

    let statements = await blueprint.toSql(conn, getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) not null) default character set utf8 collate \'utf8_unicode_ci\'');
    blueprint = new Blueprint('users');
    blueprint.increments('id');
    blueprint.string('email');
    conn = getConnection();

    jest.spyOn(conn, 'getConfig').mockReturnValueOnce(null);
    statements = await blueprint.toSql(conn, getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `id` int unsigned not null auto_increment primary key, add `email` varchar(255) not null');
  });

  it('engine create table', async () => {
    let blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.increments('id');
    blueprint.string('email');
    blueprint.engine = 'InnoDB';
    let conn         = getConnection();

    jest.spyOn(conn, 'getConfig').mockReturnValueOnce('utf8'); // charset
    jest.spyOn(conn, 'getConfig').mockReturnValueOnce('utf8_unicode_ci'); // collation

    let statements = await blueprint.toSql(conn, getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) not null) default character set utf8 collate \'utf8_unicode_ci\' engine = InnoDB');
    blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.increments('id');
    blueprint.string('email');
    conn = getConnection();

    jest.spyOn(conn, 'getConfig').mockReturnValueOnce('utf8'); // charset
    jest.spyOn(conn, 'getConfig').mockReturnValueOnce('utf8_unicode_ci'); // collation
    jest.spyOn(conn, 'getConfig').mockReturnValueOnce('InnoDB'); // engine

    statements = await blueprint.toSql(conn, getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) not null) default character set utf8 collate \'utf8_unicode_ci\' engine = InnoDB');
  });

  it('charset collation create table', async () => {
    let blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.increments('id');
    blueprint.string('email');
    blueprint.charset   = 'utf8mb4';
    blueprint.collation = 'utf8mb4_unicode_ci';
    let conn            = getConnection();
    jest.spyOn(conn, 'getConfig').mockReturnValueOnce(null); // engine
    let statements = await blueprint.toSql(conn, getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) not null) default character set utf8mb4 collate \'utf8mb4_unicode_ci\'');
    blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.increments('id');
    blueprint.string('email').withCharset('utf8mb4').withCollation('utf8mb4_unicode_ci');
    conn = getConnection();

    jest.spyOn(conn, 'getConfig').mockReturnValueOnce('utf8'); // charset
    jest.spyOn(conn, 'getConfig').mockReturnValueOnce('utf8_unicode_ci'); // collation
    jest.spyOn(conn, 'getConfig').mockReturnValueOnce(null); // engine

    statements = await blueprint.toSql(conn, getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) character set utf8mb4 collate \'utf8mb4_unicode_ci\' not null) default character set utf8 collate \'utf8_unicode_ci\'');
  });

  it('basic create table with prefix', async () => {
    const blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.increments('id');
    blueprint.string('email');
    const grammar = getGrammar();
    grammar.setTablePrefix('prefix_');
    const conn = getConnection();
    jest.spyOn(conn, 'getConfig').mockReturnValueOnce(null);
    const statements = await blueprint.toSql(conn, grammar);
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create table `prefix_users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) not null)');
  });

  it('create temporary table', async () => {
    const blueprint = new Blueprint('users');
    blueprint.create();
    blueprint.temporary();
    blueprint.increments('id');
    blueprint.string('email');
    const conn = getConnection();
    jest.spyOn(conn, 'getConfig').mockReturnValueOnce(null);
    const statements = await blueprint.toSql(conn, getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'create temporary table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) not null)');
  });

  it('drop table', async () => {
    const blueprint = new Blueprint('users');
    blueprint.drop();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop table `users`');
  });

  it('drop table if exists', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropIfExists();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('drop table if exists `users`');
  });

  it('drop column', async () => {
    let blueprint = new Blueprint('users');
    blueprint.dropColumn('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` drop `foo`');
    blueprint = new Blueprint('users');
    blueprint.dropColumn(['foo', 'bar']);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` drop `foo`, drop `bar`');
    blueprint = new Blueprint('users');
    blueprint.dropColumn('foo', 'bar');
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` drop `foo`, drop `bar`');
  });

  it('drop primary', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropPrimary();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` drop primary key');
  });

  it('drop unique', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropUnique('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` drop index `foo`');
  });

  it('drop index', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropIndex('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` drop index `foo`');
  });

  it('drop spatial index', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.dropSpatialIndex(['coordinates']);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `geo` drop index `geo_coordinates_spatialindex`');
  });

  it('drop foreign', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropForeign('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` drop foreign key `foo`');
  });

  it('drop timestamps', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropTimestamps();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` drop `created_at`, drop `updated_at`');
  });

  it('drop timestamps tz', async () => {
    const blueprint = new Blueprint('users');
    blueprint.dropTimestampsTz();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` drop `created_at`, drop `updated_at`');
  });

  it('drop morphs', async () => {
    const blueprint = new Blueprint('photos');
    blueprint.dropMorphs('imageable');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(2);
    expect(statements[0]).toBe(
      'alter table `photos` drop index `photos_imageable_type_imageable_id_index`');
    expect(statements[1]).toBe('alter table `photos` drop `imageable_type`, drop `imageable_id`');
  });

  it('rename table', async () => {
    const blueprint = new Blueprint('users');
    blueprint.rename('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('rename table `users` to `foo`');
  });

  it('rename index', async () => {
    const blueprint = new Blueprint('users');
    blueprint.renameIndex('foo', 'bar');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` rename index `foo` to `bar`');
  });

  it('adding primary key', async () => {
    const blueprint = new Blueprint('users');
    blueprint.primary(['foo'], 'bar');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add primary key (`foo`)');
  });

  it('adding primary key with algorithm', async () => {
    const blueprint = new Blueprint('users');
    blueprint.primary(['foo'], 'bar', 'hash');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add primary key using hash(`foo`)');
  });

  it('adding unique key', async () => {
    const blueprint = new Blueprint('users');
    blueprint.unique(['foo'], 'bar');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add unique `bar`(`foo`)');
  });

  it('adding index', async () => {
    const blueprint = new Blueprint('users');
    blueprint.index(['foo', 'bar'], 'baz');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add index `baz`(`foo`, `bar`)');
  });

  it('adding index with algorithm', async () => {
    const blueprint = new Blueprint('users');
    blueprint.index(['foo', 'bar'], 'baz', 'hash');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add index `baz` using hash(`foo`, `bar`)');
  });

  it('adding spatial index', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.spatialIndex(['coordinates']);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `geo` add spatial index `geo_coordinates_spatialindex`(`coordinates`)');
  });

  it('adding fluent spatial index', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.point('coordinates').withSpatialIndex();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(2);
    expect(statements[1]).toBe(
      'alter table `geo` add spatial index `geo_coordinates_spatialindex`(`coordinates`)');
  });

  it('adding raw index', async () => {
    const blueprint = new Blueprint('users');
    blueprint.rawIndex('(function(column))', 'raw_index');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add index `raw_index`((function(column)))');
  });

  it('adding foreign key', async () => {
    let blueprint = new Blueprint('users');
    blueprint.foreign(['foo_id']).withReferences('id').withOn('orders');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add constraint `users_foo_id_foreign` foreign key (`foo_id`) references `orders` (`id`)');
    blueprint = new Blueprint('users');
    blueprint.foreign(['foo_id']).withReferences('id').withOn('orders').withCascadeOnDelete();
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add constraint `users_foo_id_foreign` foreign key (`foo_id`) references `orders` (`id`) on delete cascade');
  });

  it('adding incrementing id', async () => {
    const blueprint = new Blueprint('users');
    blueprint.increments('id');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `id` int unsigned not null auto_increment primary key');
  });

  it('adding small incrementing id', async () => {
    const blueprint = new Blueprint('users');
    blueprint.smallIncrements('id');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `id` smallint unsigned not null auto_increment primary key');
  });

  it('adding id', async () => {
    let blueprint = new Blueprint('users');
    blueprint.id();
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `id` bigint unsigned not null auto_increment primary key');
    blueprint = new Blueprint('users');
    blueprint.id('foo');
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `foo` bigint unsigned not null auto_increment primary key');
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
      'alter table `users` add `foo` bigint unsigned not null, add `company_id` bigint unsigned not null, add `laravel_idea_id` bigint unsigned not null, add `team_id` bigint unsigned not null, add `team_column_id` bigint unsigned not null',
      'alter table `users` add constraint `users_company_id_foreign` foreign key (`company_id`) references `companies` (`id`)',
      'alter table `users` add constraint `users_laravel_idea_id_foreign` foreign key (`laravel_idea_id`) references `laravel_ideas` (`id`)',
      'alter table `users` add constraint `users_team_id_foreign` foreign key (`team_id`) references `teams` (`id`)',
      'alter table `users` add constraint `users_team_column_id_foreign` foreign key (`team_column_id`) references `teams` (`id`)'
    ]);
  });

  it('adding big incrementing id', async () => {
    const blueprint = new Blueprint('users');
    blueprint.bigIncrements('id');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `id` bigint unsigned not null auto_increment primary key');
  });

  it('adding column in table first', async () => {
    const blueprint = new Blueprint('users');
    blueprint.string('name').withFirst();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `name` varchar(255) not null first');
  });

  it('adding column after another column', async () => {
    const blueprint = new Blueprint('users');
    blueprint.string('name').withAfter('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `name` varchar(255) not null after `foo`');
  });

  it('adding generated column', async () => {
    let blueprint = new Blueprint('products');
    blueprint.integer('price');
    blueprint.integer('discounted_virtual').withVirtualAs('price - 5');
    blueprint.integer('discounted_stored').withStoredAs('price - 5');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `products` add `price` int not null, add `discounted_virtual` int as (price - 5), add `discounted_stored` int as (price - 5) stored');
    blueprint = new Blueprint('products');
    blueprint.integer('price');
    blueprint.integer('discounted_virtual').withVirtualAs('price - 5').withNullable(false);
    blueprint.integer('discounted_stored').withStoredAs('price - 5').withNullable(false);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `products` add `price` int not null, add `discounted_virtual` int as (price - 5) not null, add `discounted_stored` int as (price - 5) stored not null');
  });

  it('adding generated column with charset', async () => {
    const blueprint = new Blueprint('links');
    blueprint.string('url', 2083).withCharset('ascii');
    blueprint.string('url_hash_virtual', 64).withVirtualAs('sha2(url, 256)').withCharset('ascii');
    blueprint.string('url_hash_stored', 64).withStoredAs('sha2(url, 256)').withCharset('ascii');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `links` add `url` varchar(2083) character set ascii not null, add `url_hash_virtual` varchar(64) character set ascii as (sha2(url, 256)), add `url_hash_stored` varchar(64) character set ascii as (sha2(url, 256)) stored');
  });

  it('adding string', async () => {
    let blueprint = new Blueprint('users');
    blueprint.string('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` varchar(255) not null');
    blueprint = new Blueprint('users');
    blueprint.string('foo', 100);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` varchar(100) not null');
    blueprint = new Blueprint('users');
    blueprint.string('foo', 100).withNullable().withDefault('bar');
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` varchar(100) null default \'bar\'');
    blueprint = new Blueprint('users');
    blueprint.string('foo', 100).withNullable().withDefault(raw('CURRENT TIMESTAMP'));
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `foo` varchar(100) null default CURRENT TIMESTAMP');
  });

  it('adding text', async () => {
    const blueprint = new Blueprint('users');
    blueprint.text('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` text not null');
  });

  it('adding big integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.bigInteger('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` bigint not null');
    blueprint = new Blueprint('users');
    blueprint.bigInteger('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `foo` bigint not null auto_increment primary key');
  });

  it('adding integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.integer('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` int not null');
    blueprint = new Blueprint('users');
    blueprint.integer('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `foo` int not null auto_increment primary key');
  });

  it('adding medium integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.mediumInteger('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` mediumint not null');
    blueprint = new Blueprint('users');
    blueprint.mediumInteger('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `foo` mediumint not null auto_increment primary key');
  });

  it('adding small integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.smallInteger('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` smallint not null');
    blueprint = new Blueprint('users');
    blueprint.smallInteger('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `foo` smallint not null auto_increment primary key');
  });

  it('adding tiny integer', async () => {
    let blueprint = new Blueprint('users');
    blueprint.tinyInteger('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` tinyint not null');
    blueprint = new Blueprint('users');
    blueprint.tinyInteger('foo', true);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `foo` tinyint not null auto_increment primary key');
  });

  it('adding float', async () => {
    const blueprint = new Blueprint('users');
    blueprint.float('foo', 5, 2);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` double(5, 2) not null');
  });

  it('adding double', async () => {
    const blueprint = new Blueprint('users');
    blueprint.double('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` double not null');
  });

  it('adding double specifying precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.double('foo', 15, 8);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` double(15, 8) not null');
  });

  it('adding decimal', async () => {
    const blueprint = new Blueprint('users');
    blueprint.decimal('foo', 5, 2);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` decimal(5, 2) not null');
  });

  it('adding boolean', async () => {
    const blueprint = new Blueprint('users');
    blueprint.boolean('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` tinyint(1) not null');
  });

  it('adding enum', async () => {
    const blueprint = new Blueprint('users');
    blueprint.enum('role', ['member', 'admin']);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `role` enum(\'member\', \'admin\') not null');
  });

  it('adding set', async () => {
    const blueprint = new Blueprint('users');
    blueprint.set('role', ['member', 'admin']);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `role` set(\'member\', \'admin\') not null');
  });

  it('adding json', async () => {
    const blueprint = new Blueprint('users');
    blueprint.json('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` json not null');
  });

  it('adding jsonb', async () => {
    const blueprint = new Blueprint('users');
    blueprint.jsonb('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` json not null');
  });

  it('adding date', async () => {
    const blueprint = new Blueprint('users');
    blueprint.date('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` date not null');
  });

  it('adding year', async () => {
    const blueprint = new Blueprint('users');
    blueprint.year('birth_year');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `birth_year` year not null');
  });

  it('adding date time', async () => {
    let blueprint = new Blueprint('users');
    blueprint.dateTime('foo');
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` datetime not null');
    blueprint = new Blueprint('users');
    blueprint.dateTime('foo', 1);
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` datetime(1) not null');
  });

  it('adding date time tz', async () => {
    let blueprint = new Blueprint('users');
    blueprint.dateTimeTz('foo', 1);
    let statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` datetime(1) not null');
    blueprint = new Blueprint('users');
    blueprint.dateTimeTz('foo');
    statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` datetime not null');
  });

  it('adding time', async () => {
    const blueprint = new Blueprint('users');
    blueprint.time('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `created_at` time not null');
  });

  it('adding time with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.time('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `created_at` time(1) not null');
  });

  it('adding time tz', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timeTz('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `created_at` time not null');
  });

  it('adding time tz with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timeTz('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `created_at` time(1) not null');
  });

  it('adding timestamp', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamp('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `created_at` timestamp not null');
  });

  it('adding timestamp with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamp('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `created_at` timestamp(1) not null');
  });

  it('adding timestamp with default', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamp('created_at').withDefault('2015-07-22 11:43:17');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `created_at` timestamp not null default \'2015-07-22 11:43:17\'');
  });

  it('adding timestamp with default current specifying precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamp('created_at', 1).withUseCurrent();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `created_at` timestamp(1) default CURRENT_TIMESTAMP(1) not null');
  });

  it('adding timestamp tz', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampTz('created_at');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `created_at` timestamp not null');
  });

  it('adding timestamp tz with precision', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampTz('created_at', 1);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `created_at` timestamp(1) not null');
  });

  it('adding time stamp tz with default', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampTz('created_at').withDefault('2015-07-22 11:43:17');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `created_at` timestamp not null default \'2015-07-22 11:43:17\'');
  });

  it('adding timestamps', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestamps();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `created_at` timestamp null, add `updated_at` timestamp null');
  });

  it('adding timestamps tz', async () => {
    const blueprint = new Blueprint('users');
    blueprint.timestampsTz();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `created_at` timestamp null, add `updated_at` timestamp null');
  });

  it('adding remember token', async () => {
    const blueprint = new Blueprint('users');
    blueprint.rememberToken();
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `remember_token` varchar(100) null');
  });

  it('adding binary', async () => {
    const blueprint = new Blueprint('users');
    blueprint.binary('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` blob not null');
  });

  it('adding uuid', async () => {
    const blueprint = new Blueprint('users');
    blueprint.uuid('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` char(36) not null');
  });

  it('adding foreign uuid', async () => {
    const blueprint   = new Blueprint('users');
    const foreignUuid = blueprint.foreignUuid('foo');
    blueprint.foreignUuid('company_id').withConstrained();
    blueprint.foreignUuid('laravel_idea_id').withConstrained();
    blueprint.foreignUuid('team_id').withReferences('id').withOn('teams');
    blueprint.foreignUuid('team_column_id').withConstrained('teams');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(foreignUuid).toBeInstanceOf(ForeignIdColumnDefinition);
    expect(statements).toEqual([
      'alter table `users` add `foo` char(36) not null, add `company_id` char(36) not null, add `laravel_idea_id` char(36) not null, add `team_id` char(36) not null, add `team_column_id` char(36) not null',
      'alter table `users` add constraint `users_company_id_foreign` foreign key (`company_id`) references `companies` (`id`)',
      'alter table `users` add constraint `users_laravel_idea_id_foreign` foreign key (`laravel_idea_id`) references `laravel_ideas` (`id`)',
      'alter table `users` add constraint `users_team_id_foreign` foreign key (`team_id`) references `teams` (`id`)',
      'alter table `users` add constraint `users_team_column_id_foreign` foreign key (`team_column_id`) references `teams` (`id`)'
    ]);
  });

  it('adding ip address', async () => {
    const blueprint = new Blueprint('users');
    blueprint.ipAddress('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` varchar(45) not null');
  });

  it('adding mac address', async () => {
    const blueprint = new Blueprint('users');
    blueprint.macAddress('foo');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `users` add `foo` varchar(17) not null');
  });

  it('adding geometry', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.geometry('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `geo` add `coordinates` geometry not null');
  });

  it('adding point', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.point('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `geo` add `coordinates` point not null');
  });

  it('adding point with srid', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.point('coordinates', 4326);
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `geo` add `coordinates` point not null srid 4326');
  });

  it('adding point with srid column', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.point('coordinates', 4326).withAfter('id');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `geo` add `coordinates` point not null srid 4326 after `id`');
  });

  it('adding line string', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.lineString('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `geo` add `coordinates` linestring not null');
  });

  it('adding polygon', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.polygon('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `geo` add `coordinates` polygon not null');
  });

  it('adding geometry collection', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.geometryCollection('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `geo` add `coordinates` geometrycollection not null');
  });

  it('adding multi point', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiPoint('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `geo` add `coordinates` multipoint not null');
  });

  it('adding multi line string', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiLineString('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `geo` add `coordinates` multilinestring not null');
  });

  it('adding multi polygon', async () => {
    const blueprint = new Blueprint('geo');
    blueprint.multiPolygon('coordinates');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe('alter table `geo` add `coordinates` multipolygon not null');
  });

  it('adding comment', async () => {
    const blueprint = new Blueprint('users');
    blueprint.string('foo').withComment('Escape \' when using words like it\'s');
    const statements = await blueprint.toSql(getConnection(), getGrammar());
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      'alter table `users` add `foo` varchar(255) not null comment \'Escape \\\' when using words like it\\\'s\'');
  });

  it('drop all tables', () => {
    const statement = getGrammar().compileDropAllTables(['alpha', 'beta', 'gamma']);
    expect(statement).toBe('drop table `alpha`,`beta`,`gamma`');
  });

  it('drop all views', () => {
    const statement = getGrammar().compileDropAllViews(['alpha', 'beta', 'gamma']);
    expect(statement).toBe('drop view `alpha`,`beta`,`gamma`');
  });
  //
  it('grammars are macroable', () => {
    //   getGrammar().macro('compileReplace', () => {
    //     return true;
    //   });
    //   let c = getGrammar().compileReplace();
    //   expect(c).toBeTruthy();
    // });
    //
  });

});

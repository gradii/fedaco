import { SchemaBuilder } from '@gradii/fedaco';
import { MysqlConnection } from '../src/connection/mysql-connection';
import { Connection } from '../src/connection';
import { Blueprint } from '../src/schema/blueprint';
import { MariadbSchemaGrammar } from '../src/schema/grammar/mariadb-schema-grammar';
import { MysqlSchemaGrammar } from '../src/schema/grammar/mysql-schema-grammar';
import { PostgresSchemaGrammar } from '../src/schema/grammar/postgres-schema-grammar';
import { SqlServerSchemaGrammar } from '../src/schema/grammar/sql-server-schema-grammar';
import { SqliteSchemaGrammar } from '../src/schema/grammar/sqlite-schema-grammar';

describe('test database schema blueprint', () => {
  it('index default names', () => {
    let blueprint = new Blueprint('users');
    blueprint.unique(['foo', 'bar']);
    let commands = blueprint.getCommands();
    expect(commands[0].index).toBe('users_foo_bar_unique');
    blueprint = new Blueprint('users');
    blueprint.index('foo');
    commands = blueprint.getCommands();
    expect(commands[0].index).toBe('users_foo_index');
    blueprint = new Blueprint('geo');
    blueprint.spatialIndex('coordinates');
    commands = blueprint.getCommands();
    expect(commands[0].index).toBe('geo_coordinates_spatialindex');
  });
  it('index default names when prefix supplied', () => {
    let blueprint = new Blueprint('users', null, 'prefix_');
    blueprint.unique(['foo', 'bar']);
    let commands = blueprint.getCommands();
    expect(commands[0].index).toBe('prefix_users_foo_bar_unique');
    blueprint = new Blueprint('users', null, 'prefix_');
    blueprint.index('foo');
    commands = blueprint.getCommands();
    expect(commands[0].index).toBe('prefix_users_foo_index');
    blueprint = new Blueprint('geo', null, 'prefix_');
    blueprint.spatialIndex('coordinates');
    commands = blueprint.getCommands();
    expect(commands[0].index).toBe('prefix_geo_coordinates_spatialindex');
  });
  it('drop index default names', () => {
    let blueprint = new Blueprint('users');
    blueprint.dropUnique(['foo', 'bar']);
    let commands = blueprint.getCommands();
    expect(commands[0].index).toBe('users_foo_bar_unique');
    blueprint = new Blueprint('users');
    blueprint.dropIndex(['foo']);
    commands = blueprint.getCommands();
    expect(commands[0].index).toBe('users_foo_index');
    blueprint = new Blueprint('geo');
    blueprint.dropSpatialIndex(['coordinates']);
    commands = blueprint.getCommands();
    expect(commands[0].index).toBe('geo_coordinates_spatialindex');
  });
  it('drop index default names when prefix supplied', () => {
    let blueprint = new Blueprint('users', null, 'prefix_');
    blueprint.dropUnique(['foo', 'bar']);
    let commands = blueprint.getCommands();
    expect(commands[0].index).toBe('prefix_users_foo_bar_unique');
    blueprint = new Blueprint('users', null, 'prefix_');
    blueprint.dropIndex(['foo']);
    commands = blueprint.getCommands();
    expect(commands[0].index).toBe('prefix_users_foo_index');
    blueprint = new Blueprint('geo', null, 'prefix_');
    blueprint.dropSpatialIndex(['coordinates']);
    commands = blueprint.getCommands();
    expect(commands[0].index).toBe('prefix_geo_coordinates_spatialindex');
  });
  it('default current date time', async () => {
    const getBlueprint = () => new Blueprint('users', (table: Blueprint) => {
      table.dateTime('created').withUseCurrent();
    });

    const connection = {} as Connection;
    let blueprint    = getBlueprint();
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual(
      ['alter table `users` add `created` datetime default CURRENT_TIMESTAMP not null']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new PostgresSchemaGrammar())).toEqual(
      ['alter table "users" add column "created" timestamp(0) without time zone not null default CURRENT_TIMESTAMP']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new SqliteSchemaGrammar())).toEqual(
      ['alter table "users" add column "created" datetime default CURRENT_TIMESTAMP not null']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new SqlServerSchemaGrammar())).toEqual(
      ['alter table "users" add "created" datetime default CURRENT_TIMESTAMP not null']);
  });
  it('default current timestamp', async () => {
    const getBlueprint = () => new Blueprint('users', table => {
      table.timestamp('created').withUseCurrent();
    });
    const connection   = {} as Connection;
    let blueprint      = getBlueprint();
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual(
      ['alter table `users` add `created` timestamp default CURRENT_TIMESTAMP not null']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new PostgresSchemaGrammar())).toEqual(
      ['alter table "users" add column "created" timestamp(0) without time zone not null default CURRENT_TIMESTAMP']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new SqliteSchemaGrammar())).toEqual(
      ['alter table "users" add column "created" datetime default CURRENT_TIMESTAMP not null']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new SqlServerSchemaGrammar())).toEqual(
      ['alter table "users" add "created" datetime default CURRENT_TIMESTAMP not null']);
  });
  it('remove column', async () => {
    const getBlueprint = () => new Blueprint('users', table => {
      table.string('foo');
      table.string('remove_this');
      table.removeColumn('remove_this');
    });
    const connection   = {} as Connection;
    const blueprint    = getBlueprint();
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual(
      ['alter table `users` add `foo` varchar(255) not null']);
  });
  it('rename column', async () => {
    const getBlueprint = () => new Blueprint('users', table => {
      table.renameColumn('foo', 'bar');
    });
    const connection   = {
      getServerVersion: () => {
        return '8.0.4';
      },
      isMaria         : () => {
        return false;
      }
    } as unknown as Connection;
    let blueprint      = getBlueprint();
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual(
      ['alter table `users` rename column `foo` to `bar`']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new PostgresSchemaGrammar())).toEqual(
      ['alter table "users" rename column "foo" to "bar"']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new SqliteSchemaGrammar())).toEqual(
      ['alter table "users" rename column "foo" to "bar"']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new SqlServerSchemaGrammar())).toEqual(
      ['sp_rename N\'"users"."foo"\', "bar", N\'COLUMN\'']);
  });
  it('native rename column on mysql 57', async () => {
    const blueprint  = new Blueprint('users', table => {
      table.renameColumn('name', 'title');
      table.renameColumn('id', 'key');
      table.renameColumn('generated', 'new_generated');
    });
    const connection = {
      getServerVersion: () => {
        return '5.7';
      },
      isMaria         : () => {
        return false;
      },
      getSchemaBuilder: () => {
        return {
          getColumns: () => {
            return [
              {
                'name'          : 'name',
                'type'          : 'varchar(255)',
                'type_name'     : 'varchar',
                'nullable'      : true,
                'collation'     : 'utf8mb4_unicode_ci',
                'default'       : 'foo',
                'comment'       : null,
                'auto_increment': false,
                'generation'    : null
              }, {
                'name'          : 'id',
                'type'          : 'bigint unsigned',
                'type_name'     : 'bigint',
                'nullable'      : false,
                'collation'     : null,
                'default'       : null,
                'comment'       : 'lorem ipsum',
                'auto_increment': true,
                'generation'    : null
              }, {
                'name'          : 'generated',
                'type'          : 'int',
                'type_name'     : 'int',
                'nullable'      : false,
                'collation'     : null,
                'default'       : null,
                'comment'       : null,
                'auto_increment': false,
                'generation'    : {
                  'type'      : 'stored',
                  'expression': 'expression'
                }
              }
            ] as any[];
          }
        };
      }
    } as unknown as Connection;
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual([
      'alter table `users` change `name` `title` varchar(255) collate \'utf8mb4_unicode_ci\' null default \'foo\'',
      'alter table `users` change `id` `key` bigint unsigned not null auto_increment primary key comment \'lorem ipsum\'',
      'alter table `users` change `generated` `new_generated` int as (expression) stored not null'
    ]);
  });
  it('native rename column on legacy maria db', async () => {
    const blueprint  = new Blueprint('users', table => {
      table.renameColumn('name', 'title');
      table.renameColumn('id', 'key');
      table.renameColumn('generated', 'new_generated');
      table.renameColumn('foo', 'bar');
    });
    const connection = {
      isMaria         : function () {
      },
      getServerVersion: function () {
      },
      getSchemaBuilder: function () {
        return {
          getColumns: function (): any[] {
            return [
              {
                'name'          : 'name',
                'type'          : 'varchar(255)',
                'type_name'     : 'varchar',
                'nullable'      : true,
                'collation'     : 'utf8mb4_unicode_ci',
                'default'       : 'foo',
                'comment'       : null,
                'auto_increment': false,
                'generation'    : null
              }, {
                'name'          : 'id',
                'type'          : 'bigint unsigned',
                'type_name'     : 'bigint',
                'nullable'      : false,
                'collation'     : null,
                'default'       : null,
                'comment'       : 'lorem ipsum',
                'auto_increment': true,
                'generation'    : null
              }, {
                'name'          : 'generated',
                'type'          : 'int',
                'type_name'     : 'int',
                'nullable'      : false,
                'collation'     : null,
                'default'       : null,
                'comment'       : null,
                'auto_increment': false,
                'generation'    : {
                  'type'      : 'stored',
                  'expression': 'expression'
                }
              }, {
                'name'          : 'foo',
                'type'          : 'int',
                'type_name'     : 'int',
                'nullable'      : true,
                'collation'     : null,
                'default'       : 'NULL',
                'comment'       : null,
                'auto_increment': false,
                'generation'    : null
              }
            ];
          }
        };
      }
    } as unknown as Connection;
    // @ts-ignore
    jest.spyOn(connection, 'isMaria').mockReturnValue(Promise.resolve(true));
    jest.spyOn(connection, 'getServerVersion').mockReturnValue(Promise.resolve('10.1.35'));
    expect(await blueprint.toSql(connection, new MariadbSchemaGrammar())).toEqual([
      'alter table `users` change `name` `title` varchar(255) collate \'utf8mb4_unicode_ci\' null default \'foo\'',
      'alter table `users` change `id` `key` bigint unsigned not null auto_increment primary key comment \'lorem ipsum\'',
      'alter table `users` change `generated` `new_generated` int as (expression) stored not null',
      'alter table `users` change `foo` `bar` int null default NULL'
    ]);
  });
  it('drop column', async () => {
    const getBlueprint = () => new Blueprint('users', table => {
      table.dropColumn('foo');
    });
    const connection   = {} as unknown as Connection;
    let blueprint      = getBlueprint();
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual(['alter table `users` drop `foo`']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new PostgresSchemaGrammar())).toEqual(
      ['alter table "users" drop column "foo"']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new SqliteSchemaGrammar())).toEqual(
      ['alter table "users" drop column "foo"']);
    blueprint = getBlueprint();
    expect((await blueprint.toSql(connection, new SqlServerSchemaGrammar()))[0]).toContain(
      'alter table "users" drop column "foo"');
  });

  it('default using id morph', async () => {
    const getBlueprint = () => new Blueprint('comments', table => {
      table.morphs('commentable');
    });
    const connection   = {} as unknown as Connection;
    const blueprint    = getBlueprint();
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual([
      'alter table `comments` add `commentable_type` varchar(255) not null, add `commentable_id` bigint unsigned not null',
      'alter table `comments` add index `comments_commentable_type_commentable_id_index`(`commentable_type`, `commentable_id`)'
    ]);
  });
  it('default using nullable id morph', async () => {
    const getBlueprint = () => new Blueprint('comments', table => {
      table.nullableMorphs('commentable');
    });
    const connection   = {} as unknown as Connection;
    const blueprint    = getBlueprint();
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual([
      'alter table `comments` add `commentable_type` varchar(255) null, add `commentable_id` bigint unsigned null',
      'alter table `comments` add index `comments_commentable_type_commentable_id_index`(`commentable_type`, `commentable_id`)'
    ]);
  });
  it('default using uuid morph', async () => {
    SchemaBuilder.defaultMorphKeyType('uuid');
    const getBlueprint = () => new Blueprint('comments', table => {
      table.morphs('commentable');
    });
    const connection   = {} as unknown as Connection;
    const blueprint    = getBlueprint();
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual([
      'alter table `comments` add `commentable_type` varchar(255) not null, add `commentable_id` char(36) not null',
      'alter table `comments` add index `comments_commentable_type_commentable_id_index`(`commentable_type`, `commentable_id`)'
    ]);
  });
  it('default using nullable uuid morph', async () => {
    SchemaBuilder.defaultMorphKeyType('uuid');
    const getBlueprint = () => new Blueprint('comments', table => {
      table.nullableMorphs('commentable');
    });
    const connection   = {} as unknown as Connection;
    const blueprint    = getBlueprint();
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual([
      'alter table `comments` add `commentable_type` varchar(255) null, add `commentable_id` char(36) null',
      'alter table `comments` add index `comments_commentable_type_commentable_id_index`(`commentable_type`, `commentable_id`)'
    ]);
  });
  it('default using ulid morph', async () => {
    SchemaBuilder.defaultMorphKeyType('uuid');
    const getBlueprint = () => new Blueprint('comments', table => {
      table.morphs('commentable');
    });
    const connection   = {} as unknown as Connection;
    const blueprint    = getBlueprint();
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual([
      'alter table `comments` add `commentable_type` varchar(255) not null, add `commentable_id` char(36) not null',
      'alter table `comments` add index `comments_commentable_type_commentable_id_index`(`commentable_type`, `commentable_id`)'
    ]);
  });
  it('default using nullable ulid morph', async () => {
    SchemaBuilder.defaultMorphKeyType('uuid');
    const getBlueprint = () => new Blueprint('comments', table => {
      table.nullableMorphs('commentable');
    });
    const connection   = {} as unknown as Connection;
    const blueprint    = getBlueprint();
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual([
      'alter table `comments` add `commentable_type` varchar(255) null, add `commentable_id` char(36) null',
      'alter table `comments` add index `comments_commentable_type_commentable_id_index`(`commentable_type`, `commentable_id`)'
    ]);
  });
  // it('generate relationship column with incremental model', async () => {
  //   const getBlueprint = () => new Blueprint('posts', table => {
  //     table.foreignIdFor('Illuminate\\Foundation\\Auth\\User');
  //   });
  //   const connection   = m.mock(Connection);
  //   const blueprint    = getBlueprint();
  //   expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual(
  //     ['alter table `posts` add `user_id` bigint unsigned not null']);
  // });
  // it('generate relationship column with uuid model', async () => {
  //   const getBlueprint = () => new Blueprint('posts', table => {
  //     table.foreignIdFor('EloquentModelUuidStub');
  //   });
  //   const connection   = m.mock(Connection);
  //   const blueprint    = getBlueprint();
  //   expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual(
  //     ['alter table `posts` add `eloquent_model_uuid_stub_id` char(36) not null']);
  // });
  // it('generate relationship column with ulid model', async () => {
  //   const getBlueprint = () => new Blueprint('posts', table => {
  //     table.foreignIdFor('EloquentModelUlidStub');
  //   });
  //   const connection   = m.mock(Connection);
  //   let blueprint      = getBlueprint();
  //   expect(await blueprint.toSql(connection, new PostgresSchemaGrammar())).toEqual(
  //     ['alter table "posts" add column "eloquent_model_ulid_stub_id" char(26) not null']);
  //   blueprint = getBlueprint();
  //   expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual(
  //     ['alter table `posts` add `eloquent_model_ulid_stub_id` char(26) not null']);
  // });
  // it('drop relationship column with incremental model', async () => {
  //   const getBlueprint = () => new Blueprint('posts', table => {
  //     table.dropForeignIdFor('Illuminate\\Foundation\\Auth\\User');
  //   });
  //   const connection   = m.mock(Connection);
  //   const blueprint    = getBlueprint();
  //   expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual(
  //     ['alter table `posts` drop foreign key `posts_user_id_foreign`']);
  // });
  // it('drop relationship column with uuid model', async () => {
  //   const getBlueprint = () => new Blueprint('posts', table => {
  //     table.dropForeignIdFor('EloquentModelUuidStub');
  //   });
  //   const connection   = m.mock(Connection);
  //   const blueprint    = getBlueprint();
  //   expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual(
  //     ['alter table `posts` drop foreign key `posts_eloquent_model_uuid_stub_id_foreign`']);
  // });
  // it('drop constrained relationship column with incremental model', () => {
  //   const getBlueprint = () => new Blueprint('posts', table => {
  //     table.dropConstrainedForeignIdFor('Illuminate\\Foundation\\Auth\\User');
  //   });
  //   const connection   = {} as unknown as Connection;
  //   const blueprint    = getBlueprint();
  //   expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual(
  //     ['alter table `posts` drop foreign key `posts_user_id_foreign`', 'alter table `posts` drop `user_id`']);
  // });
  // it('drop constrained relationship column with uuid model', async () => {
  //   const getBlueprint = () => new Blueprint('posts', table => {
  //     table.dropConstrainedForeignIdFor('EloquentModelUuidStub');
  //   });
  //   const connection   = m.mock(Connection);
  //   const blueprint    = getBlueprint();
  //   expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual([
  //     'alter table `posts` drop foreign key `posts_eloquent_model_uuid_stub_id_foreign`',
  //     'alter table `posts` drop `eloquent_model_uuid_stub_id`'
  //   ]);
  // });
  it('tiny text column', async () => {
    const getBlueprint = () => new Blueprint('posts', table => {
      table.tinyText('note');
    });
    const connection   = {} as unknown as Connection;
    let blueprint      = getBlueprint();
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual(
      ['alter table `posts` add `note` tinytext not null']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new SqliteSchemaGrammar())).toEqual(
      ['alter table "posts" add column "note" text not null']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new PostgresSchemaGrammar())).toEqual(
      ['alter table "posts" add column "note" varchar(255) not null']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new SqlServerSchemaGrammar())).toEqual(
      ['alter table "posts" add "note" nvarchar(255) not null']);
  });
  it('tiny text nullable column', async () => {
    const getBlueprint = () => new Blueprint('posts', table => {
      table.tinyText('note').withNullable();
    });
    const connection   = {} as unknown as Connection;
    let blueprint      = getBlueprint();
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual(
      ['alter table `posts` add `note` tinytext null']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new SqliteSchemaGrammar())).toEqual(
      ['alter table "posts" add column "note" text']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new PostgresSchemaGrammar())).toEqual(
      ['alter table "posts" add column "note" varchar(255) null']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new SqlServerSchemaGrammar())).toEqual(
      ['alter table "posts" add "note" nvarchar(255) null']);
  });
  it('table comment', async () => {
    const getBlueprint = () => new Blueprint('posts', table => {
      table.comment('Look at my comment, it is amazing');
    });
    const connection   = {} as unknown as Connection;
    let blueprint      = getBlueprint();
    expect(await blueprint.toSql(connection, new MysqlSchemaGrammar())).toEqual(
      ['alter table `posts` comment = \'Look at my comment, it is amazing\'']);
    blueprint = getBlueprint();
    expect(await blueprint.toSql(connection, new PostgresSchemaGrammar())).toEqual(
      ['comment on table "posts" is \'Look at my comment, it is amazing\'']);
  });
});

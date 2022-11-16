/* eslint-disable @typescript-eslint/ban-ts-comment */
import { isArray, isNumber } from '@gradii/nanofn';
import { format, formatISO, isSameDay, startOfSecond, subDays } from 'date-fns';
import { head } from 'ramda';
import { finalize, tap } from 'rxjs/operators';
import { ArrayColumn } from '../src/annotation/column/array.column';
import { Column } from '../src/annotation/column/column';
import { CreatedAtColumn } from '../src/annotation/column/created-at.column';
import { DatetimeColumn } from '../src/annotation/column/datetime.column';
import { PrimaryColumn } from '../src/annotation/column/primary.column';
import { UpdatedAtColumn } from '../src/annotation/column/updated-at.column';
import { BelongsToManyColumn } from '../src/annotation/relation-column/belongs-to-many.relation-column';
import { BelongsToColumn } from '../src/annotation/relation-column/belongs-to.relation-column';
import { HasManyColumn } from '../src/annotation/relation-column/has-many.relation-column';
import { HasOneColumn } from '../src/annotation/relation-column/has-one.relation-column';
import { MorphManyColumn } from '../src/annotation/relation-column/morph-many.relation-column';
import { MorphToColumn } from '../src/annotation/relation-column/morph-to.relation-column';
import { Table } from '../src/annotation/table/table';
import { DatabaseConfig } from '../src/database-config';
import { FedacoBuilder } from '../src/fedaco/fedaco-builder';
import { FedacoRelationListType, FedacoRelationType } from '../src/fedaco/fedaco-types';
import { Model } from '../src/fedaco/model';
import { BelongsToMany } from '../src/fedaco/relations/belongs-to-many';
import { HasMany } from '../src/fedaco/relations/has-many';
import { Pivot } from '../src/fedaco/relations/pivot';
import { Relation } from '../src/fedaco/relations/relation';
import { forwardRef } from '../src/query-builder/forward-ref';
import { JoinClauseBuilder } from '../src/query-builder/query-builder';
import { SchemaBuilder } from '../src/schema/schema-builder';
import { Post } from './fixtures/post.model';
import { User } from './fixtures/user.model';

import * as fs from 'fs';

function connection(connectionName = 'default') {
  return Model.getConnectionResolver().connection(connectionName);
}

function schema(connectionName = 'default'): SchemaBuilder {
  return connection(connectionName).getSchemaBuilder();
}

jest.setTimeout(100000);

async function createSchema() {
  await schema('default')
    .dropAllTables();
  await schema('second_connection')
    .dropAllTables();

  await schema('default')
    .create('test_orders', table => {
      table.increments('id');
      table.string('item_type');
      table.integer('item_id');
      table.timestamps();
    });
  await schema('default').create('with_json', table => {
    table.increments('id');
    table.text('json').withDefault(JSON.stringify([]));
  });
  await schema('second_connection').create('test_items', table => {
    table.increments('id');
    table.timestamps();
  });
  await schema('default').create('users_with_space_in_colum_name', table => {
    table.increments('id');
    table.string('name').withNullable();
    table.string('email_address');
    table.timestamps();
  });

  for (const name of ['default', 'second_connection']) {
    const index = ['default', 'second_connection'].indexOf(name);
    await schema(name).create('users', function (table) {
      table.increments('id');
      table.string('name').withNullable();
      table.string('email');
      table.timestamp('birthday', 6).withNullable();
      table.timestamps();
    });

    await schema(name).create('friends', function (table) {
      table.integer('user_id');
      table.integer('friend_id');
      table.integer('friend_level_id').withNullable();
    });

    await schema(name).create('posts', function (table) {
      table.increments('id');
      table.integer('user_id');
      table.integer('parent_id').withNullable();
      table.string('name');
      table.timestamps();
    });

    await schema(name).create('comments', function (table) {
      table.increments('id');
      table.integer('post_id');
      table.string('content');
      table.timestamps();
    });

    await schema(name).create('friend_levels', function (table) {
      table.increments('id');
      table.string('level');
      table.timestamps();
    });

    await schema(name).create('photos', function (table) {
      table.increments('id');
      table.morphs('imageable');
      table.string('name');
      table.timestamps();
    });

    await schema(name).create('soft_deleted_users', function (table) {
      table.increments('id');
      table.string('name').withNullable();
      table.string('email');
      table.timestamps();
      table.softDeletes();
    });

    await schema(name).create('tags', function (table) {
      table.increments('id');
      table.string('name');
      table.timestamps();
    });

    await schema(name).create('taggables', function (table) {
      table.integer('tag_id');
      table.morphs('taggable');
      table.string('taxonomy').withNullable();
    });

    await schema(name).create('non_incrementing_users', table => {
      table.string('name').withNullable();
    });

    await schema(name).create('non_incrementing_seconds', table => {
      table.string('name').withNullable();
    })

  }
}

const debug = true;
let db: DatabaseConfig;
describe('test database fedaco integration', () => {
  const random = Math.random().toString(36).substring(7);
  const files = {
    'default': `tmp/integration-${random}.sqlite`,
    'second' : `tmp/integration-second-${random}.sqlite`
  };
  beforeEach(async () => {
    // for (const it of Object.values(files)) {
    //   if (it !== ':memory:') {
    //     if (fs.existsSync(it)) {
    //       fs.unlinkSync(it);
    //     }
    //   }
    // }

    db = new DatabaseConfig();
    db.addConnection({
      'driver': 'sqlite',
      'database': files.default
      // 'database': ':memory:'
    });
    db.addConnection({
      'driver': 'sqlite',
      'database': files.second
      // 'database': ':memory:'
    }, 'second_connection');
    db.bootFedaco();
    db.setAsGlobal();
    if (debug) {
      await createSchema();
    }
  });

  afterEach(async () => {
    await fs.promises.writeFile(files.default, '');
    await fs.promises.writeFile(files.second, '');
  })

  afterAll(async () => {
    await fs.promises.unlink(files.default);
    await fs.promises.unlink(files.second);
  })

  // beforeEach(async () => {
  //   if (!debug) {
  //     await createSchema();
  //   } else {
  //     for (const it of ['test_orders', 'with_json', 'users_with_space_in_colum_name']) {
  //       await DatabaseConfig.table(it, undefined, 'default').truncate();
  //     }
  //     for (const it of ['test_items']) {
  //       await DatabaseConfig.table(it, undefined, 'second_connection').truncate();
  //     }
  //     for (const it of [
  //       'comments',
  //       'friend_levels',
  //       'friends',
  //       'non_incrementing_users',
  //       'non_incrementing_seconds',
  //       'photos',
  //       'posts',
  //       'soft_deleted_users',
  //       'taggables',
  //       'tags',
  //       'users',
  //     ]) {
  //       await DatabaseConfig.table(it, undefined, 'default').truncate();
  //       await DatabaseConfig.table(it, undefined, 'second_connection').truncate();
  //     }
  //   }
  // });

  it('basic create model', async () => {
    const model = await new FedacoTestUser().$newQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });

    expect(model.id).toBe(1);
    expect(model.email).toBe('linbolen@gradii.com');
    await model.$delete();
  });

  it('basic model retrieval', async () => {
    const factory = new FedacoTestUser();

    await factory.$newQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });

    await factory.$newQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });

    expect(await factory.$newQuery().count()).toEqual(2);
    expect(
      await factory.$newQuery().where('email', 'linbolen@gradii.com').doesntExist()).toBeFalsy();
    expect(
      await factory.$newQuery().where('email', 'mohamed@laravel.com').doesntExist()).toBeTruthy();
    let model: FedacoTestUser = await factory.$newQuery()
      .where('email', 'linbolen@gradii.com').first();
    expect(model.email).toBe('linbolen@gradii.com');
    expect(model.email !== undefined).toBeTruthy();
    const friends = await model.friends;
    expect(friends !== undefined).toBeTruthy();
    expect(friends).toEqual([]);
    model = await factory.$newQuery().find(1);
    expect(model).toBeInstanceOf(FedacoTestUser);
    expect(model.id).toEqual(1);
    model = await factory.$newQuery().find(2);
    expect(model).toBeInstanceOf(FedacoTestUser);
    expect(model.id).toEqual(2);
    const missing = await factory.$newQuery().find(3);
    expect(missing).toBeUndefined();
    let collection = await factory.$newQuery().find([]);
    expect(isArray(collection)).toBeTruthy();
    expect(collection.length).toBe(0);
    collection = await factory.$newQuery().find([1, 2, 3]);
    expect(isArray(collection)).toBeTruthy();
    expect(collection.length).toBe(2);
    const models = await factory.$newQuery().where('id', 1).get(); // .cursor();
    for (const m of models) {
      expect(m.id).toEqual(1);
      expect(m.$getConnectionName()).toBe('default');
    }
    // let records = DB.table('users').where('id', 1).cursor();
    // for (let record of records) {
    //   expect(record.id).toEqual(1);
    // }
    // let records = DB.cursor('select * from users where id = ?', [1]);
    // for (let record of records) {
    //   expect(record.id).toEqual(1);
    // }
  });

  it('basic model collection retrieval', async () => {
    await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    await FedacoTestUser.createQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });
    const models = await new FedacoTestUser().$newQuery().oldest('id').get();
    expect(models.length).toBe(2);
    expect(isArray(models)).toBeTruthy();
    expect(models[0]).toBeInstanceOf(FedacoTestUser);
    expect(models[1]).toBeInstanceOf(FedacoTestUser);
    expect(models[0].email).toBe('linbolen@gradii.com');
    expect(models[1].email).toBe('xsilen@gradii.com');
  });

  it('paginated model collection retrieval', async () => {
    await new FedacoTestUser().$newQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    await new FedacoTestUser().$newQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });
    await new FedacoTestUser().$newQuery().create({
      'id'   : 3,
      'email': 'foo@gmail.com'
    });
    // Paginator.currentPageResolver(() => {
    //   return 1;
    // });
    let models = await new FedacoTestUser().$newQuery()
      .oldest('id').paginate(1, 2);
    expect(models.items.length).toBe(2);
    expect(models.items[0]).toBeInstanceOf(FedacoTestUser);
    expect(models.items[1]).toBeInstanceOf(FedacoTestUser);
    expect(models.items[0].email).toBe('linbolen@gradii.com');
    expect(models.items[1].email).toBe('xsilen@gradii.com');
    // Paginator.currentPageResolver(() => {
    //   return 2;
    // });
    models = await new FedacoTestUser().$newQuery()
      .oldest('id').paginate(2, 2);
    expect(models.items.length).toBe(1);
    expect(models.items[0]).toBeInstanceOf(FedacoTestUser);
    expect(models.items[0].email).toBe('foo@gmail.com');
  });

  it('paginated model collection retrieval when no elements', async () => {
    // Paginator.currentPageResolver(() => {
    //   return 1;
    // });
    let models = await new FedacoTestUser().$newQuery().oldest('id').paginate(1, 2);
    expect(models.items.length).toBe(0);
    // expect(models).toInstanceOf(LengthAwarePaginator);
    // Paginator.currentPageResolver(() => {
    //   return 2;
    // });
    models = await new FedacoTestUser().$newQuery().oldest('id').paginate(2, 2);
    expect(models.items.length).toBe(0);
  });

  it('paginated model collection retrieval when no elements and default per page', async () => {
    const models = await new FedacoTestUser().$newQuery().oldest('id').paginate();
    expect(models.items.length).toBe(0);
    // expect(models).toInstanceOf(LengthAwarePaginator);
  });

  it('count for pagination with grouping', async () => {
    await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    await FedacoTestUser.createQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });
    await FedacoTestUser.createQuery().create({
      'id'   : 3,
      'email': 'foo@gmail.com'
    });
    await FedacoTestUser.createQuery().create({
      'id'   : 4,
      'email': 'foo@gmail.com'
    });
    const query = FedacoTestUser.createQuery().groupBy('email').getQuery();
    expect(await query.getCountForPagination()).toEqual(3);
  });

  it('count for pagination with grouping and sub selects', async () => {
    const user1 = await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    await FedacoTestUser.createQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });
    await FedacoTestUser.createQuery().create({
      'id'   : 3,
      'email': 'foo@gmail.com'
    });
    await FedacoTestUser.createQuery().create({
      'id'   : 4,
      'email': 'foo@gmail.com'
    });
    const friendsRelation = user1.$newRelation('friends') as BelongsToMany;
    await friendsRelation.create({
      'id'   : 5,
      'email': 'friend@gmail.com'
    });
    const query = await FedacoTestUser.createQuery().select({
      0              : 'id',
      'friends_count': await FedacoTestUser
        .createQuery()
        .whereColumn('friend_id', 'user_id')
        .count()
    }).groupBy('email').getQuery();
    expect(await query.getCountForPagination()).toEqual(4);
  });

  it('first or create', async () => {
    const user1 = await FedacoTestUser.createQuery().firstOrCreate({
      'email': 'linbolen@gradii.com'
    });
    expect(user1.email).toBe('linbolen@gradii.com');
    expect(user1.name).toBeUndefined();
    const user2 = await FedacoTestUser.createQuery().firstOrCreate({
      'email': 'linbolen@gradii.com'
    }, {
      'name': 'Taylor Otwell'
    });
    expect(user2.id).toEqual(user1.id);
    expect(user2.email).toBe('linbolen@gradii.com');
    expect(user2.name).toBeNull();
    const user3 = await FedacoTestUser.createQuery().firstOrCreate({
      'email': 'xsilen@gradii.com'
    }, {
      'name': 'Abigail Otwell'
    });
    expect(user1.id).not.toEqual(user3.id);
    expect(user3.email).toBe('xsilen@gradii.com');
    expect(user3.name).toBe('Abigail Otwell');
  });

  it('update or create', async () => {
    const user1 = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    const user2 = await FedacoTestUser.createQuery().updateOrCreate({
      'email': 'linbolen@gradii.com'
    }, {
      'name': 'Taylor Otwell'
    });
    expect(user2.id).toEqual(user1.id);
    expect(user2.email).toBe('linbolen@gradii.com');
    expect(user2.name).toBe('Taylor Otwell');
    const user3 = await FedacoTestUser.createQuery().updateOrCreate({
      'email': 'tony.stark@gradii.com'
    }, {
      'name': 'Mohamed Said'
    });
    expect(user3.name).toBe('Mohamed Said');
    expect(await FedacoTestUser.createQuery().count()).toBe(2);
  });

  it('update or create on different connection', async () => {
    await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    await FedacoTestUser.useConnection('second_connection').updateOrCreate({
      'email': 'linbolen@gradii.com'
    }, {
      'name': 'Taylor Otwell'
    });
    await FedacoTestUser.useConnection('second_connection').updateOrCreate({
      'email': 'tony.stark@gradii.com'
    }, {
      'name': 'Mohamed Said'
    });
    expect(await FedacoTestUser.createQuery().count()).toBe(1);
    expect(await FedacoTestUser.useConnection('second_connection').count()).toBe(2);
  });

  it('check and create methods on multi connections', async () => {
    await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    await FedacoTestUser.useConnection('second_connection')
      .find(
        FedacoTestUser.useConnection('second_connection').insert({
          'id'   : 2,
          'email': 'tony.stark@gradii.com'
        })
      );
    let user1 = await FedacoTestUser.useConnection('second_connection').findOrNew(1);
    let user2 = await FedacoTestUser.useConnection('second_connection').findOrNew(2);
    expect(user1._exists).toBeFalsy();
    expect(user2._exists).toBeTruthy();
    expect(user1.$getConnectionName()).toBe('second_connection');
    expect(user2.$getConnectionName()).toBe('second_connection');
    user1 = await FedacoTestUser.useConnection('second_connection').firstOrNew({
      'email': 'linbolen@gradii.com'
    });
    user2 = await FedacoTestUser.useConnection('second_connection').firstOrNew({
      'email': 'tony.stark@gradii.com'
    });
    expect(user1._exists).toBeFalsy();
    expect(user2._exists).toBeTruthy();
    expect(user1.$getConnectionName()).toBe('second_connection');
    expect(user2.$getConnectionName()).toBe('second_connection');
    expect(await FedacoTestUser.useConnection('second_connection').count()).toEqual(1);
    user1 = await FedacoTestUser.useConnection('second_connection').firstOrCreate({
      'email': 'linbolen@gradii.com'
    });
    user2 = await FedacoTestUser.useConnection('second_connection').firstOrCreate({
      'email': 'tony.stark@gradii.com'
    });
    expect(user1.$getConnectionName()).toBe('second_connection');
    expect(user2.$getConnectionName()).toBe('second_connection');
    expect(await FedacoTestUser.useConnection('second_connection').count()).toEqual(2);
  });

  it('creating model with empty attributes', async () => {
    const model = await FedacoTestNonIncrementing.createQuery().create({});
    expect(model._exists).toBeFalsy();
    expect(model._wasRecentlyCreated).toBeFalsy();
  });

  it('chunk by id with non incrementing key', async () => {
    await FedacoTestNonIncrementingSecond.createQuery().create({
      'name': ' First'
    });
    await FedacoTestNonIncrementingSecond.createQuery().create({
      'name': ' Second'
    });
    await FedacoTestNonIncrementingSecond.createQuery().create({
      'name': ' Third'
    });
    let i     = 0;
    const spy = jest.fn(({results: users, page}) => {
      if (!i) {
        expect(users[0].name).toBe(' First');
        expect(users[1].name).toBe(' Second');
      } else {
        expect(users[0].name).toBe(' Third');
      }
      i++;
    });
    await FedacoTestNonIncrementingSecond.createQuery()
      .chunkById(2, 'name')
      .pipe(
        finalize(() => {
          expect(i).toEqual(2);
        }),
        tap(spy)
      )
      .toPromise();

    expect(spy).toBeCalled();
  });

  it('chunk by id with non incrementing key test signal', async () => {
    await FedacoTestNonIncrementingSecond.createQuery().create({
      'name': ' First'
    });
    await FedacoTestNonIncrementingSecond.createQuery().create({
      'name': ' Second'
    });
    await FedacoTestNonIncrementingSecond.createQuery().create({
      'name': ' Third'
    });
    let i        = 0;
    const spy    = jest.fn(({results: users, page}) => {
      if (!i) {
        // uncomment me test run successful.
        // try to comment me then test should hang on! works as expect
        expect(users[0].name).toBe(' First');
        expect(users[1].name).toBe(' Second');
      } else {
        expect(users[0].name).toBe(' Third');
      }
      i++;
    });
    await FedacoTestNonIncrementingSecond.createQuery()
      .chunkById(2, 'name', undefined)
      .pipe(
        finalize(() => {
          expect(i).toEqual(2);
        }),
        tap(spy)
      )
      .toPromise();

    expect(spy).toBeCalled();
  });

  it('each by id with non incrementing key', async () => {
    await FedacoTestNonIncrementingSecond.createQuery().create({
      'name': ' First'
    });
    await FedacoTestNonIncrementingSecond.createQuery().create({
      'name': ' Second'
    });
    await FedacoTestNonIncrementingSecond.createQuery().create({
      'name': ' Third'
    });
    const users: any[] = [];
    await FedacoTestNonIncrementingSecond.createQuery()
      .eachById(2, 'name')
      .pipe(
        tap(({item: user, index: i}) => {
          users.push([user.name, i]);
        })
      ).toPromise();
    expect(users).toEqual([[' First', 0], [' Second', 1], [' Third', 2]]);
  });

  it('pluck', async () => {
    await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    await FedacoTestUser.createQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });
    const simple = await FedacoTestUser.createQuery()
      .oldest('id')
      .pluck('users.email');
    const keyed  = await FedacoTestUser.createQuery()
      .oldest('id')
      .pluck('users.email', 'users.id');
    expect(simple).toEqual(['linbolen@gradii.com', 'xsilen@gradii.com']);
    expect(keyed).toEqual({
      1: 'linbolen@gradii.com',
      2: 'xsilen@gradii.com'
    });
  });

  it('pluck with join', async () => {
    const user1 = await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    const user2 = await FedacoTestUser.createQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });
    await (user2.$newRelation('posts') as HasMany).create({
      'id'  : 1,
      'name': 'First post'
    });
    await (user1.$newRelation('posts') as HasMany).create({
      'id'  : 2,
      'name': 'Second post'
    });
    const query = FedacoTestUser.createQuery().join('posts', 'users.id', '=', 'posts.user_id');
    expect(await query.pluck('posts.name', 'posts.id')).toEqual({
      1: 'First post',
      2: 'Second post'
    });
    expect(await query.pluck('posts.name', 'users.id')).toEqual({
      2: 'First post',
      1: 'Second post'
    });
    expect(await query.pluck('posts.name', 'users.email AS user_email')).toEqual({
      'xsilen@gradii.com'  : 'First post',
      'linbolen@gradii.com': 'Second post'
    });
  });

  it('pluck with column name containing a space', async () => {
    await FedacoTestUserWithSpaceInColumnName.createQuery().create({
      'id'           : 1,
      'email_address': 'linbolen@gradii.com'
    });
    await FedacoTestUserWithSpaceInColumnName.createQuery().create({
      'id'           : 2,
      'email_address': 'xsilen@gradii.com'
    });
    const simple = await FedacoTestUserWithSpaceInColumnName.createQuery().oldest('id').pluck(
      'users_with_space_in_colum_name.email_address');
    const keyed  = await FedacoTestUserWithSpaceInColumnName.createQuery().oldest('id').pluck(
      'email_address',
      'id');
    expect(simple).toEqual(['linbolen@gradii.com', 'xsilen@gradii.com']);
    expect(keyed).toEqual({
      1: 'linbolen@gradii.com',
      2: 'xsilen@gradii.com'
    });
  });

  it('find or fail', async () => {
    await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    await FedacoTestUser.createQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });
    const single   = await FedacoTestUser.createQuery().findOrFail(1);
    const multiple = await FedacoTestUser.createQuery().findOrFail([1, 2]);
    expect(single).toBeInstanceOf(FedacoTestUser);
    expect(single.email).toBe('linbolen@gradii.com');
    expect(isArray(multiple)).toBeTruthy();
    expect(multiple[0]).toBeInstanceOf(FedacoTestUser);
    expect(multiple[1]).toBeInstanceOf(FedacoTestUser);
  });

  it('find or fail with single id throws model not found exception', async () => {
    await expect(async () => {
      await FedacoTestUser.createQuery().findOrFail(1);
    }).rejects.toThrowError(
      'ModelNotFoundException No query results for model [FedacoTestUser] 1');
  });

  it('find or fail with multiple ids throws model not found exception', async () => {
    await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    await expect(async () => {
      await FedacoTestUser.createQuery().findOrFail([1, 2]);
    }).rejects.toThrowError(
      'ModelNotFoundException No query results for model [FedacoTestUser] [1,2]');
  });

  // xit('find or fail with multiple ids using collection throws model not found exception', async () => {
  //   await FedacoTestUser.createQuery().create({
  //     'id'   : 1,
  //     'email': 'linbolen@gradii.com'
  //   });
  //   await expect(async () => {
  //     await FedacoTestUser.createQuery().findOrFail([1, 2]);
  //   }).rejects.toThrowError(
  //     'ModelNotFoundException No query results for model [FedacoTestUser] [1, 2]');
  // });

  it('one to one relationship', async () => {
    let user = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    await user.$newRelation('post').create({
      'name': 'First Post'
    });
    const post = await user.post;

    user = await post.user;
    expect((await user.post).name).not.toBeUndefined();
    expect(user).toBeInstanceOf(FedacoTestUser);
    expect(post).toBeInstanceOf(FedacoTestPost);
    expect(user.email).toBe('linbolen@gradii.com');
    expect(post.name).toBe('First Post');
  });

  it('isset loads in relationship if it isnt loaded already', async () => {
    const user = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    await user.$newRelation('post').create({
      'name': 'First Post'
    });
    expect((await user.post).name).not.toBeUndefined();
  });

  it('one to many relationship', async () => {
    const user = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    await (user.$newRelation('posts') as HasMany).create({
      'name': 'First Post'
    });
    await user.$newRelation('posts').create({
      'name': 'Second Post'
    });
    const posts = await user.posts;
    const post2 = await user.$newRelation('posts').where('name', 'Second Post').first();
    expect(isArray(posts)).toBeTruthy();
    expect(posts.length).toBe(2);
    expect(posts[0]).toBeInstanceOf(FedacoTestPost);
    expect(posts[1]).toBeInstanceOf(FedacoTestPost);
    expect(post2).toBeInstanceOf(FedacoTestPost);
    expect(post2.name).toBe('Second Post');
    expect(await post2.user).toBeInstanceOf(FedacoTestUser);
    expect((await post2.user).email).toBe('linbolen@gradii.com');
  });

  it('basic model hydration', async () => {
    let user = FedacoTestUser.initAttributes({
      'email': 'linbolen@gradii.com'
    });
    user.$setConnection('second_connection');
    await user.$save();
    user = FedacoTestUser.initAttributes({
      'email': 'xsilen@gradii.com'
    });
    user.$setConnection('second_connection');
    await user.$save();
    const models = await FedacoTestUser.useConnection('second_connection').fromQuery(
      'SELECT * FROM users WHERE email = ?', ['xsilen@gradii.com']);
    expect(isArray(models)).toBeTruthy();
    expect(models[0]).toBeInstanceOf(FedacoTestUser);
    expect(models[0].email).toBe('xsilen@gradii.com');
    expect(models[0].$getConnectionName()).toBe('second_connection');
    expect(models.length).toBe(1);
  });

  it('has on self referencing belongs to many relationship', async () => {
    const user = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    await user.$newRelation('friends').create({
      'email': 'xsilen@gradii.com'
    });
    expect((await user.friends)[0].id !== undefined).toBeTruthy();
    const results = await FedacoTestUser.createQuery().has('friends').get();
    expect(results.length).toBe(1);
    expect(head(results).email).toBe('linbolen@gradii.com');
  });

  it('where has on self referencing belongs to many relationship', async () => {
    const user = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    await user.$newRelation('friends').create({
      'email': 'xsilen@gradii.com'
    });
    const results: FedacoTestUser[] = await FedacoTestUser.createQuery()
      .whereHas('friends', (query: FedacoBuilder) => {
        query.where('email', 'xsilen@gradii.com');
      }).get();
    expect(results.length).toBe(1);
    expect(head(results).email).toBe('linbolen@gradii.com');
  });

  it('has on nested self referencing belongs to many relationship', async () => {
    const user   = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    const friend = await user.$newRelation('friends').create({
      'email': 'xsilen@gradii.com'
    });
    await friend.$newRelation('friends').create({
      'email': 'foo@gmail.com'
    });
    const results = await FedacoTestUser.createQuery().has('friends.friends').get();
    expect(results.length).toBe(1);
    expect(head(results).email).toBe('linbolen@gradii.com');
  });

  it('where has on nested self referencing belongs to many relationship', async () => {
    const user   = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    const friend = await user.$newRelation('friends').create({
      'email': 'xsilen@gradii.com'
    });
    await friend.$newRelation('friends').create({
      'email': 'foo@gmail.com'
    });
    const results: FedacoTestUser[] = await FedacoTestUser.createQuery()
      .whereHas('friends.friends', (query: FedacoBuilder) => {
        query.where('email', 'foo@gmail.com');
      }).get();
    expect(results.length).toBe(1);
    expect(head(results).email).toBe('linbolen@gradii.com');
  });

  it('has on self referencing belongs to many relationship with where pivot', async () => {
    const user = await FedacoTestUser.createQuery().create({
      id     : 1,
      'email': 'linbolen@gradii.com'
    });
    await user.$newRelation('friends').create({
      id     : 2,
      'email': 'xsilen@gradii.com'
    });
    const results = await FedacoTestUser.createQuery().has('friendsOne').get();
    expect(results.length).toBe(1);
    expect(head(results).email).toBe('linbolen@gradii.com');
  });

  it('has on nested self referencing belongs to many relationship with where pivot', async () => {
    const user   = await FedacoTestUser.createQuery().create({
      id     : 1,
      'email': 'linbolen@gradii.com'
    });
    const friend = await user.$newRelation('friends').create({
      id     : 2,
      'email': 'xsilen@gradii.com'
    });
    await friend.$newRelation('friends').create({
      id     : 3,
      'email': 'foo@gmail.com'
    });
    const results = await FedacoTestUser.createQuery().has('friendsOne.friendsTwo').get();
    expect(results.length).toBe(1);
    expect(head(results).email).toBe('linbolen@gradii.com');
  });

  it('has on self referencing belongs to relationship', async () => {
    const parentPost = await FedacoTestPost.createQuery().create({
      'name'   : 'Parent Post',
      'user_id': 1
    });
    await FedacoTestPost.createQuery().create({
      'name'     : 'Child Post',
      'parent_id': parentPost.id,
      'user_id'  : 2
    });
    const results = await FedacoTestPost.createQuery().has('parentPost').get();
    expect(results.length).toBe(1);
    expect(head(results).name).toBe('Child Post');
  });

  it('aggregated values of datetime field', async () => {
    await FedacoTestUser.createQuery().create({
      'id'        : 1,
      'email'     : 'test1@test.test',
      'created_at': '2021-08-10 09:21:00',
      'updated_at': new Date()
    });
    await FedacoTestUser.createQuery().create({
      'id'        : 2,
      'email'     : 'test2@test.test',
      'created_at': '2021-08-01 12:00:00',
      'updated_at': new Date()
    });
    expect(await FedacoTestUser.createQuery().max('created_at')).toBe('2021-08-10 09:21:00');
    expect(await FedacoTestUser.createQuery().min('created_at')).toBe('2021-08-01 12:00:00');
  });

  it('where has on self referencing belongs to relationship', async () => {
    const parentPost = await FedacoTestPost.createQuery().create({
      'name'   : 'Parent Post',
      'user_id': 1
    });
    await FedacoTestPost.createQuery().create({
      'name'     : 'Child Post',
      'parent_id': parentPost.id,
      'user_id'  : 2
    });
    const results: FedacoTestPost[] = await FedacoTestPost.createQuery().whereHas('parentPost',
      (query: FedacoBuilder) => {
        query.where('name', 'Parent Post');
      }).get();
    expect(results.length).toBe(1);
    expect(head(results).name).toBe('Child Post');
  });

  it('has on nested self referencing belongs to relationship', async () => {
    const grandParentPost = await FedacoTestPost.createQuery().create({
      'name'   : 'Grandparent Post',
      'user_id': 1
    });
    const parentPost      = await FedacoTestPost.createQuery().create({
      'name'     : 'Parent Post',
      'parent_id': grandParentPost.id,
      'user_id'  : 2
    });
    await FedacoTestPost.createQuery().create({
      'name'     : 'Child Post',
      'parent_id': parentPost.id,
      'user_id'  : 3
    });
    // @ts-ignore
    const results: FedacoTestPost[] = await FedacoTestPost.createQuery().has(
      'parentPost.parentPost').get();
    expect(results.length).toBe(1);
    expect(head(results).name).toBe('Child Post');
  });

  it('where has on nested self referencing belongs to relationship', async () => {
    const grandParentPost = await FedacoTestPost.createQuery().create({
      'name'   : 'Grandparent Post',
      'user_id': 1
    });
    const parentPost      = await FedacoTestPost.createQuery().create({
      'name'     : 'Parent Post',
      'parent_id': grandParentPost.id,
      'user_id'  : 2
    });
    await FedacoTestPost.createQuery().create({
      'name'     : 'Child Post',
      'parent_id': parentPost.id,
      'user_id'  : 3
    });
    // @ts-ignore
    const results: FedacoTestPost[] = await FedacoTestPost.createQuery().whereHas(
      'parentPost.parentPost', (query: FedacoBuilder) => {
        query.where('name', 'Grandparent Post');
      }).get();
    expect(results.length).toBe(1);
    expect(head(results).name).toBe('Child Post');
  });

  it('has on self referencing has many relationship', async () => {
    const parentPost = await FedacoTestPost.createQuery().create({
      'name'   : 'Parent Post',
      'user_id': 1
    });
    await FedacoTestPost.createQuery().create({
      'name'     : 'Child Post',
      'parent_id': parentPost.id,
      'user_id'  : 2
    });
    // @ts-ignore
    const results: FedacoTestPost[] = await FedacoTestPost.createQuery().has(
      'childPosts').get();
    expect(results.length).toBe(1);
    expect(head(results).name).toBe('Parent Post');
  });

  it('where has on self referencing has many relationship', async () => {
    const parentPost = await FedacoTestPost.createQuery().create({
      'name'   : 'Parent Post',
      'user_id': 1
    });
    await FedacoTestPost.createQuery().create({
      'name'     : 'Child Post',
      'parent_id': parentPost.id,
      'user_id'  : 2
    });
    // @ts-ignore
    const results: FedacoTestPost[] = await FedacoTestPost.createQuery().whereHas('childPosts',
      (query: FedacoBuilder) => {
        query.where('name', 'Child Post');
      }).get();
    expect(results.length).toBe(1);
    expect(head(results).name).toBe('Parent Post');
  });

  it('has on nested self referencing has many relationship', async () => {
    const grandParentPost = await FedacoTestPost.createQuery().create({
      'name'   : 'Grandparent Post',
      'user_id': 1
    });
    const parentPost      = await FedacoTestPost.createQuery().create({
      'name'     : 'Parent Post',
      'parent_id': grandParentPost.id,
      'user_id'  : 2
    });
    await FedacoTestPost.createQuery().create({
      'name'     : 'Child Post',
      'parent_id': parentPost.id,
      'user_id'  : 3
    });
    // @ts-ignore
    const results: FedacoTestPost[] = await FedacoTestPost.createQuery().has(
      'childPosts.childPosts').get();
    expect(results.length).toBe(1);
    expect(head(results).name).toBe('Grandparent Post');
  });

  it('where has on nested self referencing has many relationship', async () => {
    const grandParentPost = await FedacoTestPost.createQuery().create({
      'name'   : 'Grandparent Post',
      'user_id': 1
    });
    const parentPost      = await FedacoTestPost.createQuery().create({
      'name'     : 'Parent Post',
      'parent_id': grandParentPost.id,
      'user_id'  : 2
    });
    await FedacoTestPost.createQuery().create({
      'name'     : 'Child Post',
      'parent_id': parentPost.id,
      'user_id'  : 3
    });
    // @ts-ignore
    const results: FedacoTestPost[] = await FedacoTestPost.createQuery().whereHas(
      'childPosts.childPosts', (query: FedacoBuilder) => {
        query.where('name', 'Child Post');
      }).get();

    expect(results.length).toBe(1);
    expect(head(results).name).toBe('Grandparent Post');
  });

  it('has with non where bindings', async () => {
    const user = await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    await (
      await user.$newRelation('posts').create({
        'name': 'Post 2'
      })
    ).$newRelation('photos').create({
      'name': 'photo.jpg'
    });
    const query                   = await FedacoTestUser.createQuery().has('postWithPhotos');
    const {result: sql, bindings} = query.toSql();
    const bindingsCount           = bindings.length;
    const questionMarksCount      = sql.match(/\?/g)?.length || 0;
    expect(bindingsCount).toEqual(questionMarksCount);
  });

  it('has on morph to relationship', async () => {
    await expect(async () => {
      await FedacoTestUser.createQuery().has('imageable').get();
    }).rejects.toThrowError(
      `the relation [imageable] can't acquired. try to define a relation like\n@HasManyColumn()\npublic readonly imageable;\n`);
  });

  it('belongs to many relationship models are properly hydrated over chunked request', async () => {
    const user                  = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    const friend                = await user.$newRelation('friends').create({
      'email': 'xsilen@gradii.com'
    });
    const user1: FedacoTestUser = await FedacoTestUser.createQuery().first();
    await user1.$newRelation('friends')
      .chunk(2)
      .pipe(
        tap(({results: friends}) => {
          expect(friends.length).toBe(1);
          expect(head(friends).email).toBe('xsilen@gradii.com');
          expect(head(friends).$getRelation('pivot').$getAttribute('user_id')).toBe(user.id);
          expect(head(friends).$getRelation('pivot').$getAttribute('friend_id')).toBe(friend.id);
        })
      ).toPromise();
  });

  it('belongs to many relationship models are properly hydrated over each request', async () => {
    const user   = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    const friend = await user.$newRelation('friends').create({
      'email': 'xsilen@gradii.com'
    });
    await (await FedacoTestUser.createQuery().first()).$newRelation('friends')
      .each()
      .pipe(
        tap(({item: result, index}) => {
          expect(result.email).toBe('xsilen@gradii.com');
          expect(result.$getRelation('pivot').$getAttribute('user_id')).toBe(user.id);
          expect(result.$getRelation('pivot').$getAttribute('friend_id')).toBe(friend.id);
        })
      ).toPromise();
  });

  xit('belongs to many relationship models are properly hydrated over cursor request', async () => {
    const user   = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    const friend = await user.$newRelation('friends').create({
      'email': 'xsilen@gradii.com'
    });
    for (const result of await (await FedacoTestUser.createQuery().first()).$newRelation(
      'friends').get()) {
      expect(result.email).toBe('xsilen@gradii.com');
      expect(result.getRelation('pivot').getAttribute('user_id')).toEqual(user.id);
      expect(result.getRelation('pivot').getAttribute('friend_id')).toEqual(friend.id);
    }
  });

  it('basic has many eager loading', async () => {
    // @ts-ignore
    let user: FedacoTestUser = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    await user.$newRelation('posts').create({
      'name': 'First Post'
    });
    user = await FedacoTestUser.createQuery()
      .with('posts')
      .where('email', 'linbolen@gradii.com')
      .first();
    expect(head(await user.posts).name).toBe('First Post');
    const post = await FedacoTestPost.createQuery().with('user').where('name',
      'First Post').get();
    expect((head(post).user as FedacoTestUser).email).toBe('linbolen@gradii.com');
  });

  it('basic nested self referencing has many eager loading', async () => {
    // @ts-ignore
    let user: FedacoTestUser   = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    // @ts-ignore
    const post: FedacoTestPost = await user.$newRelation('posts').create({
      'name': 'First Post'
    });
    await post.$newRelation('childPosts').create({
      'name'   : 'Child Post',
      'user_id': user.id
    });
    user = await FedacoTestUser.createQuery().with('posts.childPosts').where('email',
      'linbolen@gradii.com').first();
    expect(head(await user.posts)).not.toBeNull();
    expect(head(await user.posts).name).toBe('First Post');
    expect(head(await head(await user.posts).childPosts)).not.toBeNull();
    expect(head(await head(await user.posts).childPosts as any[]).name).toBe('Child Post');
    // @ts-ignore
    const posts: FedacoTestPost[] = await FedacoTestPost.createQuery()
      .with('parentPost.user')
      .where('name', 'Child Post').get();
    expect((await head(posts).parentPost)).not.toBeNull();
    expect((await head(posts).parentPost).user).not.toBeNull();
    expect((await head(posts).parentPost).user.email).toBe('linbolen@gradii.com');
  });

  it('basic morph many relationship', async () => {
    const user = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    await user.$newRelation('photos').create({
      'name': 'Avatar 1'
    });
    await user.$newRelation('photos').create({
      'name': 'Avatar 2'
    });
    const post = await user.$newRelation('posts').create({
      'name': 'First Post'
    });
    await post.$newRelation('photos').create({
      'name': 'Hero 1'
    });
    await post.$newRelation('photos').create({
      'name': 'Hero 2'
    });

    const userPhotos = await user.photos;
    expect(userPhotos.length).toBe(2);

    expect(isArray(await user.photos)).toBe(true);
    expect((await user.photos)[0]).toBeInstanceOf(FedacoTestPhoto);
    expect(isArray(await post.photos)).toBe(true);
    expect((await post.photos)[0]).toBeInstanceOf(FedacoTestPhoto);
    expect((await user.photos).length).toBe(2);
    expect((await post.photos).length).toBe(2);
    expect((await user.photos)[0].name).toBe('Avatar 1');
    expect((await user.photos)[1].name).toBe('Avatar 2');
    expect((await post.photos)[0].name).toBe('Hero 1');
    expect((await post.photos)[1].name).toBe('Hero 2');
    const photos = await FedacoTestPhoto.createQuery().orderBy('name').get();
    expect(isArray(photos)).toBeTruthy();
    expect(photos.length).toBe(4);
    expect(await photos[0].imageable).toBeInstanceOf(FedacoTestUser);
    expect(await photos[2].imageable).toBeInstanceOf(FedacoTestPost);
    expect((await photos[1].imageable).email).toBe('linbolen@gradii.com');
    expect((await photos[3].imageable).name).toBe('First Post');
  });

  it('morph map is used for creating and fetching through relation', async () => {
    Relation.morphMap({
      'user': FedacoTestUser,
      'post': FedacoTestPost
    });
    const user = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    await user.$newRelation('photos').create({
      'name': 'Avatar 1'
    });
    await user.$newRelation('photos').create({
      'name': 'Avatar 2'
    });
    const post: FedacoTestPost = await user.$newRelation('posts').create<FedacoTestPost>({
      'name': 'First Post'
    });
    await post.$newRelation('photos').create({
      'name': 'Hero 1'
    });
    await post.$newRelation('photos').create({
      'name': 'Hero 2'
    });
    expect(isArray(await user.photos)).toBeTruthy();
    expect((await user.photos)[0]).toBeInstanceOf(FedacoTestPhoto);
    expect(isArray(await post.photos)).toBeTruthy();
    expect((await post.photos)[0]).toBeInstanceOf(FedacoTestPhoto);
    expect((await user.photos).length).toBe(2);
    expect((await post.photos).length).toBe(2);
    expect((await user.photos)[0].name).toBe('Avatar 1');
    expect((await user.photos)[1].name).toBe('Avatar 2');
    expect((await post.photos)[0].name).toBe('Hero 1');
    expect((await post.photos)[1].name).toBe('Hero 2');
    expect((await user.photos)[0].$getAttribute('imageable_type')).toBe('user');
    expect((await user.photos)[1].$getAttribute('imageable_type')).toBe('user');
    expect((await post.photos)[0].$getAttribute('imageable_type')).toBe('post');
    expect((await post.photos)[1].$getAttribute('imageable_type')).toBe('post');
  });

  it('morph map is used when fetching parent', async () => {
    Relation.morphMap({
      'user': FedacoTestUser,
      'post': FedacoTestPost
    });
    const user = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    await user.$newRelation('photos').create({
      'name': 'Avatar 1'
    });
    const photo = await FedacoTestPhoto.createQuery().first();
    expect(photo.$getAttribute('imageable_type')).toBe('user');
    expect(await photo.imageable).toBeInstanceOf(FedacoTestUser);
  });

  it('morph map is merged by default', () => {
    const map1 = {
      'user': FedacoTestUser
    };
    const map2 = {
      'post': FedacoTestPost
    };
    Relation.morphMap(map1);
    Relation.morphMap(map2);
    expect(Relation.morphMap()).toEqual({...map1, ...map2});
  });

  it('morph map overwrites current map', () => {
    const map1 = {
      'user': FedacoTestUser
    };
    const map2 = {
      'post': FedacoTestPost
    };
    Relation.morphMap(map1, false);
    expect(Relation.morphMap()).toEqual(map1);
    Relation.morphMap(map2, false);
    expect(Relation.morphMap()).toEqual(map2);
  });

  it('empty morph to relationship', async () => {
    const photo = new FedacoTestPhoto();
    expect(await photo.imageable).toBeNull();
  });

  it('save or fail', async () => {
    const date = '1970-01-01';
    const post = FedacoTestPost.initAttributes({
      'user_id'   : 1,
      'name'      : 'Post',
      'created_at': date,
      'updated_at': date
    });
    expect(await post.$saveOrFail()).toBeTruthy();
    expect(await FedacoTestPost.createQuery().count()).toEqual(1);
  });

  it('saving json fields', async () => {
    const model = await FedacoTestWithJSON.createQuery().create<FedacoTestWithJSON>({
      'json': {
        'x': 0
      }
    });
    expect(model.json).toEqual({
      'x': 0
    });
    model.$fillable(['json->y', 'json->a->b']);
    await model.$update({
      'json->y': '1'
    });
    expect('json->y' in model.$toArray()).toBeFalsy();
    expect(model.json).toEqual({
      'x': 0,
      'y': '1'
    });
    await model.$update({
      'json->a->b': '3'
    });
    expect('json->a->b' in model.$toArray()).toBeFalsy();
    expect(model.json).toEqual({
      'x': 0,
      'y': '1',
      'a': {
        'b': '3'
      }
    });
  });

  it('save or fail with duplicated entry', async () => {
    const date = '1970-01-01';
    await FedacoTestPost.createQuery().create({
      'id'        : 1,
      'user_id'   : 1,
      'name'      : 'Post',
      'created_at': date,
      'updated_at': date
    });
    const post = FedacoTestPost.initAttributes({
      'id'        : 1,
      'user_id'   : 1,
      'name'      : 'Post',
      'created_at': date,
      'updated_at': date
    });

    await expect(async () => {
      await post.$saveOrFail();
    }).rejects.toThrowErrorMatchingSnapshot('SQLITE_CONSTRAINT');
  });

  it('multi inserts with different values', async () => {
    const date   = '1970-01-01';
    const result = await FedacoTestPost.createQuery().insert([
      {
        'user_id'   : 1,
        'name'      : 'Post',
        'created_at': date,
        'updated_at': date
      }, {
        'user_id'   : 2,
        'name'      : 'Post',
        'created_at': date,
        'updated_at': date
      }
    ]);
    expect(result).toBeTruthy();
    expect(await FedacoTestPost.createQuery().count()).toEqual(2);
  });

  it('multi inserts with same values', async () => {
    const date   = '1970-01-01';
    const result = await FedacoTestPost.createQuery().insert([
      {
        'user_id'   : 1,
        'name'      : 'Post',
        'created_at': date,
        'updated_at': date
      }, {
        'user_id'   : 1,
        'name'      : 'Post',
        'created_at': date,
        'updated_at': date
      }
    ]);
    expect(result).toBeTruthy();
    expect(await FedacoTestPost.createQuery().count()).toEqual(2);
  });

//   it('nested transactions', () => {
//     let user = FedacoTestUser.create({
//       'email': 'taylor@laravel.com'
//     });
//     this.connection().transaction(() => {
//       try {
//         this.connection().transaction(() => {
//           user.email = 'otwell@laravel.com';
//           user.save();
//           throw new Exception();
//         });
//       } catch (e: Exception) {
//       }
//       let user = FedacoTestUser.first();
//       this.assertSame('taylor@laravel.com', user.email);
//     });
//   });

//   it('nested transactions using save or fail will succeed', () => {
//     let user = FedacoTestUser.create({
//       'email': 'taylor@laravel.com'
//     });
//     this.connection().transaction(() => {
//       try {
//         user.email = 'otwell@laravel.com';
//         user.saveOrFail();
//       } catch (e: Exception) {
//       }
//       let user = FedacoTestUser.first();
//       this.assertSame('otwell@laravel.com', user.email);
//       this.assertEquals(1, user.id);
//     });
//   });
//   it('nested transactions using save or fail will fails', () => {
//     let user = FedacoTestUser.create({
//       'email': 'taylor@laravel.com'
//     });
//     this.connection().transaction(() => {
//       try {
//         user.id    = 'invalid';
//         user.email = 'otwell@laravel.com';
//         user.saveOrFail();
//       } catch (e: Exception) {
//       }
//       let user = FedacoTestUser.first();
//       this.assertSame('taylor@laravel.com', user.email);
//       this.assertEquals(1, user.id);
//     });
//   });

  it('to array includes default formatted timestamps', () => {
    const model = new FedacoTestUser();
    model.$setRawAttributes({
      'created_at': '2012-12-04',
      'updated_at': '2012-12-05'
    });
    const array = model.$toArray();
    expect(array['created_at']).toBe('2012-12-04T00:00:00+08:00');
    expect(array['updated_at']).toBe('2012-12-05T00:00:00+08:00');
  });

  it('to array includes custom formatted timestamps', () => {
    const model = new FedacoTestUserWithCustomDateSerialization();
    model.$setRawAttributes({
      'created_at': '2012-12-04',
      'updated_at': '2012-12-05'
    });
    const array = model.$toArray();
    expect(array['created_at']).toBe('04-12-12');
    expect(array['updated_at']).toBe('05-12-12');
  });

  it('incrementing primary keys are cast to integers by default', async () => {
    await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    const user = await FedacoTestUser.createQuery().first();
    expect(isNumber(user.id)).toBeTruthy();
  });

  // it('default incrementing primary key integer cast can be overwritten', async () => {
  //   await FedacoTestUserWithStringCastId.createQuery().create({
  //     'email': 'linbolen@gradii.com'
  //   });
  //   const user = await FedacoTestUserWithStringCastId.createQuery().first();
  //   expect(isString(user.id)).toBeTruthy();
  // });

  it('relations are preloaded in global scope', async () => {
    const user = await FedacoTestUserWithGlobalScope.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    await user.$newRelation('posts').create({
      'name': 'My Post'
    });
    const result: FedacoTestUserWithGlobalScope = await FedacoTestUserWithGlobalScope.createQuery().first();
    expect(Object.keys(result.$getRelations())).toHaveLength(1);
  });

  it('model ignored by global scope can be refreshed', async () => {
    const user = await FedacoTestUserWithOmittingGlobalScope.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    expect(await user.$fresh()).not.toBeNull();
  });

//   it('global scope can be removed by other global scope', () => {
//     let user = FedacoTestUserWithGlobalScopeRemovingOtherScope.create({
//       'id'   : 1,
//       'email': 'linbolen@gradii.com'
//     });
//     user.delete();
//     expect(FedacoTestUserWithGlobalScopeRemovingOtherScope.find(user.id)).toNotNull();
//   });

  it('for page before id correctly paginates', async () => {
    await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    await FedacoTestUser.createQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });
    let results = await FedacoTestUser.createQuery().forPageBeforeId(15, 2);
    expect(results).toBeInstanceOf(FedacoBuilder);
    expect((await results.first()).id).toEqual(1);
    results = await FedacoTestUser.createQuery().orderBy('id', 'desc').forPageBeforeId(15, 2);
    expect(results).toBeInstanceOf(FedacoBuilder);
    expect((await results.first()).id).toEqual(1);
  });

  it('for page after id correctly paginates', async () => {
    await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    await FedacoTestUser.createQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });
    let results = await FedacoTestUser.createQuery().forPageAfterId(15, 1);
    expect(results).toBeInstanceOf(FedacoBuilder);
    expect((await results.first()).id).toEqual(2);
    results = FedacoTestUser.createQuery().orderBy('id', 'desc').forPageAfterId(15, 1);
    expect(results).toBeInstanceOf(FedacoBuilder);
    expect((await results.first()).id).toEqual(2);
  });

  it('morph to relations across database connections', async () => {
    let item = null;
    await FedacoTestItem.createQuery().create({
      'id': 1
    });
    await FedacoTestOrder.createQuery().create({
      'id'       : 1,
      'item_type': 'FedacoTestItem',
      'item_id'  : 1
    });
    try {
      const order = await FedacoTestOrder.createQuery().first();
      item        = order.item;
    } catch (e) {
      console.log(e);
    }
    expect(item).toBeInstanceOf(FedacoTestItem);
  });

  it('eager loaded morph to relations on another database connection', async () => {
    await FedacoTestPost.createQuery().create({
      'id'     : 1,
      'name'   : 'Default Connection Post',
      'user_id': 1
    });
    await FedacoTestPhoto.createQuery().create({
      'id'            : 1,
      'imageable_type': 'post',
      'imageable_id'  : 1,
      'name'          : 'Photo'
    });
    await FedacoTestPost.useConnection('second_connection').create({
      'id'     : 1,
      'name'   : 'Second Connection Post',
      'user_id': 1
    });
    await FedacoTestPhoto.useConnection('second_connection').create({
      'id'            : 1,
      'imageable_type': 'post',
      'imageable_id'  : 1,
      'name'          : 'Photo'
    });
    const defaultConnectionPost = (
      await FedacoTestPhoto.createQuery().with('imageable').first()
    ).imageable as FedacoTestPhoto;
    const secondConnectionPost  = (
      await FedacoTestPhoto.useConnection('second_connection').with('imageable').first()
    ).imageable;
    expect('Default Connection Post').toEqual((defaultConnectionPost).name);
    expect('Second Connection Post').toEqual(secondConnectionPost.name);
  });

  it('belongs to many custom pivot', async () => {
    const john = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
      'id'   : 1,
      'name' : 'John Doe',
      'email': 'johndoe@example.com'
    });
    const jane = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
      'id'   : 2,
      'name' : 'Jane Doe',
      'email': 'janedoe@example.com'
    });
    const jack = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
      'id'   : 3,
      'name' : 'Jack Doe',
      'email': 'jackdoe@example.com'
    });
    const jule = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
      'id'   : 4,
      'name' : 'Jule Doe',
      'email': 'juledoe@example.com'
    });
    await FedacoTestFriendLevel.createQuery().create({
      'id'   : 1,
      'level': 'acquaintance'
    });
    await FedacoTestFriendLevel.createQuery().create({
      'id'   : 2,
      'level': 'friend'
    });
    await FedacoTestFriendLevel.createQuery().create({
      'id'   : 3,
      'level': 'bff'
    });
    await john.$newRelation('friends').attach(jane, {
      'friend_level_id': 1
    });
    await john.$newRelation('friends').attach(jack, {
      'friend_level_id': 2
    });
    await john.$newRelation('friends').attach(jule, {
      'friend_level_id': 3
    });

    const johnWithFriends = await FedacoTestUserWithCustomFriendPivot.createQuery()
      .with('friends').find(1);
    expect((johnWithFriends.friends as FedacoTestUser[]).length).toBe(3);
    expect(await (await (johnWithFriends.friends as FedacoTestUser[]).find(
      it => it.id === 3).$getAttribute(
      'pivot').level).level).toBe('friend');
    expect(
      (await (johnWithFriends.friends as FedacoTestUser[]).find(it => it.id === 4).$getAttribute(
        'pivot').friend).name).toBe('Jule Doe');
  });

  it('is after retrieving the same model', async () => {
    const saved     = await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    const retrieved = await FedacoTestUser.createQuery().find(1);
    expect(saved.$is(retrieved)).toBeTruthy();
  });

  it('fresh method on model', async () => {
    const now                        = new Date();
    const nowSerialized              = formatISO(startOfSecond(now));
    const nowWithFractionsSerialized = JSON.parse(JSON.stringify(now));
    // Carbon.setTestNow(now);
    const storedUser1                = await FedacoTestUser.createQuery().create({
      'id'      : 1,
      'email'   : 'linbolen@gradii.com',
      'birthday': now
    });
    await storedUser1.$newQuery().update({
      'email': 'dev@mathieutu.ovh',
      'name' : 'Mathieu TUDISCO'
    });
    const freshStoredUser1 = await storedUser1.$fresh();
    const storedUser2      = await FedacoTestUser.createQuery().create({
      'id'      : 2,
      'email'   : 'linbolen@gradii.com',
      'birthday': now
    });
    await storedUser2.$newQuery().update({
      'email': 'dev@mathieutu.ovh'
    });
    const freshStoredUser2   = await storedUser2.$fresh();
    const notStoredUser      = FedacoTestUser.initAttributes({
      'id'      : 3,
      'email'   : 'linbolen@gradii.com',
      'birthday': now
    });
    const freshNotStoredUser = await notStoredUser.$fresh();
    expect(JSON.parse(JSON.stringify(storedUser1.$toArray()))).toEqual({
      'id'        : 1,
      'email'     : 'linbolen@gradii.com',
      'birthday'  : formatISO(new Date(nowWithFractionsSerialized)),
      'created_at': nowSerialized,
      'updated_at': nowSerialized
    });
    expect(JSON.parse(JSON.stringify(freshStoredUser1.$toArray()))).toEqual({
      'id'        : 1,
      'name'      : 'Mathieu TUDISCO',
      'email'     : 'dev@mathieutu.ovh',
      'birthday'  : formatISO(new Date(nowWithFractionsSerialized)),
      'created_at': nowSerialized,
      'updated_at': nowSerialized
    });
    expect(storedUser1).toBeInstanceOf(FedacoTestUser);
    expect(JSON.parse(JSON.stringify(storedUser2.$toArray()))).toEqual({
      'id'        : 2,
      'email'     : 'linbolen@gradii.com',
      'birthday'  : formatISO(new Date(nowWithFractionsSerialized)),
      'created_at': nowSerialized,
      'updated_at': nowSerialized
    });
    expect(JSON.parse(JSON.stringify(freshStoredUser2.$toArray()))).toEqual({
      'id'        : 2,
      'name'      : null,
      'email'     : 'dev@mathieutu.ovh',
      'birthday'  : formatISO(new Date(nowWithFractionsSerialized)),
      'created_at': nowSerialized,
      'updated_at': nowSerialized
    });
    expect(storedUser2).toBeInstanceOf(FedacoTestUser);
    expect(JSON.parse(JSON.stringify(notStoredUser.$toArray()))).toEqual({
      'id'      : 3,
      'email'   : 'linbolen@gradii.com',
      'birthday': formatISO(new Date(nowWithFractionsSerialized)),
    });
    expect(freshNotStoredUser).toBeUndefined();
  });
//   it('fresh method on collection', () => {
//     FedacoTestUser.create({
//       'id'   : 1,
//       'email': 'linbolen@gradii.com'
//     });
//     FedacoTestUser.create({
//       'id'   : 2,
//       'email': 'linbolen@gradii.com'
//     });
//     let users = FedacoTestUser.all().add(new FedacoTestUser({
//       'id'   : 3,
//       'email': 'linbolen@gradii.com'
//     }));
//     FedacoTestUser.find(1).update({
//       'name': 'Mathieu TUDISCO'
//     });
//     FedacoTestUser.find(2).update({
//       'email': 'dev@mathieutu.ovh'
//     });
//     expect(users.fresh()).toEqual(users.map.fresh());
//     let users = new Collection();
//     expect(users.fresh()).toEqual(users.map.fresh());
//   });

  it('timestamps using default date format', () => {
    const model = new FedacoTestUser();
    model.$setDateFormat('yyyy-MM-dd HH:mm:ss');
    model.$setRawAttributes({
      'created_at': '2017-11-14 08:23:19'
    });
    expect(model.$fromDateTime(model.$getAttribute('created_at'))).toBe('2017-11-14 08:23:19');
  });

  it('timestamps using default sql server date format', () => {
    const model = new FedacoTestUser();
    model.$setDateFormat('yyyy-MM-dd HH:mm:ss.SSS');
    model.$setRawAttributes({
      'created_at': '2017-11-14 08:23:19.000',
      'updated_at': '2017-11-14 08:23:19.734'
    });
    expect(model.$fromDateTime(model.$getAttribute('created_at'))).toBe('2017-11-14 08:23:19.000');
    expect(model.$fromDateTime(model.$getAttribute('updated_at'))).toBe('2017-11-14 08:23:19.734');
  });

  it('timestamps using custom date format', () => {
    const model = new FedacoTestUser();
    model.$setDateFormat('yyyy-MM-dd HH:mm:ss.SSSS');
    model.$setRawAttributes({
      'created_at': '2017-11-14 08:23:19.0000',
      'updated_at': '2017-11-14 08:23:19.7348'
    });
    expect(model.$fromDateTime(model.$getAttribute('created_at'))).toBe('2017-11-14 08:23:19.0000');
    expect(model.$fromDateTime(model.$getAttribute('updated_at'))).toBe('2017-11-14 08:23:19.7340');
  });

  it('timestamps using old sql server date format', () => {
    const model = new FedacoTestUser();
    model.$setDateFormat('yyyy-MM-dd HH:mm:ss.000');
    model.$setRawAttributes({
      'created_at': '2017-11-14 08:23:19.000'
    });
    expect(model.$fromDateTime(model.$getAttribute('created_at'))).toBe('2017-11-14 08:23:19.000');
  });

  it('timestamps using old sql server date format fallback to default parsing', () => {
    const model = new FedacoTestUser();
    model.$setDateFormat('yyyy-MM-dd HH:mm:ss.SSS');
    model.$setRawAttributes({
      'updated_at': '2017-11-14 08:23:19.734'
    });
    const date = model.$getAttribute('updated_at');

    // the date should not contains the precision
    expect(format(date, 'yyyy-MM-dd HH:mm:ss.SSS')).toBe('2017-11-14 08:23:19.734');
    // the format should trims it
    expect(model.$fromDateTime(date)).toBe('2017-11-14 08:23:19.734');
  });

  it('updating child model touches parent', async () => {
    const before = new Date();
    const user   = await FedacoTouchingUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    const post   = await FedacoTouchingPost.createQuery().create({
      'name'   : 'Parent Post',
      'user_id': 1
    });
    expect(isSameDay(before, user.updated_at)).toBeTruthy();
    expect(isSameDay(before, post.updated_at)).toBeTruthy();

    await post.$update({
      'name': 'Updated'
    });

    const old = subDays(new Date(), 3);

    await FedacoTouchingUser.createQuery().update({
      updated_at: format(old, 'yyyy-MM-dd HH:mm:ss')
    });

    await FedacoTouchingPost.createQuery().update({
      updated_at: format(old, 'yyyy-MM-dd HH:mm:ss')
    });

    expect(
      isSameDay(old, (await FedacoTouchingUser.createQuery().first()).updated_at)).toBeTruthy();
    expect(
      isSameDay(old, (await FedacoTouchingPost.createQuery().first()).updated_at)).toBeTruthy();

    // It is not touching model own timestamps.
    expect(isSameDay(old, (await post.$fresh()).updated_at)).toBeTruthy();

    // It is not touching models related timestamps.
    expect(isSameDay(old, (await user.$fresh()).updated_at)).toBeTruthy();
    // Carbon.setTestNow(before);
  });

  it('multi level touching works', async () => {
    const before = new Date();
    const user   = await FedacoTouchingUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
    const post   = await FedacoTouchingPost.createQuery().create({
      'id'     : 1,
      'name'   : 'Parent Post',
      'user_id': 1
    });
    expect(isSameDay(before, user.updated_at)).toBeTruthy();
    expect(isSameDay(before, post.updated_at)).toBeTruthy();

    const old = subDays(new Date(), 3);

    await FedacoTouchingUser.createQuery().update({
      updated_at: format(old, 'yyyy-MM-dd HH:mm:ss')
    });

    await FedacoTouchingPost.createQuery().update({
      updated_at: format(old, 'yyyy-MM-dd HH:mm:ss')
    });

    // Carbon.setTestNow(future = before.copy().addDays(3));
    await FedacoTouchingComment.createQuery().create({
      'content': 'Comment content',
      'post_id': 1
    });

    // It will touch models related timestamps.
    expect(isSameDay(before, (await post.$fresh()).updated_at)).toBeTruthy();
    // It will touch models related timestamps.
    expect(isSameDay(before, (await user.$fresh()).updated_at)).toBeTruthy();
    // Carbon.setTestNow(before);
  });

//   it('deleting child model touches parent timestamps', () => {
//     let before = Carbon.now();
//     let user   = FedacoTouchingUser.initAttributes({
//       'id'   : 1,
//       'email': 'linbolen@gradii.com'
//     });
//     let post   = FedacoTouchingPost.initAttributes({
//       'name'   : 'Parent Post',
//       'user_id': 1
//     });
//     expect(before.isSameDay(user.updated_at)).toBeTruthy();
//     expect(before.isSameDay(post.updated_at)).toBeTruthy();
//     Carbon.setTestNow(future = before.copy().addDays(3));
//     post.delete();
//     expect('It is not touching models related timestamps.').toBeTruthy(
//       future.isSameDay(user.fresh().updated_at));
//     Carbon.setTestNow(before);
//   });
//   it('touching child model updates parents timestamps', () => {
//     let before = Carbon.now();
//     let user   = FedacoTouchingUser.initAttributes({
//       'id'   : 1,
//       'email': 'linbolen@gradii.com'
//     });
//     let post   = FedacoTouchingPost.initAttributes({
//       'id'     : 1,
//       'name'   : 'Parent Post',
//       'user_id': 1
//     });
//     expect(before.isSameDay(user.updated_at)).toBeTruthy();
//     expect(before.isSameDay(post.updated_at)).toBeTruthy();
//     Carbon.setTestNow(future = before.copy().addDays(3));
//     post.touch();
//     expect('It is not touching model own timestamps.').toBeTruthy(
//       future.isSameDay(post.fresh().updated_at));
//     expect('It is not touching models related timestamps.').toBeTruthy(
//       future.isSameDay(user.fresh().updated_at));
//     Carbon.setTestNow(before);
//   });
//   it('touching child model respects parent no touching', () => {
//     let before = Carbon.now();
//     let user   = FedacoTouchingUser.initAttributes({
//       'id'   : 1,
//       'email': 'linbolen@gradii.com'
//     });
//     let post   = FedacoTouchingPost.initAttributes({
//       'id'     : 1,
//       'name'   : 'Parent Post',
//       'user_id': 1
//     });
//     expect(before.isSameDay(user.updated_at)).toBeTruthy();
//     expect(before.isSameDay(post.updated_at)).toBeTruthy();
//     Carbon.setTestNow(future = before.copy().addDays(3));
//     FedacoTouchingUser.withoutTouching(() => {
//       post.touch();
//     });
//     expect('It is not touching model own timestamps in withoutTouching scope.').toBeTruthy(
//       future.isSameDay(post.fresh().updated_at));
//     expect(
//       'It is touching model own timestamps in withoutTouching scope, when it should not.').toBeTruthy(
//       before.isSameDay(user.fresh().updated_at));
//     Carbon.setTestNow(before);
//   });
//   it('updating child post respects no touching definition', () => {
//     let before = Carbon.now();
//     let user   = FedacoTouchingUser.initAttributes({
//       'id'   : 1,
//       'email': 'linbolen@gradii.com'
//     });
//     let post   = FedacoTouchingPost.initAttributes({
//       'name'   : 'Parent Post',
//       'user_id': 1
//     });
//     expect(before.isSameDay(user.updated_at)).toBeTruthy();
//     expect(before.isSameDay(post.updated_at)).toBeTruthy();
//     Carbon.setTestNow(future = before.copy().addDays(3));
//     FedacoTouchingUser.withoutTouching(() => {
//       post.update({
//         'name': 'Updated'
//       });
//     });
//     expect('It is not touching model own timestamps when it should.').toBeTruthy(
//       future.isSameDay(post.fresh().updated_at));
//     expect('It is touching models relationships when it should be disabled.').toBeTruthy(
//       before.isSameDay(user.fresh().updated_at));
//     Carbon.setTestNow(before);
//   });
//   it('updating model in the disabled scope touches its own timestamps', () => {
//     let before = Carbon.now();
//     let user   = FedacoTouchingUser.initAttributes({
//       'id'   : 1,
//       'email': 'linbolen@gradii.com'
//     });
//     let post   = FedacoTouchingPost.initAttributes({
//       'name'   : 'Parent Post',
//       'user_id': 1
//     });
//     expect(before.isSameDay(user.updated_at)).toBeTruthy();
//     expect(before.isSameDay(post.updated_at)).toBeTruthy();
//     Carbon.setTestNow(future = before.copy().addDays(3));
//     Model.withoutTouching(() => {
//       post.update({
//         'name': 'Updated'
//       });
//     });
//     expect('It is touching models when it should be disabled.').toBeTruthy(
//       future.isSameDay(post.fresh().updated_at));
//     expect('It is touching models when it should be disabled.').toBeTruthy(
//       before.isSameDay(user.fresh().updated_at));
//     Carbon.setTestNow(before);
//   });
//   it('deleting child model respects the no touching rule', () => {
//     let before = Carbon.now();
//     let user   = FedacoTouchingUser.initAttributes({
//       'id'   : 1,
//       'email': 'linbolen@gradii.com'
//     });
//     let post   = FedacoTouchingPost.initAttributes({
//       'name'   : 'Parent Post',
//       'user_id': 1
//     });
//     expect(before.isSameDay(user.updated_at)).toBeTruthy();
//     expect(before.isSameDay(post.updated_at)).toBeTruthy();
//     Carbon.setTestNow(future = before.copy().addDays(3));
//     FedacoTouchingUser.withoutTouching(() => {
//       post.delete();
//     });
//     expect('It is touching models when it should be disabled.').toBeTruthy(
//       before.isSameDay(user.fresh().updated_at));
//     Carbon.setTestNow(before);
//   });
//   it('respected multi level touching chain', () => {
//     let before = Carbon.now();
//     let user   = FedacoTouchingUser.initAttributes({
//       'id'   : 1,
//       'email': 'linbolen@gradii.com'
//     });
//     let post   = FedacoTouchingPost.initAttributes({
//       'id'     : 1,
//       'name'   : 'Parent Post',
//       'user_id': 1
//     });
//     expect(before.isSameDay(user.updated_at)).toBeTruthy();
//     expect(before.isSameDay(post.updated_at)).toBeTruthy();
//     Carbon.setTestNow(future = before.copy().addDays(3));
//     FedacoTouchingUser.withoutTouching(() => {
//       FedacoTouchingComment.initAttributes({
//         'content': 'Comment content',
//         'post_id': 1
//       });
//     });
//     expect('It is touching models when it should be disabled.').toBeTruthy(
//       future.isSameDay(post.fresh().updated_at));
//     expect('It is touching models when it should be disabled.').toBeTruthy(
//       before.isSameDay(user.fresh().updated_at));
//     Carbon.setTestNow(before);
//   });
//   it('touches great parent even when parent is in no touch scope', () => {
//     let before = Carbon.now();
//     let user   = FedacoTouchingUser.initAttributes({
//       'id'   : 1,
//       'email': 'linbolen@gradii.com'
//     });
//     let post   = FedacoTouchingPost.initAttributes({
//       'id'     : 1,
//       'name'   : 'Parent Post',
//       'user_id': 1
//     });
//     expect(before.isSameDay(user.updated_at)).toBeTruthy();
//     expect(before.isSameDay(post.updated_at)).toBeTruthy();
//     Carbon.setTestNow(future = before.copy().addDays(3));
//     FedacoTouchingPost.withoutTouching(() => {
//       FedacoTouchingComment.initAttributes({
//         'content': 'Comment content',
//         'post_id': 1
//       });
//     });
//     expect('It is touching models when it should be disabled.').toBeTruthy(
//       before.isSameDay(post.fresh().updated_at));
//     expect('It is touching models when it should be disabled.').toBeTruthy(
//       future.isSameDay(user.fresh().updated_at));
//     Carbon.setTestNow(before);
//   });
//   it('can nest calls of no touching', () => {
//     let before = Carbon.now();
//     let user   = FedacoTouchingUser.initAttributes({
//       'id'   : 1,
//       'email': 'linbolen@gradii.com'
//     });
//     let post   = FedacoTouchingPost.initAttributes({
//       'id'     : 1,
//       'name'   : 'Parent Post',
//       'user_id': 1
//     });
//     expect(before.isSameDay(user.updated_at)).toBeTruthy();
//     expect(before.isSameDay(post.updated_at)).toBeTruthy();
//     Carbon.setTestNow(future = before.copy().addDays(3));
//     FedacoTouchingUser.withoutTouching(() => {
//       FedacoTouchingPost.withoutTouching(() => {
//         FedacoTouchingComment.initAttributes({
//           'content': 'Comment content',
//           'post_id': 1
//         });
//       });
//     });
//     expect('It is touching models when it should be disabled.').toBeTruthy(
//       before.isSameDay(post.fresh().updated_at));
//     expect('It is touching models when it should be disabled.').toBeTruthy(
//       before.isSameDay(user.fresh().updated_at));
//     Carbon.setTestNow(before);
//   });
//   it('can pass array of models to ignore', () => {
//     let before = Carbon.now();
//     let user   = FedacoTouchingUser.initAttributes({
//       'id'   : 1,
//       'email': 'linbolen@gradii.com'
//     });
//     let post   = FedacoTouchingPost.initAttributes({
//       'id'     : 1,
//       'name'   : 'Parent Post',
//       'user_id': 1
//     });
//     expect(before.isSameDay(user.updated_at)).toBeTruthy();
//     expect(before.isSameDay(post.updated_at)).toBeTruthy();
//     Carbon.setTestNow(future = before.copy().addDays(3));
//     Model.withoutTouchingOn([FedacoTouchingUser, FedacoTouchingPost], () => {
//       FedacoTouchingComment.initAttributes({
//         'content': 'Comment content',
//         'post_id': 1
//       });
//     });
//     expect('It is touching models when it should be disabled.').toBeTruthy(
//       before.isSameDay(post.fresh().updated_at));
//     expect('It is touching models when it should be disabled.').toBeTruthy(
//       before.isSameDay(user.fresh().updated_at));
//     Carbon.setTestNow(before);
//   });

  it('when base model is ignored all child models are ignored', async () => {
    expect(Model.isIgnoringTouch()).toBeFalsy();
    expect(User.isIgnoringTouch()).toBeFalsy();
    await Model.withoutTouching(async () => {
      expect(Model.isIgnoringTouch()).toBeTruthy();
      expect(User.isIgnoringTouch()).toBeTruthy();
    });
    expect(User.isIgnoringTouch()).toBeFalsy();
    expect(Model.isIgnoringTouch()).toBeFalsy();
  });

  it('child models are ignored', async () => {
    expect(Model.isIgnoringTouch()).toBeFalsy();
    expect(User.isIgnoringTouch()).toBeFalsy();
    expect(Post.isIgnoringTouch()).toBeFalsy();
    await User.withoutTouching(async () => {
      expect(Model.isIgnoringTouch()).toBeFalsy();
      expect(Post.isIgnoringTouch()).toBeFalsy();
      expect(User.isIgnoringTouch()).toBeTruthy();
    });
    expect(Model.isIgnoringTouch()).toBeFalsy();
    expect(Post.isIgnoringTouch()).toBeFalsy();
    expect(User.isIgnoringTouch()).toBeFalsy();
  });
});

/*Fedaco Models...*/
@Table({
  tableName    : 'users',
  morphTypeName: 'user',
})
export class FedacoTestUser extends Model {
  // _table: any   = 'users';
  // _dates: any   = ['birthday'];
  _guarded: any = [];

  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @DatetimeColumn()
  birthday: Date;

  @CreatedAtColumn()
  created_at: Date;

  @UpdatedAtColumn()
  updated_at: Date;

  @BelongsToManyColumn({
    related        : FedacoTestUser,
    table          : 'friends',
    foreignPivotKey: 'user_id',
    relatedPivotKey: 'friend_id'
  })
  friends: FedacoRelationListType<FedacoTestUser>;

  @BelongsToManyColumn({
    related        : FedacoTestUser,
    table          : 'friends',
    foreignPivotKey: 'user_id',
    relatedPivotKey: 'friend_id',
    // @ts-ignore
    onQuery: (q: BelongsToMany) => {
      q.wherePivot('user_id', 1);
    }
  })
  friendsOne: FedacoRelationListType<FedacoTestUser>;

  @BelongsToManyColumn({
    related        : FedacoTestUser,
    table          : 'friends',
    foreignPivotKey: 'user_id',
    relatedPivotKey: 'friend_id',
    // @ts-ignore
    onQuery: (q: BelongsToMany) => {
      q.wherePivot('user_id', 2);
    }
  })
  friendsTwo: FedacoRelationListType<FedacoTestUser>;

  @HasManyColumn({
    related   : forwardRef(() => FedacoTestPost),
    foreignKey: 'user_id',
  })
  public posts: FedacoRelationListType<FedacoTestPost>;

  @HasOneColumn({
    related   : forwardRef(() => FedacoTestPost),
    foreignKey: 'user_id',
  })
  public post: FedacoRelationType<FedacoTestPost>;

  @MorphManyColumn({
    related  : forwardRef(() => FedacoTestPhoto),
    morphName: 'imageable',
  })
  public photos: FedacoRelationListType<FedacoTestPhoto>;

  @HasOneColumn({
    related   : forwardRef(() => FedacoTestPost),
    foreignKey: 'user_id',
    onQuery   : ((q: FedacoBuilder) => {
      q.join('photo', (join: JoinClauseBuilder) => {
        join.on('photo.imageable_id', 'post.id');
        join.where('photo.imageable_type', 'FedacoTestPost');
      });
    })
  })
  public postWithPhotos: FedacoRelationType<FedacoTestPost>;
}

@Table({
  tableName    : 'users',
})
export class FedacoTestUserWithCustomFriendPivot extends FedacoTestUser {
  @BelongsToManyColumn({
    related        : FedacoTestUser,
    table          : 'friends',
    foreignPivotKey: 'user_id',
    relatedPivotKey: 'friend_id',
    onQuery        : (q: BelongsToMany) => {
      q.using(FedacoTestFriendPivot).withPivot('user_id', 'friend_id', 'friend_level_id');
    }
  })
  friends: FedacoRelationListType<FedacoTestUser>;
}

@Table({
  tableName: 'users_with_space_in_colum_name'
})
export class FedacoTestUserWithSpaceInColumnName extends FedacoTestUser {
  // _table: any = 'users_with_space_in_colum_name';
}

@Table({
  tableName: 'non_incrementing_users'
})
export class FedacoTestNonIncrementing extends Model {
  // _table: any               = 'non_incrementing_users';
  _guarded: any             = [];
  public _incrementing: any = false;
  public _timestamps: any   = false;
}

@Table({
  tableName: 'non_incrementing_seconds'
})
export class FedacoTestNonIncrementingSecond extends FedacoTestNonIncrementing {
  _connection: any = 'second_connection';

  @Column()
  name: string;
}

@Table({
  tableName: 'users'
})
export class FedacoTestUserWithGlobalScope extends FedacoTestUser {
  public $boot() {
    super.$boot();
    FedacoTestUserWithGlobalScope.addGlobalScope('withPosts', (builder: FedacoBuilder) => {
      builder.with('posts');
    });
  }
}

@Table({
  tableName: 'users'
})
export class FedacoTestUserWithOmittingGlobalScope extends FedacoTestUser {
  public $boot() {
    super.$boot();
    FedacoTestUserWithOmittingGlobalScope.addGlobalScope('notEmail', (builder: FedacoBuilder) => {
      builder.where('email', '!=', 'linbolen@gradii.com');
    });
  }
}

// export class FedacoTestUserWithGlobalScopeRemovingOtherScope extends Fedaco {
//   protected table: any = "soft_deleted_users";
//   protected guarded: any = [];
//   public static boot() {
//     FedacoTestUserWithGlobalScopeRemovingOtherScope.addGlobalScope(builder => {
//       builder.withoutGlobalScope(SoftDeletingScope);
//     });
//     super.boot();
//   }
// }
@Table({
  tableName    : 'posts',
  morphTypeName: 'post',
})
export class FedacoTestPost extends Model {
  // _table: any   = 'posts';
  _guarded: any = [];

  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  // @Column()
  // user_id; no need to define this since BelongsToColumn dynamic add foreign user_id

  @BelongsToColumn({
    related   : FedacoTestUser,
    foreignKey: 'user_id'
  })
  public user: FedacoRelationType<FedacoTestUser>;

  @MorphManyColumn({
    related  : forwardRef(() => FedacoTestPhoto),
    morphName: 'imageable',
  })
  photos: FedacoRelationListType<FedacoTestPhoto>;

  // public photos() {
  //   return this.morphMany(FedacoTestPhoto, 'imageable');
  // }

  // @Column()
  // parent_id; no need to define this since BelongsToColumn dynamic add foreign user_id


  @HasManyColumn({
    related   : forwardRef(() => FedacoTestPost),
    foreignKey: 'parent_id',
  })
  childPosts: Promise<any[]>;

  // public childPosts() {
  //   return this.hasMany(FedacoTestPost, 'parent_id');
  // }
  //

  @BelongsToColumn({
    related   : forwardRef(() => FedacoTestPost),
    foreignKey: 'parent_id',
  })
  parentPost: FedacoRelationType<FedacoTestPhoto>;

  // public parentPost() {
  //   return this.belongsTo(FedacoTestPost, 'parent_id');
  // }
}

@Table({
  tableName: 'friend_levels'
})
export class FedacoTestFriendLevel extends Model {
  _table: any   = 'friend_levels';
  _guarded: any = [];

  @Column()
  level: FedacoRelationType<FedacoTestPhoto>;
}

@Table({
  tableName: 'photos'
})
export class FedacoTestPhoto extends Model {
  // _table: any   = 'photos';
  _guarded: any = [];

  @Column()
  name: FedacoRelationType<FedacoTestPhoto>;

  @MorphToColumn({
    morphTypeMap: {
      'FedacoTestUser': FedacoTestUser,
      'FedacoTestPost': FedacoTestPost,
      'user'          : FedacoTestUser,
      'post'          : FedacoTestPost,
    }
  })
  public imageable: FedacoRelationType<FedacoTestPhoto>;
}

@Table({
  tableName: 'fedaco_test_user_with_string_cast_id'
})
export class FedacoTestUserWithStringCastId extends FedacoTestUser {
  // protected casts: any = {
  //   "id": "string"
  // };

  @Column()
  id: number;
}

@Table({
  tableName: 'fedaco_test_user_with_custom_date_serialization'
})
export class FedacoTestUserWithCustomDateSerialization extends FedacoTestUser {
  $serializeDate(date: Date) {
    return format(date, 'dd-MM-yy');
  }
}

@Table({
  tableName: 'test_orders'
})
export class FedacoTestOrder extends Model {
  // _table: any   = 'test_orders';
  _guarded: any = [];
  _with: any[]  = ['item'];

  @PrimaryColumn()
  id: number;

  @MorphToColumn({
    morphTypeMap: {
      FedacoTestItem: forwardRef(() => FedacoTestItem)
    }
  })
  public item: FedacoRelationType<FedacoTestItem>;
}

@Table({
  tableName: 'test_items'
})
export class FedacoTestItem extends Model {
  // _table: any      = 'test_items';
  _guarded: any    = [];
  _connection: any = 'second_connection';
}

@Table({
  tableName: 'with_json'
})
export class FedacoTestWithJSON extends Model {
  // _table: any   = 'with_json';
  _guarded: any = [];

  public _timestamps: any = false;
  // protected casts: any   = {
  //   'json': 'array'
  // };

  @ArrayColumn()
  json: any[];
}

@Table({
  tableName: 'friends'
})
export class FedacoTestFriendPivot extends Pivot {
  _table: any   = 'friends';
  _guarded: any = [];

  @BelongsToColumn({
    related: FedacoTestUser
  })
  public user: FedacoRelationType<FedacoTestItem>;

  @BelongsToColumn({
    related: FedacoTestUser
  })
  public friend: FedacoRelationType<FedacoTestItem>;

  @BelongsToColumn({
    related   : FedacoTestFriendLevel,
    foreignKey: 'friend_level_id'
  })
  public level: FedacoRelationType<FedacoTestItem>;
}

@Table({
  tableName: 'users'
})
export class FedacoTouchingUser extends Model {
  _guarded: any = [];

  @CreatedAtColumn()
  created_at: Date;

  @UpdatedAtColumn()
  updated_at: Date;
}

@Table({
  tableName: 'posts'
})
export class FedacoTouchingPost extends Model {
  _guarded: any = [];
  _touches: any = ['user'];

  @BelongsToColumn({
    related   : FedacoTouchingUser,
    foreignKey: 'user_id'
  })
  public user: FedacoRelationType<any>;

  @CreatedAtColumn()
  created_at: Date;

  @UpdatedAtColumn()
  updated_at: Date;
}


@Table({
  tableName: 'comments'
})
export class FedacoTouchingComment extends Model {
  _guarded: any = [];
  _touches: any = ['post'];

  @BelongsToColumn({
    related   : FedacoTouchingPost,
    foreignKey: 'post_id'
  })
  public post: FedacoRelationType<FedacoTouchingPost>;
}

import { FedacoRelationListType, FedacoRelationType } from './../../src/fedaco/fedaco-types';
import { head } from '@gradii/nanofn';
import { Column } from '../../src/annotation/column/column';
import { PrimaryGeneratedColumn } from '../../src/annotation/column/primary-generated.column';
import { BelongsToColumn } from '../../src/annotation/relation-column/belongs-to.relation-column';
import { HasManyColumn } from '../../src/annotation/relation-column/has-many.relation-column';
import { HasOneColumn } from '../../src/annotation/relation-column/has-one.relation-column';
import { MorphToColumn } from '../../src/annotation/relation-column/morph-to.relation-column';
import { DatabaseConfig } from '../../src/database-config';
import { mixinSoftDeletes, SoftDeletes } from '../../src/fedaco/mixins/soft-deletes';
import { Model } from '../../src/fedaco/model';
import { onlyTrashed, restore, withoutTrashed, withTrashed } from '../../src/fedaco/scopes/soft-deleting-scope';
import { forwardRef } from '../../src/query-builder/forward-ref';
import { SchemaBuilder } from '../../src/schema/schema-builder';
import { DeletedAtColumn } from '../../src/annotation/column/deleted-at.column';
import { format } from 'date-fns';
import { QueryBuilder } from '../../src/query-builder/query-builder';
import { Relation } from '../../src/fedaco/relations/relation';

function connection(connectionName = 'default') {
  return Model.getConnectionResolver().connection(connectionName);
}

function schema(connectionName = 'default'): SchemaBuilder {
  return connection(connectionName).getSchemaBuilder();
}

jest.setTimeout(100000);

async function createSchema() {
  await schema().create('users', (table) => {
    table.increments('id');
    table.integer('group_id').withNullable();
    table.string('email').withUnique();
    table.timestamps();
    table.softDeletes();
  });
  await schema().create('posts', (table) => {
    table.increments('id');
    table.integer('user_id');
    table.string('title');
    table.timestamps();
    table.softDeletes();
  });
  await schema().create('comments', (table) => {
    table.increments('id');
    table.integer('owner_id').withNullable();
    table.string('owner_type').withNullable();
    table.integer('post_id');
    table.string('body');
    table.timestamps();
    table.softDeletes();
  });
  await schema().create('addresses', (table) => {
    table.increments('id');
    table.integer('user_id');
    table.string('address');
    table.timestamps();
    table.softDeletes();
  });
  await schema().create('groups', (table) => {
    table.increments('id');
    table.string('name');
    table.timestamps();
    table.softDeletes();
  });
}

async function createUsers() {
  const taylor = await SoftDeletesTestUser.createQuery().create({
    id   : 1,
    email: 'linbolen@gradii.com',
  });
  await SoftDeletesTestUser.createQuery().create({
    id   : 2,
    email: 'xsilen@gradii.com',
  });
  await taylor.Delete();
}

describe('test database fedaco soft deletes integration', () => {
  beforeEach(async () => {
    // Carbon.setTestNow(Carbon.now());
    const db = new DatabaseConfig();
    db.addConnection({
      driver  : 'sqlite',
      database: ':memory:',
    });
    db.bootFedaco();
    db.setAsGlobal();
    await createSchema();
  });
  afterEach(async () => {
    // Carbon.setTestNow(null);
    await schema().drop('users');
    await schema().drop('posts');
    await schema().drop('comments');
  });
  it('soft deletes are not retrieved', async () => {
    await createUsers();
    const users = await SoftDeletesTestUser.createQuery().get();
    expect(users).toHaveLength(1);
    expect(head(users).id).toEqual(2);
    expect(await SoftDeletesTestUser.createQuery().find(1)).toBeUndefined();
  });
  it('soft deletes are not retrieved from base query', async () => {
    await createUsers();
    const query = SoftDeletesTestUser.createQuery().toBase();
    expect(query).toBeInstanceOf(QueryBuilder);
    expect(await query.get()).toHaveLength(1);
  });
  // it('soft deletes are not retrieved from builder helpers', () => {
  //   createUsers();
  //   let count = 0;
  //   let query = SoftDeletesTestUser.createQuery();
  //   query.chunk(2, user => {
  //     count += count(user);
  //   });
  //   expect(count).toEqual(1);
  //   query = SoftDeletesTestUser.createQuery();
  //   expect(query.pluck('email').all()).toHaveLength(1);
  //   // Paginator.currentPageResolver(() => {
  //   //   return 1;
  //   // });
  //    query = SoftDeletesTestUser.createQuery();
  //   expect(query.paginate(2).all()).toHaveLength(1);
  //    query = SoftDeletesTestUser.createQuery();
  //   expect(query.simplePaginate(2).all()).toHaveLength(1);
  //   expect(SoftDeletesTestUser.createQuery().where('email', 'linbolen@gradii.com').increment(
  //     'id')).toEqual(0);
  //   expect(SoftDeletesTestUser.createQuery().where('email', 'linbolen@gradii.com').decrement(
  //     'id')).toEqual(0);
  // });
  it('with trashed returns all records', async () => {
    await createUsers();
    expect(await SoftDeletesTestUser.createQuery().pipe(withTrashed()).get()).toHaveLength(2);
    expect(await SoftDeletesTestUser.createQuery().pipe(withTrashed()).find(1)).toBeInstanceOf(Model);
  });

  it('with trashed accepts an argument', async () => {
    await createUsers();
    expect(await SoftDeletesTestUser.createQuery().pipe(withTrashed(false)).get()).toHaveLength(1);
    expect(await SoftDeletesTestUser.createQuery().pipe(withTrashed(true)).get()).toHaveLength(2);
  });

  it('delete sets deleted column', async () => {
    await createUsers();
    expect((await SoftDeletesTestUser.createQuery().pipe(withTrashed()).find(1)).deleted_at).toBeInstanceOf(Date);
    expect((await SoftDeletesTestUser.createQuery().find(2)).deleted_at).toBeNull();
  });

  it('force delete actually deletes records', async () => {
    await createUsers();
    await (await SoftDeletesTestUser.createQuery().find(2)).ForceDelete();
    const users = await SoftDeletesTestUser.createQuery().pipe(withTrashed()).get();
    expect(users).toHaveLength(1);
    expect(head(users).id).toEqual(1);
  });

  it('restore restores records', async () => {
    await createUsers();
    const taylor = await SoftDeletesTestUser.createQuery().pipe(withTrashed()).find(1);
    expect(taylor.Trashed()).toBeTruthy();
    await taylor.Restore();
    const users = await SoftDeletesTestUser.createQuery().get();
    expect(users).toHaveLength(2);
    expect(users.find((it) => it.id === 1).deleted_at).toBeNull();
    expect(users.find((it) => it.id === 2).deleted_at).toBeNull();
  });

  it('only trashed only returns trashed records', async () => {
    await createUsers();
    const users = await SoftDeletesTestUser.createQuery().pipe(onlyTrashed()).get();
    expect(users).toHaveLength(1);
    expect(head(users).id).toEqual(1);
  });

  it('only without trashed only returns trashed records', async () => {
    await createUsers();
    let users = await SoftDeletesTestUser.createQuery().pipe(withoutTrashed()).get();
    expect(users).toHaveLength(1);
    expect(head(users).id).toEqual(2);
    users = await SoftDeletesTestUser.createQuery().pipe(withTrashed(), withoutTrashed()).get();
    expect(users).toHaveLength(1);
    expect(head(users).id).toEqual(2);
  });

  it('first or new', async () => {
    await createUsers();
    let result = await SoftDeletesTestUser.createQuery().firstOrNew({
      email: 'linbolen@gradii.com',
    });
    expect(result.id).toBeUndefined();
    result = await SoftDeletesTestUser.createQuery().pipe(withTrashed()).firstOrNew({
      email: 'linbolen@gradii.com',
    });
    expect(result.id).toEqual(1);
  });

  it('find or new', async () => {
    await createUsers();
    let result = await SoftDeletesTestUser.createQuery().findOrNew(1);
    expect(result.id).toBeUndefined();
    result = await SoftDeletesTestUser.createQuery().pipe(withTrashed()).findOrNew(1);
    expect(result.id).toEqual(1);
  });

  it('first or create', async () => {
    await createUsers();
    let result = await SoftDeletesTestUser.createQuery().pipe(withTrashed()).firstOrCreate({
      email: 'linbolen@gradii.com',
    });
    expect(result.email).toBe('linbolen@gradii.com');
    expect(await SoftDeletesTestUser.createQuery().get()).toHaveLength(1);
    result = await SoftDeletesTestUser.createQuery().firstOrCreate({
      email: 'foo@bar.com',
    });
    expect(result.email).toBe('foo@bar.com');
    expect(await SoftDeletesTestUser.createQuery().get()).toHaveLength(2);
    expect(await SoftDeletesTestUser.createQuery().pipe(withTrashed()).get()).toHaveLength(3);
  });

  it('update model after soft deleting', async () => {
    const now = new Date();
    await createUsers();
    /**/
    const userModel = await SoftDeletesTestUser.createQuery().find(2);
    await userModel.Delete();
    expect(userModel.GetOriginal('deleted_at')).toEqual(new Date(format(now, 'yyyy-MM-dd HH:mm:ss')));
    expect(await SoftDeletesTestUser.createQuery().find(2)).toBeUndefined();
    expect((await SoftDeletesTestUser.createQuery().pipe(withTrashed()).find(2)).ToArray()).toEqual(
      userModel.ToArray(),
    );
  });

  it('restore after soft delete', async () => {
    await createUsers();
    /**/
    const userModel = await SoftDeletesTestUser.createQuery().find(2);
    await userModel.Delete();
    await userModel.Restore();
    expect((await SoftDeletesTestUser.createQuery().find(2)).id).toEqual(userModel.id);
  });

  it('soft delete after restoring', async () => {
    await createUsers();
    /**/
    const userModel = await SoftDeletesTestUser.createQuery().pipe(withTrashed()).find(1);
    await userModel.Restore();
    expect((await SoftDeletesTestUser.createQuery().find(1)).deleted_at).toEqual(userModel.deleted_at);
    expect((await SoftDeletesTestUser.createQuery().find(1)).deleted_at).toEqual(userModel.GetOriginal('deleted_at'));
    await userModel.Delete();
    expect(await SoftDeletesTestUser.createQuery().find(1)).toBeUndefined();
    expect((await SoftDeletesTestUser.createQuery().pipe(withTrashed()).find(1)).deleted_at).toEqual(
      userModel.deleted_at,
    );
    expect((await SoftDeletesTestUser.createQuery().pipe(withTrashed()).find(1)).deleted_at).toEqual(
      userModel.GetOriginal('deleted_at'),
    );
  });

  it('modifying before soft deleting and restoring', async () => {
    await createUsers();
    /**/
    const userModel = await SoftDeletesTestUser.createQuery().find(2);
    userModel.email = 'foo@bar.com';
    await userModel.Delete();
    await userModel.Restore();
    expect((await SoftDeletesTestUser.createQuery().find(2)).id).toEqual(userModel.id);
    expect((await SoftDeletesTestUser.createQuery().find(2)).email).toBe('foo@bar.com');
  });
  it('update or create', async () => {
    await createUsers();
    let result = await SoftDeletesTestUser.createQuery().updateOrCreate(
      {
        email: 'foo@bar.com',
      },
      {
        email: 'bar@baz.com',
      },
    );
    expect(result.email).toBe('bar@baz.com');
    expect(await SoftDeletesTestUser.createQuery().get()).toHaveLength(2);
    result = await SoftDeletesTestUser.createQuery().pipe(withTrashed()).updateOrCreate(
      {
        email: 'linbolen@gradii.com',
      },
      {
        email: 'foo@bar.com',
      },
    );
    expect(result.email).toBe('foo@bar.com');
    expect(await SoftDeletesTestUser.createQuery().get()).toHaveLength(2);
    expect(await SoftDeletesTestUser.createQuery().pipe(withTrashed()).get()).toHaveLength(3);
  });

  it('has one relationship can be soft deleted', async () => {
    await createUsers();
    let abigail = await SoftDeletesTestUser.createQuery().where('email', 'xsilen@gradii.com').first();
    await abigail.NewRelation('address').create({
      address: 'Laravel avenue 43',
    });
    await abigail.NewRelation('address').delete();
    abigail = await abigail.Fresh();
    expect(await abigail.address).toBeNull();
    expect((await abigail.NewRelation('address').getQuery().pipe(withTrashed()).first()).address).toBe(
      'Laravel avenue 43',
    );
    await abigail.NewRelation('address').getQuery().pipe(withTrashed(), restore());
    abigail = await abigail.Fresh();
    expect(await (await abigail.address).address).toBe('Laravel avenue 43');
    await (await abigail.address).Delete();
    abigail = await abigail.Fresh();
    expect(await abigail.address).toBeNull();
    expect((await abigail.NewRelation('address').getQuery().pipe(withTrashed()).first()).address).toBe(
      'Laravel avenue 43',
    );
    await abigail.NewRelation('address').getQuery().pipe(withTrashed()).forceDelete();
    abigail = await abigail.Fresh();
    expect(await abigail.address).toBeNull();
  });

  it('belongs to relationship can be soft deleted', async () => {
    await createUsers();
    let abigail = await SoftDeletesTestUser.createQuery().where('email', 'xsilen@gradii.com').first();
    const group = await SoftDeletesTestGroup.createQuery().create({
      name: 'admin',
    });
    abigail.NewRelation('group').associate(group);
    await abigail.Save();
    await abigail.NewRelation('group').delete();
    abigail = await abigail.Fresh();
    expect(await abigail.group).toBeNull();
    expect((await abigail.NewRelation('group').getQuery().pipe(withTrashed()).first()).name).toBe('admin');
    abigail.NewRelation('group').getQuery().pipe(withTrashed(), restore());
    abigail = await abigail.Fresh();
    expect((await abigail.group).name).toBe('admin');
    await (await abigail.group).Delete();
    abigail = await abigail.Fresh();
    expect(await abigail.group).toBeNull();
    expect((await abigail.NewRelation('group').getQuery().pipe(withTrashed()).first()).name).toBe('admin');
    await abigail.NewRelation('group').getQuery().pipe(withTrashed()).forceDelete();
    abigail = await abigail.Fresh();
    expect(await abigail.NewRelation('group').getQuery().pipe(withTrashed()).first()).toBeUndefined();
  });

  it('has many relationship can be soft deleted', async () => {
    await createUsers();
    let abigail = await SoftDeletesTestUser.createQuery().where('email', 'xsilen@gradii.com').first();
    await abigail.NewRelation('posts').create({
      title: 'First Title',
    });
    await abigail.NewRelation('posts').create({
      title: 'Second Title',
    });
    await abigail.NewRelation('posts').where('title', 'Second Title').delete();
    abigail = await abigail.Fresh();
    expect(await abigail.posts).toHaveLength(1);
    expect(head((await abigail.posts) as SoftDeletesTestPost[]).title).toBe('First Title');
    expect(await abigail.NewRelation('posts').getQuery().pipe(withTrashed()).get()).toHaveLength(2);
    await abigail.NewRelation('posts').getQuery().pipe(withTrashed(), restore());
    abigail = await abigail.Fresh();
    expect(await abigail.posts).toHaveLength(2);
    await abigail.NewRelation('posts').where('title', 'Second Title').forceDelete();
    abigail = await abigail.Fresh();
    expect(await abigail.posts).toHaveLength(1);
    expect(await abigail.NewRelation('posts').getQuery().pipe(withTrashed()).get()).toHaveLength(1);
  });

  it('second level relationship can be soft deleted', async () => {
    await createUsers();
    let abigail = await SoftDeletesTestUser.createQuery().where('email', 'xsilen@gradii.com').first();
    const post = await abigail.NewRelation('posts').create({
      title: 'First Title',
    });
    await post.NewRelation('comments').create({
      body: 'Comment Body',
    });
    (await abigail.NewRelation('posts').first()).NewRelation('comments').delete();
    abigail = await abigail.Fresh();
    expect(await (await abigail.NewRelation('posts').first()).comments).toHaveLength(0);
    expect(
      await (await abigail.NewRelation('posts').first()).NewRelation('comments').pipe(withTrashed()).get(),
    ).toHaveLength(1);
  });

  it('where has with deleted relationship', async () => {
    await createUsers();
    const abigail = await SoftDeletesTestUser.createQuery().where('email', 'xsilen@gradii.com').first();
    const post = await abigail.NewRelation('posts').create({
      title: 'First Title',
    });
    let users = await SoftDeletesTestUser.createQuery().where('email', 'linbolen@gradii.com').has('posts').get();
    expect(users).toHaveLength(0);
    users = await SoftDeletesTestUser.createQuery().where('email', 'xsilen@gradii.com').has('posts').get();
    expect(users).toHaveLength(1);
    users = await SoftDeletesTestUser.createQuery().where('email', 'doesnt@exist.com').orHas('posts').get();
    expect(users).toHaveLength(1);
    users = await SoftDeletesTestUser.createQuery()
      .whereHas('posts', (query) => {
        query.where('title', 'First Title');
      })
      .get();
    expect(users).toHaveLength(1);
    users = await SoftDeletesTestUser.createQuery()
      .whereHas('posts', (query) => {
        query.where('title', 'Another Title');
      })
      .get();
    expect(users).toHaveLength(0);
    users = await SoftDeletesTestUser.createQuery()
      .where('email', 'doesnt@exist.com')
      .orWhereHas('posts', (query) => {
        query.where('title', 'First Title');
      })
      .get();
    expect(users).toHaveLength(1);
    await post.Delete();
    users = await SoftDeletesTestUser.createQuery().has('posts').get();
    expect(users).toHaveLength(0);
  });

  it('where has with nested deleted relationship and only trashed condition', async () => {
    await createUsers();
    const abigail = await SoftDeletesTestUser.createQuery().where('email', 'xsilen@gradii.com').first();
    const post = await abigail.NewRelation('posts').create({
      title: 'First Title',
    });
    await post.Delete();
    let users = await SoftDeletesTestUser.createQuery().has('posts').get();
    expect(users).toHaveLength(0);
    users = await SoftDeletesTestUser.createQuery()
      .whereHas('posts', (q) => {
        q.pipe(onlyTrashed());
      })
      .get();
    expect(users).toHaveLength(1);
    users = await SoftDeletesTestUser.createQuery()
      .whereHas('posts', (q) => {
        q.pipe(withTrashed());
      })
      .get();
    expect(users).toHaveLength(1);
  });

  it('where has with nested deleted relationship', async () => {
    await createUsers();
    const abigail = await SoftDeletesTestUser.createQuery().where('email', 'xsilen@gradii.com').first();
    const post = await abigail.NewRelation('posts').create({
      title: 'First Title',
    });
    const comment = await post.NewRelation('comments').create({
      body: 'Comment Body',
    });
    await comment.Delete();
    let users = await SoftDeletesTestUser.createQuery().has('posts.comments').get();
    expect(users).toHaveLength(0);
    users = await SoftDeletesTestUser.createQuery().doesntHave('posts.comments').get();
    expect(users).toHaveLength(1);
  });
  it('where doesnt have with nested deleted relationship', async () => {
    await createUsers();
    const users = await SoftDeletesTestUser.createQuery().doesntHave('posts.comments').get();
    expect(users).toHaveLength(1);
  });
  it('where has with nested deleted relationship and with trashed condition', async () => {
    await createUsers();
    const abigail = await SoftDeletesTestUserWithTrashedPosts.createQuery().where('email', 'xsilen@gradii.com').first();
    const post = await abigail.NewRelation('posts').create({
      title: 'First Title',
    });
    await post.Delete();
    const users = await SoftDeletesTestUserWithTrashedPosts.createQuery().has('posts').get();
    expect(users).toHaveLength(1);
  });

  it('with count with nested deleted relationship and only trashed condition', async () => {
    await createUsers();
    const abigail = await SoftDeletesTestUser.createQuery().where('email', 'xsilen@gradii.com').first();
    const post1 = await abigail.NewRelation('posts').create({
      title: 'First Title',
    });
    await post1.Delete();
    await abigail.NewRelation('posts').create({
      title: 'Second Title',
    });
    await abigail.NewRelation('posts').create({
      title: 'Third Title',
    });
    let user = await SoftDeletesTestUser.createQuery().withCount('posts').orderBy('posts_count', 'desc').first();
    expect(user.GetAttribute('posts_count')).toEqual(2);
    user = await SoftDeletesTestUser.createQuery()
      .withCount({
        posts: (q) => {
          q.pipe(onlyTrashed());
        },
      })
      .orderBy('posts_count', 'desc')
      .first();
    expect(user.GetAttribute('posts_count')).toEqual(1);
    user = await SoftDeletesTestUser.createQuery()
      .withCount({
        posts: (q) => {
          q.pipe(withTrashed());
        },
      })
      .orderBy('posts_count', 'desc')
      .first();
    expect(user.GetAttribute('posts_count')).toEqual(3);
    user = await SoftDeletesTestUser.createQuery()
      .withCount({
        posts: (q) => {
          q.pipe(withTrashed()).where('title', 'First Title');
        },
      })
      .orderBy('posts_count', 'desc')
      .first();
    expect(user.GetAttribute('posts_count')).toEqual(1);
    user = await SoftDeletesTestUser.createQuery()
      .withCount({
        posts: (q) => {
          q.where('title', 'First Title');
        },
      })
      .orderBy('posts_count', 'desc')
      .first();
    expect(user.GetAttribute('posts_count')).toEqual(0);
  });

  it('or where with soft delete constraint', async () => {
    await createUsers();
    const users = SoftDeletesTestUser.createQuery().where((q) => {
      q.where('email', 'linbolen@gradii.com').orWhere('email', 'xsilen@gradii.com');
    });
    expect(await users.pluck('email')).toEqual(['xsilen@gradii.com']);
  });

  it('morph to with trashed', async () => {
    await createUsers();
    const abigail = await SoftDeletesTestUser.createQuery().where('email', 'xsilen@gradii.com').first();
    const post1 = await abigail.NewRelation('posts').create({
      title: 'First Title',
    });
    await post1.NewRelation('comments').create({
      body      : 'Comment Body',
      owner_type: 'SoftDeletesTestUser',
      owner_id  : abigail.id,
    });
    await abigail.Delete();
    let comment = await SoftDeletesTestCommentWithTrashed.createQuery()
      .with({
        owner: (q: Relation) => {
          // q.withoutGlobalScope(SoftDeletingScope);
          q.getQuery().withoutGlobalScope('softDeleting');
        },
      })
      .first();
    expect(comment.owner.email).toEqual(abigail.email);
    comment = await SoftDeletesTestCommentWithTrashed.createQuery()
      .with({
        owner: (q: Relation) => {
          q.pipe(withTrashed());
        },
      })
      .first();
    expect(comment.owner.email).toEqual(abigail.email);
    const withoutSoftDeleteComment = await TestCommentWithoutSoftDelete.createQuery()
      .with({
        owner: (q: Relation) => {
          q.pipe(withTrashed());
        },
      })
      .first();
    expect(withoutSoftDeleteComment.owner.email).toEqual(abigail.email);
  });

  it('morph to with bad method call', async () => {
    await createUsers();
    const abigail = await SoftDeletesTestUser.createQuery().where('email', 'xsilen@gradii.com').first();
    const post1 = await abigail.NewRelation('posts').create({
      title: 'First Title',
    });
    await post1.NewRelation('comments').create({
      body      : 'Comment Body',
      owner_type: SoftDeletesTestUser,
      owner_id  : abigail.id,
    });
    await expect(async () => {
      await TestCommentWithoutSoftDelete.createQuery()
        .with({
          owner: (q) => {
            // @ts-ignore
            q.thisMethodDoesNotExist();
          },
        })
        .first();
    }).rejects.toThrow('q.thisMethodDoesNotExist is not a function');
  });

  it('morph to with constraints', async () => {
    await createUsers();
    const abigail = await SoftDeletesTestUser.createQuery().where('email', 'xsilen@gradii.com').first();
    const post1 = await abigail.NewRelation('posts').create({
      title: 'First Title',
    });
    await post1.NewRelation('comments').create({
      body      : 'Comment Body',
      owner_type: 'SoftDeletesTestUser',
      owner_id  : abigail.id,
    });
    const comment = await SoftDeletesTestCommentWithTrashed.createQuery()
      .with({
        owner: (q) => {
          q.where('email', 'linbolen@gradii.com');
        },
      })
      .first();
    expect(comment.owner).toBeNull();
  });

  it('morph to without constraints', async () => {
    await createUsers();
    const abigail = await SoftDeletesTestUser.createQuery().where('email', 'xsilen@gradii.com').first();
    const post1 = await abigail.NewRelation('posts').create({
      title: 'First Title',
    });
    await post1.NewRelation('comments').create({
      body      : 'Comment Body',
      owner_type: 'SoftDeletesTestUser',
      owner_id  : abigail.id,
    });
    let comment = await SoftDeletesTestCommentWithTrashed.createQuery().with('owner').first();
    expect(comment.owner.email).toEqual(abigail.email);
    await abigail.Delete();
    comment = await SoftDeletesTestCommentWithTrashed.createQuery().with('owner').first();
    expect(comment.owner).toBeNull();
  });

  it('morph to non soft deleting model', async () => {
    const taylor = await TestUserWithoutSoftDelete.createQuery().create({
      id   : 1,
      email: 'linbolen@gradii.com',
    });
    const post1 = await taylor.NewRelation('posts').create({
      title: 'First Title',
    });
    await post1.NewRelation('comments').create({
      body      : 'Comment Body',
      owner_type: 'TestUserWithoutSoftDelete',
      owner_id  : taylor.id,
    });
    let comment = await SoftDeletesTestCommentWithTrashed.createQuery().with('owner').first();
    expect((await comment.owner).email).toEqual(taylor.email);
    await taylor.Delete();
    comment = await SoftDeletesTestCommentWithTrashed.createQuery().with('owner').first();
    expect(comment.owner).toBeNull();
  });
});

/* Eloquent Models... */
export class TestUserWithoutSoftDelete extends Model {
  _table: any = 'users';
  _guarded: any = [];

  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  email: string;

  @HasManyColumn({
    related   : forwardRef(() => SoftDeletesTestPost),
    foreignKey: 'user_id',
  })
  public posts: FedacoRelationListType<SoftDeletesTestPost>;
}

/* Eloquent Models... */
export class SoftDeletesTestUser extends (mixinSoftDeletes(Model) as typeof Model & {
  new (...args: any[]): SoftDeletes;
}) {
  static UPDATED_AT: string = null;
  _table: any = 'users';
  _guarded: any = [];

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @HasManyColumn({
    related   : forwardRef(() => SoftDeletesTestPost),
    foreignKey: 'user_id',
  })
  public posts: FedacoRelationListType<SoftDeletesTestPost>;

  @HasOneColumn({
    related   : forwardRef(() => SoftDeletesTestAddress),
    foreignKey: 'user_id',
  })
  public address: FedacoRelationType<SoftDeletesTestAddress>;

  @BelongsToColumn({
    related   : forwardRef(() => SoftDeletesTestGroup),
    foreignKey: 'group_id',
  })
  public group: FedacoRelationType<SoftDeletesTestGroup>;

  @DeletedAtColumn()
  deleted_at: Date;
}

export class SoftDeletesTestUserWithTrashedPosts extends Model {
  _table: any = 'users';
  _guarded: any = [];

  @HasManyColumn({
    related   : forwardRef(() => SoftDeletesTestPost),
    foreignKey: 'user_id',
    onQuery   : (q) => {
      q.pipe(withTrashed());
    },
  })
  public posts: FedacoRelationListType<SoftDeletesTestPost>;
}

/* Eloquent Models... */
export class SoftDeletesTestPost extends mixinSoftDeletes(Model) {
  _table: any = 'posts';
  _guarded: any = [];

  @Column()
  title: string;

  @HasManyColumn({
    related   : forwardRef(() => SoftDeletesTestComment),
    foreignKey: 'post_id',
  })
  public comments: FedacoRelationListType<SoftDeletesTestComment>;
}

/* Eloquent Models... */
export class TestCommentWithoutSoftDelete extends Model {
  _table: any = 'comments';
  _guarded: any = [];

  @MorphToColumn({
    morphTypeMap: {
      SoftDeletesTestUser      : SoftDeletesTestUser,
      TestUserWithoutSoftDelete: TestUserWithoutSoftDelete,
    },
  })
  public owner: FedacoRelationType<any>;
}

/* Eloquent Models... */
export class SoftDeletesTestComment extends mixinSoftDeletes(Model) {
  _table: any = 'comments';
  _guarded: any = [];

  @MorphToColumn({
    morphTypeMap: {
      SoftDeletesTestUser      : SoftDeletesTestUser,
      TestUserWithoutSoftDelete: TestUserWithoutSoftDelete,
    },
  })
  public owner: FedacoRelationType<any>;
}

export class SoftDeletesTestCommentWithTrashed extends Model {
  _table: any = 'comments';
  _guarded: any = [];

  @Column()
  comment: string;

  @MorphToColumn({
    morphTypeMap: {
      SoftDeletesTestUser      : SoftDeletesTestUser,
      TestUserWithoutSoftDelete: TestUserWithoutSoftDelete,
    },
  })
  public owner: FedacoRelationType<any>;
}

/* Eloquent Models... */
export class SoftDeletesTestAddress extends mixinSoftDeletes(Model) {
  _table: any = 'addresses';
  _guarded: any = [];

  @Column()
  address: string;
}

/* Eloquent Models... */
export class SoftDeletesTestGroup extends mixinSoftDeletes(Model) {
  _table: any = 'groups';
  _guarded: any = [];

  @Column()
  name: string;

  @HasManyColumn({
    related: SoftDeletesTestUser,
  })
  public users: FedacoRelationListType<SoftDeletesTestUser>;
}

import { FedacoRelationListType, FedacoRelationType } from './../../src/fedaco/fedaco-types';
import { BelongsToColumn } from '../../src/annotation/relation-column/belongs-to.relation-column';
import { MorphManyColumn } from '../../src/annotation/relation-column/morph-many.relation-column';
import { MorphToColumn } from '../../src/annotation/relation-column/morph-to.relation-column';
import { DatabaseConfig } from '../../src/database-config';
import { Model } from '../../src/fedaco/model';
import { forwardRef } from '../../src/query-builder/forward-ref';
import { SchemaBuilder } from '../../src/schema/schema-builder';
import { HasManyColumn } from '../../src/annotation/relation-column/has-many.relation-column';

function connection(connectionName = 'default') {
  return Model.getConnectionResolver().connection(connectionName);
}

function schema(connectionName = 'default'): SchemaBuilder {
  return connection(connectionName).getSchemaBuilder();
}

async function seedData() {
  const taylor = await TestUser.createQuery().create({
    id   : 1,
    email: 'linbolen@gradii.com',
  });
  const post = await taylor.NewRelation('posts').create({
    title: 'A title',
    body : 'A body',
  });
  const comment = await post.NewRelation('comments').create({
    body   : 'A comment body',
    user_id: 1,
  });
  await comment.NewRelation('likes').create([]);
}

async function createSchema() {
  await schema().create('users', (table) => {
    table.increments('id');
    table.string('email').withUnique();
    table.timestamps();
  });
  await schema().create('posts', (table) => {
    table.increments('id');
    table.integer('user_id');
    table.string('title');
    table.text('body');
    table.timestamps();
  });
  await schema().create('comments', (table) => {
    table.increments('id');
    table.integer('commentable_id');
    table.string('commentable_type');
    table.integer('user_id');
    table.text('body');
    table.timestamps();
  });
  await schema().create('likes', (table) => {
    table.increments('id');
    table.integer('likeable_id');
    table.string('likeable_type');
    table.timestamps();
  });
}

describe('test database fedaco polymorphic integration', () => {
  beforeEach(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      driver  : 'sqlite',
      database: ':memory:',
    });
    db.bootFedaco();
    db.setAsGlobal();
    await createSchema();
  });

  it('tear down', () => {
    schema().drop('users');
    schema().drop('posts');
    schema().drop('comments');
  });

  it('it loads relationships automatically', async () => {
    await seedData();
    const like = await TestLikeWithSingleWith.createQuery().first();
    expect(like.RelationLoaded('likeable')).toBeTruthy();
    expect(await like.likeable).toEqual(await TestComment.createQuery().first());
  });

  it('it loads chained relationships automatically', async () => {
    await seedData();
    const like = await TestLikeWithSingleWith.createQuery().first();
    expect(like.likeable.RelationLoaded('commentable')).toBeTruthy();
    expect(like.likeable.commentable.toJSON()).toEqual((await TestPost.createQuery().first()).toJSON());
  });

  it('it loads nested relationships automatically', async () => {
    await seedData();
    const like = await TestLikeWithNestedWith.createQuery().first();
    expect(like.RelationLoaded('likeable')).toBeTruthy();
    expect(like.likeable.RelationLoaded('owner')).toBeTruthy();
    expect(like.likeable.owner.toJSON()).toEqual((await TestUser.createQuery().first()).toJSON());
  });

  it('it loads nested relationships on demand', async () => {
    await seedData();
    const like = await TestLike.createQuery().with('likeable.owner').first();
    expect(like.RelationLoaded('likeable')).toBeTruthy();
    expect(like.likeable.RelationLoaded('owner')).toBeTruthy();
    expect(like.likeable.owner.toJSON()).toEqual((await TestUser.createQuery().first()).toJSON());
  });

  // todo
  // it('it loads nested morph relationships on demand', async () => {
  //   await seedData();
  //   (await TestPost.createQuery().first()).newRelation('likes').create([]);
  //   const likes = (await TestLike.createQuery().with('likeable.owner').get()).loadMorph('likeable', {});
  //   expect(likes[0].relationLoaded('likeable')).toBeTruthy();
  //   expect(likes[0].likeable.relationLoaded('owner')).toBeTruthy();
  //   expect(likes[0].likeable.relationLoaded('commentable')).toBeTruthy();
  //   expect(likes[1].relationLoaded('likeable')).toBeTruthy();
  //   expect(likes[1].likeable.relationLoaded('owner')).toBeTruthy();
  //   expect(likes[1].likeable.relationLoaded('comments')).toBeTruthy();
  // });

  it('it loads nested morph relationship counts on demand', async () => {
    await seedData();
    await (await TestPost.createQuery().first()).NewRelation('likes').create([]);
    await (await TestComment.createQuery().first()).NewRelation('likes').create([]);
    const likes = await Promise.all(
      (await TestLike.createQuery().with('likeable.owner').get()).map((it) =>
        it.LoadMorphCount('likeable', {
          TestComment: ['likes'],
          TestPost   : 'comments',
        }),
      ),
    );
    expect(likes[0].RelationLoaded('likeable')).toBeTruthy();
    expect(likes[0].likeable.RelationLoaded('owner')).toBeTruthy();
    expect(likes[0].likeable.GetAttribute('likes_count')).toEqual(2);
    expect(likes[1].RelationLoaded('likeable')).toBeTruthy();
    expect(likes[1].likeable.RelationLoaded('owner')).toBeTruthy();
    expect(likes[1].likeable.GetAttribute('comments_count')).toEqual(1);
    expect(likes[2].RelationLoaded('likeable')).toBeTruthy();
    expect(likes[2].likeable.RelationLoaded('owner')).toBeTruthy();
    expect(likes[2].likeable.GetAttribute('likes_count')).toEqual(2);
  });
});

/* Eloquent Models... */
export class TestUser extends Model {
  _table: any = 'users';
  _guarded: any = [];

  @HasManyColumn({
    related   : forwardRef(() => TestPost),
    foreignKey: 'user_id',
  })
  public posts: FedacoRelationListType<any>;
}

/* Eloquent Models... */
export class TestPost extends Model {
  _table: any = 'posts';
  _guarded: any = [];

  @MorphManyColumn({
    related  : forwardRef(() => TestComment),
    morphName: 'commentable',
  })
  public comments: FedacoRelationListType<TestComment>;

  @BelongsToColumn({
    related   : TestUser,
    foreignKey: 'user_id',
  })
  public owner: FedacoRelationType<TestUser>;

  @MorphManyColumn({
    related  : forwardRef(() => TestLike),
    morphName: 'likeable',
  })
  public likes: FedacoRelationListType<TestLike>;
}

/* Eloquent Models... */
export class TestComment extends Model {
  _table: any = 'comments';
  _guarded: any = [];
  _with: any = ['commentable'];

  @BelongsToColumn({
    related   : TestUser,
    foreignKey: 'user_id',
  })
  public owner: FedacoRelationType<TestUser>;

  @MorphToColumn({
    morphTypeMap: {
      TestPost,
    },
  })
  public commentable: FedacoRelationType<any>;

  @MorphManyColumn({
    related  : forwardRef(() => TestLike),
    morphName: 'likeable',
  })
  public likes: FedacoRelationListType<any>;
}

export class TestLike extends Model {
  _table: any = 'likes';
  _guarded: any = [];

  @MorphToColumn({
    morphTypeMap: {
      TestPost,
      TestComment,
    },
  })
  public likeable: FedacoRelationType<any>;
}

export class TestLikeWithSingleWith extends Model {
  _table: any = 'likes';
  _guarded: any = [];
  _with: any = ['likeable'];

  @MorphToColumn({
    morphTypeMap: {
      TestComment: TestComment,
      TestPost   : TestPost,
    },
  })
  public likeable: FedacoRelationType<any>;
}

export class TestLikeWithNestedWith extends Model {
  _table: any = 'likes';
  _guarded: any = [];
  _with: any = ['likeable.owner'];

  @MorphToColumn({
    morphTypeMap: {
      TestComment: TestComment,
      TestPost   : TestPost,
    },
  })
  public likeable: FedacoRelationType<any>;
}

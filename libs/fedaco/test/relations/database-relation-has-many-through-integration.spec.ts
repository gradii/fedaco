import { PrimaryColumn } from './../../src/annotation/column/primary.column';
import { head } from '@gradii/nanofn';
import { tap } from 'rxjs/operators';
import { Column } from '../../src/annotation/column/column';
import { DeletedAtColumn } from '../../src/annotation/column/deleted-at.column';
import { BelongsToColumn } from '../../src/annotation/relation-column/belongs-to.relation-column';
import { HasManyThroughColumn } from '../../src/annotation/relation-column/has-many-through.relation-column';
import { HasManyColumn } from '../../src/annotation/relation-column/has-many.relation-column';
import { DatabaseConfig } from '../../src/database-config';
import { FedacoRelationListType, FedacoRelationType } from '../../src/fedaco/fedaco-types';
import { mixinSoftDeletes } from '../../src/fedaco/mixins/soft-deletes';
import { Model } from '../../src/fedaco/model';
import { forwardRef } from '../../src/query-builder/forward-ref';
import { SchemaBuilder } from '../../src/schema/schema-builder';

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
    table.string('email').withUnique();
    table.unsignedInteger('country_id');
    table.string('country_short');
    table.timestamps();
    table.softDeletes();
  });
  await schema().create('posts', (table) => {
    table.increments('id');
    table.integer('user_id');
    table.string('title');
    table.text('body');
    table.string('email');
    table.timestamps();
  });
  await schema().create('countries', (table) => {
    table.increments('id');
    table.string('name');
    table.string('shortname');
    table.timestamps();
  });
}

async function seedData() {
  const country = await HasManyThroughTestCountry.createQuery().create({
    id       : 1,
    name     : 'United States of America',
    shortname: 'us',
  });

  const user = await country.NewRelation('users').create({
    id           : 1,
    email        : 'linbolen@gradii.com',
    country_short: 'us',
  });
  const post = await user.NewRelation('posts').createMany([
    {
      title: 'A title',
      body : 'A body',
      email: 'linbolen@gradii.com',
    },
    {
      title: 'Another title',
      body : 'Another body',
      email: 'linbolen@gradii.com',
    },
  ]);
}

async function seedDataExtended() {
  const country = await HasManyThroughTestCountry.createQuery().create({
    id       : 2,
    name     : 'United Kingdom',
    shortname: 'uk',
  });

  const user = await country.NewRelation('users').create({
    id           : 2,
    email        : 'example1@gmail.com',
    country_short: 'uk',
  });

  await user.NewRelation('posts').createMany([
    {
      title: 'Example1 title1',
      body : 'Example1 body1',
      email: 'example1post1@gmail.com',
    },
    {
      title: 'Example1 title2',
      body : 'Example1 body2',
      email: 'example1post2@gmail.com',
    },
  ]);

  const user1 = await country.NewRelation('users').create({
    id           : 3,
    email        : 'example2@gmail.com',
    country_short: 'uk',
  });

  await user1.NewRelation('posts').createMany([
    {
      title: 'Example2 title1',
      body : 'Example2 body1',
      email: 'example2post1@gmail.com',
    },
    {
      title: 'Example2 title2',
      body : 'Example2 body2',
      email: 'example2post2@gmail.com',
    },
  ]);

  const user2 = await country.NewRelation('users').create({
    id           : 4,
    email        : 'example3@gmail.com',
    country_short: 'uk',
  });
  await user2.NewRelation('posts').createMany([
    {
      title: 'Example3 title1',
      body : 'Example3 body1',
      email: 'example3post1@gmail.com',
    },
    {
      title: 'Example3 title2',
      body : 'Example3 body2',
      email: 'example3post2@gmail.com',
    },
  ]);
}

async function seedDefaultData() {
  const r = await HasManyThroughDefaultTestCountry.createQuery().create({
    id  : 1,
    name: 'United States of America',
  });
  const u = await r.NewRelation('users').create({
    id   : 1,
    email: 'linbolen@gradii.com',
  });
  await u.NewRelation('posts').createMany([
    {
      title: 'A title',
      body : 'A body',
    },
    {
      title: 'Another title',
      body : 'Another body',
    },
  ]);
}

async function resetDefault() {
  await schema().drop('users_default');
  await schema().drop('posts_default');
  await schema().drop('countries_default');
}

async function migrateDefault() {
  await schema().create('users_default', (table) => {
    table.increments('id');
    table.string('email').withUnique();
    table.unsignedInteger('countries_default_id');
    table.timestamps();
  });
  await schema().create('posts_default', (table) => {
    table.increments('id');
    table.integer('users_default_id');
    table.string('title');
    table.text('body');
    table.timestamps();
  });
  await schema().create('countries_default', (table) => {
    table.increments('id');
    table.string('name');
    table.timestamps();
  });
}

describe('test database fedaco has many through integration', () => {
  beforeEach(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      driver  : 'sqlite',
      database: ':memory:',
      // 'database': 'tmp/integration-has-many-through.sqlite'
    });
    db.bootFedaco();
    db.setAsGlobal();
    await createSchema();
  });

  afterEach(async () => {
    await schema().drop('users');
    await schema().drop('posts');
    await schema().drop('countries');
  });

  it('it loads a has many through relation with custom keys', async () => {
    await seedData();
    const posts = await (await HasManyThroughTestCountry.createQuery().first()).posts;
    expect(posts[0].title).toBe('A title');
    expect(posts).toHaveLength(2);
  });

  it('it loads a default has many through relation', async () => {
    await migrateDefault();
    await seedDefaultData();
    const posts = await (await HasManyThroughDefaultTestCountry.createQuery().first()).posts;
    expect(posts[0].title).toBe('A title');
    expect(posts).toHaveLength(2);
    await resetDefault();
  });

  it('it loads a relation with custom intermediate and local key', async () => {
    await seedData();
    const posts = await (await HasManyThroughIntermediateTestCountry.createQuery().first()).posts;
    expect(posts[0].title).toBe('A title');
    expect(posts).toHaveLength(2);
  });

  it('eager loading a relation with custom intermediate and local key', async () => {
    await seedData();
    const posts = await (await HasManyThroughIntermediateTestCountry.createQuery().with('posts').first()).posts;
    expect(posts[0].title).toBe('A title');
    expect(posts).toHaveLength(2);
  });

  it('where has on a relation with custom intermediate and local key', async () => {
    await seedData();
    const country = await HasManyThroughIntermediateTestCountry.createQuery()
      .whereHas('posts', (query) => {
        query.where('title', 'A title');
      })
      .get();
    expect(country).toHaveLength(1);
  });

  it('where has on a relation with custom intermediate with pagination', async () => {
    await seedData();
    const country = await HasManyThroughIntermediateTestCountry.createQuery()
      .whereHas('posts', (query) => {
        query.where('title', 'A title');
      })
      .paginate(1, 10);
    expect(country.items).toHaveLength(1);
  });

  it('find method', async () => {
    const country = await HasManyThroughTestCountry.createQuery().create({
      id       : 1,
      name     : 'United States of America',
      shortname: 'us',
    });
    const user = await country.NewRelation('users').create({
      id           : 1,
      email        : 'linbolen@gradii.com',
      country_short: 'us',
    });
    await user.NewRelation('posts').createMany([
      {
        id   : 1,
        title: 'A title',
        body : 'A body',
        email: 'linbolen@gradii.com',
      },
      {
        id   : 2,
        title: 'Another title',
        body : 'Another body',
        email: 'linbolen@gradii.com',
      },
    ]);
    const country1 = await HasManyThroughTestCountry.createQuery().first();
    const post = await country1.NewRelation('posts').find(1);
    expect(post).not.toBeNull();
    expect(post.title).toBe('A title');
    expect(await country1.NewRelation('posts').find([1, 2])).toHaveLength(2);
    expect(await country1.NewRelation('posts').find([1, 2])).toHaveLength(2);
  });

  it('find many method', async () => {
    const country = await HasManyThroughTestCountry.createQuery().create({
      id       : 1,
      name     : 'United States of America',
      shortname: 'us',
    });
    const user = await country.NewRelation('users').create({
      id           : 1,
      email        : 'linbolen@gradii.com',
      country_short: 'us',
    });
    await user.NewRelation('posts').createMany([
      {
        id   : 1,
        title: 'A title',
        body : 'A body',
        email: 'linbolen@gradii.com',
      },
      {
        id   : 2,
        title: 'Another title',
        body : 'Another body',
        email: 'linbolen@gradii.com',
      },
    ]);
    const country1 = await HasManyThroughTestCountry.createQuery().first();
    expect(await country1.NewRelation('posts').findMany([1, 2])).toHaveLength(2);
    expect(await country1.NewRelation('posts').findMany([1, 2])).toHaveLength(2);
  });

  it('first or fail throws an exception', async () => {
    const country = await HasManyThroughTestCountry.createQuery().create({
      id       : 1,
      name     : 'United States of America',
      shortname: 'us',
    });
    await country.NewRelation('users').create({
      id           : 1,
      email        : 'linbolen@gradii.com',
      country_short: 'us',
    });
    await expect(async () => {
      await (await HasManyThroughTestCountry.createQuery().first()).NewRelation('posts').firstOrFail();
    }).rejects.toThrow('ModelNotFoundException No query results for model [HasManyThroughTestPost].');
  });

  it('find or fail throws an exception', async () => {
    const country = await HasManyThroughTestCountry.createQuery().create({
      id       : 1,
      name     : 'United States of America',
      shortname: 'us',
    });
    await country.NewRelation('users').create({
      id           : 1,
      email        : 'linbolen@gradii.com',
      country_short: 'us',
    });
    const user = await HasManyThroughTestCountry.createQuery().first();
    await expect(async () => {
      await user.NewRelation('posts').findOrFail(1);
    }).rejects.toThrow('ModelNotFoundException No query results for model [HasManyThroughTestPost] [1]');
  });

  it('find or fail with many throws an exception', async () => {
    const country = await HasManyThroughTestCountry.createQuery().create({
      id       : 1,
      name     : 'United States of America',
      shortname: 'us',
    });
    const user = await country.NewRelation('users').create({
      id           : 1,
      email        : 'linbolen@gradii.com',
      country_short: 'us',
    });
    const post = await user.NewRelation('posts').create({
      id   : 1,
      title: 'A title',
      body : 'A body',
      email: 'linbolen@gradii.com',
    });

    await expect(async () => {
      await (await HasManyThroughTestCountry.createQuery().first()).NewRelation('posts').findOrFail([1, 2]);
    }).rejects.toThrow('ModelNotFoundException No query results for model [HasManyThroughTestPost] [1,2]');
  });

  it('first retrieves first record', async () => {
    await seedData();
    const post = await (await HasManyThroughTestCountry.createQuery().first()).NewRelation('posts').first();
    expect(post).not.toBeNull();
    expect(post.title).toBe('A title');
  });

  it('all columns are retrieved by default', async () => {
    await seedData();
    const post = await (await HasManyThroughTestCountry.createQuery().first()).NewRelation('posts').first();
    expect(Object.keys(post.GetAttributes())).toEqual([
      'id',
      'user_id',
      'title',
      'body',
      'email',
      'created_at',
      'updated_at',
      'fedaco_through_key',
    ]);
  });

  it('only proper columns are selected if provided', async () => {
    await seedData();
    const post = await (await HasManyThroughTestCountry.createQuery().first())
      .NewRelation('posts')
      .first(['title', 'body']);
    expect(Object.keys(post.GetAttributes())).toEqual(['title', 'body', 'fedaco_through_key']);
  });

  it('chunk returns correct models', async () => {
    await seedData();
    await seedDataExtended();
    const country: HasManyThroughTestCountry = await HasManyThroughTestCountry.createQuery().find(2);
    await country
      .NewRelation('posts')
      .chunk(10)
      .pipe(
        tap(({ results: postsChunk }) => {
          const post = head(postsChunk);
          expect(Object.keys(post.GetAttributes())).toEqual([
            'id',
            'user_id',
            'title',
            'body',
            'email',
            'created_at',
            'updated_at',
            'fedaco_through_key',
          ]);
        }),
      )
      .toPromise();
  });

  it('chunk by id', async () => {
    await seedData();
    await seedDataExtended();
    const country: HasManyThroughTestCountry = await HasManyThroughTestCountry.createQuery().find(2);

    let i = 0;
    let count = 0;

    await country
      .NewRelation('posts')
      .chunkById(2)
      .pipe(
        tap(({ results: collection }) => {
          i++;
          count += collection.length;
        }),
      )
      .toPromise();
    expect(i).toEqual(3);
    expect(count).toEqual(6);
  });

  // it('cursor returns correct models', async () => {
  //   await seedData();
  //   this.seedDataExtended();
  //   const country = HasManyThroughTestCountry.find(2);
  //   const posts   = country.posts().cursor();
  //   expect(posts).toInstanceOf(LazyCollection);
  //   for (const post of posts) {
  //     expect(Object.keys(post.getAttributes())).toEqual(
  //       [
  //         'id', 'user_id', 'title', 'body', 'email', 'created_at', 'updated_at',
  //         'fedaco_through_key'
  //       ]);
  //   }
  // });

  it('each returns correct models', async () => {
    await seedData();
    await seedDataExtended();
    const country = await HasManyThroughTestCountry.createQuery().find(2);
    await country
      .NewRelation('posts')
      .each()
      .pipe(
        tap(({ item: post }) => {
          expect(Object.keys(post.GetAttributes())).toEqual([
            'id',
            'user_id',
            'title',
            'body',
            'email',
            'created_at',
            'updated_at',
            'fedaco_through_key',
          ]);
        }),
      )
      .toPromise();
  });

  it('intermediate soft deletes are ignored', async () => {
    await seedData();
    await (await HasManyThroughSoftDeletesTestUser.createQuery().first()).Delete();
    const posts = await (await HasManyThroughSoftDeletesTestCountry.createQuery().first()).posts;
    expect(posts[0].title).toBe('A title');
    expect(posts).toHaveLength(2);
  });

  it('eager loading loads related models correctly', async () => {
    await seedData();
    const country = await HasManyThroughSoftDeletesTestCountry.createQuery().with('posts').first();
    expect(country.shortname).toBe('us');
    expect((await country.posts)[0].title).toBe('A title');
    expect(country.posts).toHaveLength(2);
  });
});

/* Eloquent Models... */
export class HasManyThroughTestUser extends Model {
  _table: any = 'users';
  _guarded: any = [];

  @HasManyColumn({
    related   : forwardRef(() => HasManyThroughTestPost),
    foreignKey: 'user_id',
  })
  public posts: FedacoRelationListType<HasManyThroughTestPost>;
}

/* Eloquent Models... */
export class HasManyThroughTestPost extends Model {
  _table: any = 'posts';
  _guarded: any = [];

  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @BelongsToColumn({
    related   : HasManyThroughTestUser,
    foreignKey: 'user_id',
  })
  public owner: FedacoRelationType<HasManyThroughTestUser>;
}

export class HasManyThroughTestCountry extends Model {
  _table: any = 'countries';
  _guarded: any = [];

  @HasManyThroughColumn({
    related  : HasManyThroughTestPost,
    through  : HasManyThroughTestUser,
    firstKey : 'country_id',
    secondKey: 'user_id',
  })
  public posts: FedacoRelationListType<HasManyThroughTestPost>;

  @HasManyColumn({
    related   : HasManyThroughTestUser,
    foreignKey: 'country_id',
  })
  public users: FedacoRelationListType<HasManyThroughTestUser>;
}

/* Eloquent Models... */
export class HasManyThroughDefaultTestUser extends Model {
  _table: any = 'users_default';
  _guarded: any = [];

  @HasManyColumn({
    related: forwardRef(() => HasManyThroughDefaultTestPost),
  })
  public posts: FedacoRelationListType<HasManyThroughDefaultTestPost>;
}

/* Eloquent Models... */
export class HasManyThroughDefaultTestPost extends Model {
  _table: any = 'posts_default';
  _guarded: any = [];

  @Column()
  title: string;

  @BelongsToColumn({
    related: HasManyThroughDefaultTestUser,
  })
  public owner: FedacoRelationType<HasManyThroughDefaultTestUser>;
}

export class HasManyThroughDefaultTestCountry extends Model {
  _table: any = 'countries_default';
  _guarded: any = [];

  @HasManyThroughColumn({
    related: HasManyThroughDefaultTestPost,
    through: HasManyThroughDefaultTestUser,
  })
  public posts: FedacoRelationListType<HasManyThroughDefaultTestPost>;

  @HasManyColumn({
    related: HasManyThroughDefaultTestUser,
  })
  public users: FedacoRelationListType<HasManyThroughDefaultTestUser>;
}

export class HasManyThroughIntermediateTestCountry extends Model {
  _table: any = 'countries';
  _guarded: any = [];

  @HasManyThroughColumn({
    related       : HasManyThroughTestPost,
    through       : HasManyThroughTestUser,
    firstKey      : 'country_short',
    secondKey     : 'email',
    localKey      : 'shortname',
    secondLocalKey: 'email',
  })
  public posts: FedacoRelationListType<HasManyThroughTestPost>;

  @HasManyColumn({
    related   : HasManyThroughTestUser,
    foreignKey: 'country_id',
  })
  public users: FedacoRelationListType<HasManyThroughTestUser>;
}

export class HasManyThroughSoftDeletesTestUser extends (mixinSoftDeletes<any>(Model) as typeof Model) {
  _table: any = 'users';
  _guarded: any = [];

  @HasManyColumn({
    related   : forwardRef(() => HasManyThroughSoftDeletesTestPost),
    foreignKey: 'user_id',
  })
  public posts: FedacoRelationListType<HasManyThroughSoftDeletesTestPost>;

  @DeletedAtColumn()
  deleted_at: Date;
}

/* Eloquent Models... */
export class HasManyThroughSoftDeletesTestPost extends Model {
  _table: any = 'posts';
  _guarded: any = [];

  @Column()
  title: string;

  @BelongsToColumn({
    related   : HasManyThroughSoftDeletesTestUser,
    foreignKey: 'user_id',
  })
  public owner: FedacoRelationType<HasManyThroughSoftDeletesTestUser>;
}

export class HasManyThroughSoftDeletesTestCountry extends Model {
  _table: any = 'countries';
  _guarded: any = [];

  @Column()
  shortname: string;

  @HasManyThroughColumn({
    related  : HasManyThroughSoftDeletesTestPost,
    through  : HasManyThroughTestUser,
    firstKey : 'country_id',
    secondKey: 'user_id',
  })
  public posts: FedacoRelationListType<HasManyThroughSoftDeletesTestPost>;

  @HasManyColumn({
    related   : HasManyThroughSoftDeletesTestUser,
    foreignKey: 'country_id',
  })
  public users: FedacoRelationListType<HasManyThroughSoftDeletesTestUser>;
}

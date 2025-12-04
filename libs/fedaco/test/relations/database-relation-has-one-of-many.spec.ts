import { format } from 'date-fns';
import { Table } from '../../src/annotation/table/table';
import { head } from '@gradii/nanofn';
import { DatetimeColumn } from '../../src/annotation/column/datetime.column';
import { PrimaryGeneratedColumn } from '../../src/annotation/column/primary-generated.column';
import { HasManyColumn } from '../../src/annotation/relation-column/has-many.relation-column';
import { HasOneColumn } from '../../src/annotation/relation-column/has-one.relation-column';
import { HasOneOfManyColumn } from '../../src/annotation/relation-column/one-of-many/has-one-of-many.relation-column';
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
  });
  await schema().create('logins', (table) => {
    table.increments('id');
    table.foreignId('user_id');
    table.dateTime('deleted_at').withNullable();
  });
  await schema().create('states', (table) => {
    table.increments('id');
    table.string('state');
    table.string('type');
    table.foreignId('user_id');
  });
  await schema().create('prices', (table) => {
    table.increments('id');
    table.dateTime('published_at');
    table.foreignId('user_id');
  });
}

describe('test database fedaco has one of many', () => {
  beforeEach(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      driver  : 'sqlite',
      database: ':memory:',
      // driver: 'mysql',
      // database: 'default',
      // host: 'localhost',
      // username: 'root',
      // password: '123456'
    });
    db.bootFedaco();
    db.setAsGlobal();
    await createSchema();
  });

  // afterEach(async () => {
  //   await DatabaseConfig.table('users').truncate();
  //   await DatabaseConfig.table('logins').truncate();
  //   await DatabaseConfig.table('states').truncate();
  //   await DatabaseConfig.table('prices').truncate();
  // });

  afterEach(async () => {
    await schema().drop('users');
    await schema().drop('logins');
    await schema().drop('states');
    await schema().drop('prices');
  });

  it('it guesses relation name', async () => {
    const user = new HasOneOfManyTestUser();
    expect(user.NewRelation('latest_login').getRelationName()).toBe('latest_login_of_many');
  });

  it('it guesses relation name and adds of many when table name is relation name', () => {
    const model = new HasOneOfManyTestUser();
    expect(model.NewRelation('logins').getRelationName()).toBe('logins_of_many');
  });

  it('relation name can be set', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    let relation = user.NewRelation('latest_login').ofMany('id', 'max', 'foo');
    expect(relation.getRelationName()).toBe('foo');
    relation = user.NewRelation('latest_login').latestOfMany('id', 'bar');
    expect(relation.getRelationName()).toBe('bar');
    relation = user.NewRelation('latest_login').oldestOfMany('id', 'baz');
    expect(relation.getRelationName()).toBe('baz');
  });

  it('eager loading applies constraints to inner join sub query', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    const relation = user.NewRelation('latest_login');
    relation.addEagerConstraints([user]);
    expect(relation.getOneOfManySubQuery().toSql()).toEqual({
      result:
        'SELECT MAX("id") AS "id", "logins"."user_id" FROM "logins" WHERE "logins"."user_id" = ? AND "logins"."user_id" IS NOT NULL AND "logins"."user_id" IN (?) GROUP BY "logins"."user_id"',
      bindings: [1, 1],
    });
  });

  it('qualifying sub select column', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    expect(user.NewRelation('latest_login')._qualifySubSelectColumn('id')).toBe('latest_login_of_many.id');
  });

  it('it fails when using invalid aggregate', async () => {
    const user = new HasOneOfManyTestUser();
    expect(() => {
      user.NewRelation('latest_login_with_invalid_aggregate');
    }).toThrow(
      `InvalidArgumentException Invalid aggregate [count] used within ofMany relation. Available aggregates: MIN, MAX`,
    );
  });

  it('it gets correct results', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    const previousLogin = await user.NewRelation('logins').create();
    const latestLogin = await user.NewRelation('logins').create();
    const result = await user.NewRelation('latest_login').getResults();
    expect(result).not.toBeNull();
    expect(result.id).toEqual(latestLogin.id);
  });

  it('it gets correct results using shortcut method', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    const previousLogin = await user.NewRelation('logins').create();
    const latestLogin = await user.NewRelation('logins').create();
    const result = await user.NewRelation('latest_login_with_shortcut').getResults();
    expect(result).not.toBeNull();
    expect(result.id).toEqual(latestLogin.id);
  });

  it('it gets correct results using shortcut receiving multiple columns method', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    await user.NewRelation('prices').create({
      published_at: '2021-05-01 00:00:00',
    });
    const price = await user.NewRelation('prices').create({
      published_at: '2021-05-01 00:00:00',
    });
    const result = await user.NewRelation('price_with_shortcut').getResults();
    expect(result).not.toBeNull();
    expect(result.id).toEqual(price.id);
  });

  it('key is added to aggregates when missing', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    await user.NewRelation('prices').create({
      published_at: '2021-05-01 00:00:00',
    });
    const price = await user.NewRelation('prices').create({
      published_at: '2021-05-01 00:00:00',
    });
    const result = await user.NewRelation('price_without_key_in_aggregates').getResults();
    expect(result).not.toBeNull();
    expect(result.id).toEqual(price.id);
  });

  it('it gets with constraints correct results', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    const previousLogin = await user.NewRelation('logins').create();
    await user.NewRelation('logins').create();
    const result = await user.NewRelation('latest_login').whereKey(previousLogin.GetKey()).getResults();
    expect(result).toBeNull();
  });

  it('it eager loads correct models', async () => {
    let user = await HasOneOfManyTestUser.createQuery().create();
    await user.NewRelation('logins').create();
    const latestLogin = await user.NewRelation('logins').create();
    user = await HasOneOfManyTestUser.createQuery().with('latest_login').first();
    expect(user.RelationLoaded('latest_login')).toBeTruthy();
    expect((user.latest_login as HasOneOfManyTestLogin).id).toEqual(latestLogin.id);
  });

  it('has nested', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    const previousLogin = await user.NewRelation('logins').create();
    const latestLogin = await user.NewRelation('logins').create();
    let found = await HasOneOfManyTestUser.createQuery()
      .whereHas('latest_login', (query) => {
        query.where('logins.id', latestLogin.id);
      })
      .exists();
    expect(found).toBeTruthy();
    found = await HasOneOfManyTestUser.createQuery()
      .whereHas('latest_login', (query) => {
        query.where('logins.id', previousLogin.id);
      })
      .exists();
    expect(found).toBeFalsy();
  });

  it('has count', async () => {
    let user = await HasOneOfManyTestUser.createQuery().create();
    await user.NewRelation('logins').create();
    await user.NewRelation('logins').create();
    user = await HasOneOfManyTestUser.createQuery().withCount('latest_login').first();
    expect(user.GetAttribute('latest_login_count')).toEqual(1);
  });

  it('exists', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    const previousLogin = await user.NewRelation('logins').create();
    const latestLogin = await user.NewRelation('logins').create();
    expect(await user.NewRelation('latest_login').whereKey(previousLogin.GetKey()).exists()).toBeFalsy();
    expect(await user.NewRelation('latest_login').whereKey(latestLogin.GetKey()).exists()).toBeTruthy();
  });

  it('is method', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    const login1 = await user.NewRelation('latest_login').create();
    const login2 = await user.NewRelation('latest_login').create();
    expect(await user.NewRelation('latest_login').is(login1)).toBeFalsy();
    expect(await user.NewRelation('latest_login').is(login2)).toBeTruthy();
  });

  it('is not method', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    const login1 = await user.NewRelation('latest_login').create();
    const login2 = await user.NewRelation('latest_login').create();
    expect(await user.NewRelation('latest_login').isNot(login1)).toBeTruthy();
    expect(await user.NewRelation('latest_login').isNot(login2)).toBeFalsy();
  });

  it('get', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    const previousLogin = await user.NewRelation('logins').create();
    const latestLogin = await user.NewRelation('logins').create();
    let latestLogins = await user.NewRelation('latest_login').get();
    expect(latestLogins).toHaveLength(1);
    expect(head(latestLogins as any[]).id).toEqual(latestLogin.id);
    latestLogins = await user.NewRelation('latest_login').whereKey(previousLogin.GetKey()).get();
    expect(latestLogins).toHaveLength(0);
  });

  it('count', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    await user.NewRelation('logins').create();
    await user.NewRelation('logins').create();
    expect(await user.NewRelation('latest_login').count()).toEqual(1);
  });

  it('aggregate', async () => {
    let user = await HasOneOfManyTestUser.createQuery().create();
    const firstLogin = await user.NewRelation('logins').create();
    await user.NewRelation('logins').create();
    user = await HasOneOfManyTestUser.createQuery().first();
    expect((await user.first_login).id).toEqual(firstLogin.id);
  });

  it('join constraints', async () => {
    let user = await HasOneOfManyTestUser.createQuery().create();
    await user.NewRelation('states').create({
      type : 'foo',
      state: 'draft',
    });
    const currentForState = await user.NewRelation('states').create({
      type : 'foo',
      state: 'active',
    });
    await user.NewRelation('states').create({
      type : 'bar',
      state: 'baz',
    });
    user = await HasOneOfManyTestUser.createQuery().first();
    expect((user.foo_state as HasOneOfManyTestState).id).toEqual(currentForState.id);
  });

  it('multiple aggregates', async () => {
    let user = await HasOneOfManyTestUser.createQuery().create();
    await user.NewRelation('prices').create({
      published_at: '2021-05-01 00:00:00',
    });
    const price = await user.NewRelation('prices').create({
      published_at: '2021-05-01 00:00:00',
    });
    user = await HasOneOfManyTestUser.createQuery().first();
    expect((user.price as HasOneOfManyTestPrice).id).toEqual(price.id);
  });

  it('eager loading with multiple aggregates', async () => {
    const user1 = await HasOneOfManyTestUser.createQuery().create();
    const user2 = await HasOneOfManyTestUser.createQuery().create();
    await user1.NewRelation('prices').create({
      published_at: '2021-05-01 00:00:00',
    });
    const user1Price = await user1.NewRelation('prices').create({
      published_at: '2021-05-01 00:00:00',
    });
    await user1.NewRelation('prices').create({
      published_at: '2021-04-01 00:00:00',
    });
    const user2Price = await user2.NewRelation('prices').create({
      published_at: '2021-05-01 00:00:00',
    });
    await user2.NewRelation('prices').create({
      published_at: '2021-04-01 00:00:00',
    });
    const users = await HasOneOfManyTestUser.createQuery().with('price').get();
    expect(users[0].price).not.toBeNull();
    expect((users[0].price as HasOneOfManyTestPrice).id).toEqual(user1Price.id);
    expect(users[1].price).not.toBeNull();
    expect((users[1].price as HasOneOfManyTestPrice).id).toEqual(user2Price.id);
  });

  it('with exists', async () => {
    await HasOneOfManyTestUser.createQuery().create();
    let user = await HasOneOfManyTestUser.createQuery().withExists('latest_login').first();
    expect(user.GetAttribute('latest_login_exists')).toBeFalsy();
    await user.NewRelation('logins').create();
    user = await HasOneOfManyTestUser.createQuery().withExists('latest_login').first();
    expect(user.GetAttribute('latest_login_exists')).toBeTruthy();
  });

  it('with exists with constraints in join sub select', async () => {
    await HasOneOfManyTestUser.createQuery().create();
    let user = await HasOneOfManyTestUser.createQuery().withExists('foo_state').first();
    expect(user.GetAttribute('foo_state_exists')).toBeFalsy();
    await user.NewRelation('states').create({
      type : 'foo',
      state: 'bar',
    });
    user = await HasOneOfManyTestUser.createQuery().withExists('foo_state').first();
    expect(user.GetAttribute('foo_state_exists')).toBeTruthy();
  });

  it('with soft deletes', async () => {
    const user = await HasOneOfManyTestUser.createQuery().create();
    await user.NewRelation('logins').create();
    await user.latest_login_with_soft_deletes;
    expect(user.latest_login_with_soft_deletes).not.toBeNull();
  });
});

/* Eloquent Models... */
@Table({
  tableName: 'users',
})
export class HasOneOfManyTestUser extends Model {
  // _table: any      = 'users';
  _guarded: any = [];
  _timestamps: any = false;

  @HasOneOfManyColumn({
    related   : forwardRef(() => HasOneOfManyTestLogin),
    foreignKey: 'user_id',
  })
  public logins: FedacoRelationType<HasOneOfManyTestLogin>;

  @HasOneOfManyColumn({
    related   : forwardRef(() => HasOneOfManyTestLogin),
    foreignKey: 'user_id',
  })
  public latest_login: FedacoRelationType<HasOneOfManyTestLogin>;

  @HasOneOfManyColumn({
    related   : forwardRef(() => HasOneOfManyTestLoginWithSoftDeletes),
    foreignKey: 'user_id',
  })
  public latest_login_with_soft_deletes: FedacoRelationType<HasOneOfManyTestLoginWithSoftDeletes>;

  @HasOneOfManyColumn({
    related   : forwardRef(() => HasOneOfManyTestLogin),
    foreignKey: 'user_id',
    aggregate : 'latest',
  })
  public latest_login_with_shortcut: FedacoRelationType<HasOneOfManyTestLogin>;

  @HasOneOfManyColumn({
    related   : forwardRef(() => HasOneOfManyTestLogin),
    foreignKey: 'user_id',
    column    : 'id',
    aggregate : 'count',
  })
  public latest_login_with_invalid_aggregate: FedacoRelationType<HasOneOfManyTestLogin>;

  @HasOneOfManyColumn({
    related   : forwardRef(() => HasOneOfManyTestLogin),
    foreignKey: 'user_id',
    column    : 'id',
    aggregate : 'min',
  })
  public first_login: FedacoRelationType<HasOneOfManyTestLogin>;

  @HasManyColumn({
    related   : forwardRef(() => HasOneOfManyTestState),
    foreignKey: 'user_id',
  })
  public states: FedacoRelationListType<HasOneOfManyTestState>;

  @HasOneOfManyColumn({
    related   : forwardRef(() => HasOneOfManyTestState),
    foreignKey: 'user_id',
    column    : {
      id: 'max',
    },
    aggregate: (q) => {
      q.where('type', 'foo');
    },
  })
  public foo_state: FedacoRelationType<HasOneOfManyTestState>;

  @HasManyColumn({
    related   : forwardRef(() => HasOneOfManyTestPrice),
    foreignKey: 'user_id',
  })
  public prices: FedacoRelationListType<HasOneOfManyTestPrice>;

  @HasOneOfManyColumn({
    related   : forwardRef(() => HasOneOfManyTestPrice),
    foreignKey: 'user_id',
    column    : {
      published_at: 'max',
      id          : 'max',
    },
    aggregate: (q) => {
      q.where('published_at', '<', format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
    },
  })
  public price: FedacoRelationType<HasOneOfManyTestPrice>;

  @HasOneOfManyColumn({
    related   : forwardRef(() => HasOneOfManyTestPrice),
    foreignKey: 'user_id',
    column    : {
      published_at: 'MAX',
    },
  })
  public price_without_key_in_aggregates: FedacoRelationListType<HasOneOfManyTestPrice>;

  @HasOneColumn({
    related   : forwardRef(() => HasOneOfManyTestPrice),
    foreignKey: 'user_id',
    onQuery   : (q) => {
      q.latestOfMany(['published_at', 'id']);
    },
  })
  public price_with_shortcut: FedacoRelationType<HasOneOfManyTestPrice>;
}

export class HasOneOfManyTestModel extends Model {
  @HasOneOfManyColumn({
    related: forwardRef(() => HasOneOfManyTestLogin),
  })
  public logins: FedacoRelationListType<HasOneOfManyTestLogin>;
}

export class HasOneOfManyTestLogin extends Model {
  _table: any = 'logins';
  _guarded: any = [];
  _timestamps: any = false;

  @PrimaryGeneratedColumn()
  id: string | number;
}

export class HasOneOfManyTestLoginWithSoftDeletes extends mixinSoftDeletes<any>(Model) {
  _table: any = 'logins';
  _guarded: any = [];
  _timestamps: any = false;
}

export class HasOneOfManyTestState extends Model {
  _table: any = 'states';
  _guarded: any = [];
  _timestamps: any = false;
  _fillable: any = ['type', 'state'];
}

export class HasOneOfManyTestPrice extends Model {
  _table: any = 'prices';
  _guarded: any = [];
  _timestamps: any = false;
  _fillable: any = ['published_at'];
  // protected casts: any = {
  //   'published_at': 'datetime'
  // };

  @DatetimeColumn()
  published_at: Date;
}

import { head } from 'ramda';
import { tap } from 'rxjs/operators';
import { Column } from '../../src/annotation/column/column';
import { DeletedAtColumn } from '../../src/annotation/column/deleted-at.column';
import { BelongsToColumn } from '../../src/annotation/relation-column/belongs-to.relation-column';
import {
  HasOneThroughColumn
} from '../../src/annotation/relation-column/has-one-through.relation-column';
import { HasOneColumn } from '../../src/annotation/relation-column/has-one.relation-column';
import { DatabaseConfig } from '../../src/database-config';
import { FedacoRelationType } from '../../src/fedaco/fedaco-types';
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
  await schema().create('users', table => {
    table.increments('id');
    table.string('email').withUnique();
    table.unsignedInteger('position_id').withUnique().withNullable();
    table.string('position_short');
    table.timestamps();
    table.softDeletes();
  });
  await schema().create('contracts', table => {
    table.increments('id');
    table.integer('user_id').withUnique();
    table.string('title');
    table.text('body');
    table.string('email');
    table.timestamps();
  });
  await schema().create('positions', table => {
    table.increments('id');
    table.string('name');
    table.string('shortname');
    table.timestamps();
  });
}


async function seedData() {
  const position = await HasOneThroughTestPosition.createQuery().create({
    'id'       : 1,
    'name'     : 'President',
    'shortname': 'ps'
  });
  const user     = await position.NewRelation('user').create({
    'id'            : 1,
    'email'         : 'linbolen@gradii.com',
    'position_short': 'ps'
  });
  await user.NewRelation('contract').create({
    'title': 'A title',
    'body' : 'A body',
    'email': 'linbolen@gradii.com'
  });
}

async function seedDataExtended() {
  const position = await HasOneThroughTestPosition.createQuery().create({
    'id'       : 2,
    'name'     : 'Vice President',
    'shortname': 'vp'
  });
  const user     = await position.NewRelation('user').create({
    'id'            : 2,
    'email'         : 'example1@gmail.com',
    'position_short': 'vp'
  });
  await user.NewRelation('contract').create({
    'title': 'Example1 title1',
    'body' : 'Example1 body1',
    'email': 'example1contract1@gmail.com'
  });
}

async function seedDefaultData() {
  const position = await HasOneThroughDefaultTestPosition.createQuery().create({
    'id'  : 1,
    'name': 'President'
  });
  const user     = await position.NewRelation('user').create({
    'id'   : 1,
    'email': 'linbolen@gradii.com'
  });
  await user.NewRelation('contract').create({
    'title': 'A title',
    'body' : 'A body'
  });
}

async function resetDefault() {
  await schema().drop('users_default');
  await schema().drop('contracts_default');
  await schema().drop('positions_default');
}

async function migrateDefault() {
  await schema().create('users_default', table => {
    table.increments('id');
    table.string('email').withUnique();
    table.unsignedInteger('positions_default_id').withUnique().withNullable();
    table.timestamps();
  });
  await schema().create('contracts_default', table => {
    table.increments('id');
    table.integer('users_default_id').withUnique();
    table.string('title');
    table.text('body');
    table.timestamps();
  });
  await schema().create('positions_default', table => {
    table.increments('id');
    table.string('name');
    table.timestamps();
  });
}

describe('test database fedaco has one through integration', () => {
  beforeEach(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      'driver'  : 'sqlite',
      'database': ':memory:'
    });
    db.bootFedaco();
    db.setAsGlobal();
    await createSchema();
  });

  afterEach(async () => {
    await schema().drop('users');
    await schema().drop('contracts');
    await schema().drop('positions');
  });

  it('it loads a has one through relation with custom keys', async () => {
    await seedData();
    const contract = await (await HasOneThroughTestPosition.createQuery().first()).contract;
    expect(contract.title).toBe('A title');
  });

  it('it loads a default has one through relation', async () => {
    await migrateDefault();
    await seedDefaultData();
    const contract = await (await HasOneThroughDefaultTestPosition.createQuery().first()).contract;
    expect(contract.title).toBe('A title');
    expect('email' in contract.GetAttributes()).not.toBeTruthy();
    await resetDefault();
  });

  it('it loads a relation with custom intermediate and local key', async () => {
    await seedData();
    const contract = await (await HasOneThroughIntermediateTestPosition.createQuery().first()).contract;
    expect(contract.title).toBe('A title');
  });

  it('eager loading a relation with custom intermediate and local key', async () => {
    await seedData();
    const contract = (await HasOneThroughIntermediateTestPosition.createQuery().with(
      'contract').first()).contract;
    expect((contract as HasOneThroughTestContract).title).toBe('A title');
  });

  it('where has on a relation with custom intermediate and local key', async () => {
    await seedData();
    const position = await HasOneThroughIntermediateTestPosition.createQuery().whereHas('contract',
      query => {
        query.where('title', 'A title');
      }).get();
    expect(position).toHaveLength(1);
  });

  it('first or fail throws an exception', async () => {
    const position = await HasOneThroughTestPosition.createQuery().create({
      'id'       : 1,
      'name'     : 'President',
      'shortname': 'ps'
    });
    await position.NewRelation('user').create({
      'id'            : 1,
      'email'         : 'linbolen@gradii.com',
      'position_short': 'ps'
    });
    await expect(async () => {
      await (await HasOneThroughTestPosition.createQuery().first()).NewRelation(
        'contract').firstOrFail();
    }).rejects.toThrowError(
      'ModelNotFoundException No query results for model [HasOneThroughTestContract].');
  });

  it('find or fail throws an exception', async () => {
    const position = await HasOneThroughTestPosition.createQuery().create({
      'id'       : 1,
      'name'     : 'President',
      'shortname': 'ps'
    });
    await position.NewRelation('user').create({
      'id'            : 1,
      'email'         : 'linbolen@gradii.com',
      'position_short': 'ps'
    });
    await expect(async () => {
      await (await HasOneThroughTestPosition.createQuery().first()).NewRelation(
        'contract').findOrFail(1);
    }).rejects.toThrowError('ModelNotFoundException');
  });

  it('first retrieves first record', async () => {
    await seedData();
    const contract = await (await HasOneThroughTestPosition.createQuery().first()).NewRelation(
      'contract').first();
    expect(contract).not.toBeNull();
    expect(contract.title).toBe('A title');
  });

  it('all columns are retrieved by default', async () => {
    await seedData();
    const contract = await (await HasOneThroughTestPosition.createQuery().first()).NewRelation(
      'contract').first();
    expect(Object.keys(contract.GetAttributes())).toEqual(
      [
        'id', 'user_id', 'title', 'body', 'email', 'created_at', 'updated_at', 'fedaco_through_key'
      ]);
  });

  it('only proper columns are selected if provided', async () => {
    await seedData();
    const contract = await (await HasOneThroughTestPosition.createQuery().first()).NewRelation(
      'contract').first(['title', 'body']);
    expect(Object.keys(contract.GetAttributes())).toEqual(['title', 'body', 'fedaco_through_key']);
  });

  it('chunk returns correct models', async () => {
    await seedData();
    await seedDataExtended();
    const position = await HasOneThroughTestPosition.createQuery().find(1);
    await position.NewRelation('contract').chunk(10)
      .pipe(
        tap(({results: contractsChunk}) => {
          const contract = head(contractsChunk as Model[]);
          expect(Object.keys(contract.GetAttributes())).toEqual([
            'id', 'user_id', 'title', 'body', 'email', 'created_at', 'updated_at',
            'fedaco_through_key'
          ]);
        })).toPromise();
  });

  // it('cursor returns correct models', async () => {
  //   await seedData();
  //   await seedDataExtended();
  //   const position  = await HasOneThroughTestPosition.createQuery().find(1);
  //   const contracts = position.newRelation('contract').cursor();
  //   for (const contract of contracts) {
  //     expect(Object.keys(contract.getAttributes())).toEqual(
  //       [
  //         'id', 'user_id', 'title', 'body', 'email', 'created_at', 'updated_at',
  //         'laravel_through_key'
  //       ]);
  //   }
  // });

  it('each returns correct models', async () => {
    await seedData();
    await seedDataExtended();
    const position = await HasOneThroughTestPosition.createQuery().find(1);
    await position.NewRelation('contract').each().pipe(
      tap(({item: contract}) => {
        expect(Object.keys(contract.getAttributes())).toEqual([
          'id', 'user_id', 'title', 'body', 'email', 'created_at', 'updated_at',
          'fedaco_through_key'
        ]);
      })
    );
  });

  it('intermediate soft deletes are ignored', async () => {
    await seedData();
    await (await HasOneThroughSoftDeletesTestUser.createQuery().first()).Delete();
    const contract = await (await HasOneThroughSoftDeletesTestPosition.createQuery().first()).contract;
    expect((contract as HasOneThroughSoftDeletesTestContract).title).toBe('A title');
  });

  it('eager loading loads related models correctly', async () => {
    await seedData();
    const position = await HasOneThroughSoftDeletesTestPosition.createQuery()
      .with('contract')
      .first();
    expect(position.shortname).toBe('ps');
    expect((position.contract as HasOneThroughSoftDeletesTestContract).title).toBe('A title');
  });

});

/*Eloquent Models...*/
export class HasOneThroughTestUser extends Model {
  _table: any   = 'users';
  _guarded: any = [];

  @HasOneColumn({
    related   : forwardRef(() => HasOneThroughTestContract),
    foreignKey: 'user_id'
  })
  public contract: FedacoRelationType<HasOneThroughTestContract>;
}

/*Eloquent Models...*/
export class HasOneThroughTestContract extends Model {
  _table: any   = 'contracts';
  _guarded: any = [];

  @Column()
  title: string;

  @BelongsToColumn({
    related   : HasOneThroughTestUser,
    foreignKey: 'user_id'
  })
  public owner: FedacoRelationType<HasOneThroughTestUser>;
}

export class HasOneThroughTestPosition extends Model {
  _table: any   = 'positions';
  _guarded: any = [];

  @HasOneThroughColumn({
    related  : HasOneThroughTestContract,
    through  : HasOneThroughTestUser,
    firstKey : 'position_id',
    secondKey: 'user_id'
  })
  public contract: FedacoRelationType<HasOneThroughTestContract>;

  @HasOneColumn({
    related   : HasOneThroughTestUser,
    foreignKey: 'position_id'
  })
  public user: FedacoRelationType<HasOneThroughTestUser>;
}

/*Eloquent Models...*/
export class HasOneThroughDefaultTestUser extends Model {
  _table: any   = 'users_default';
  _guarded: any = [];

  @HasOneColumn({
    related: forwardRef(() => HasOneThroughDefaultTestContract)
  })
  public contract: FedacoRelationType<HasOneThroughDefaultTestContract>;
}

/*Eloquent Models...*/
export class HasOneThroughDefaultTestContract extends Model {
  _table: any   = 'contracts_default';
  _guarded: any = [];

  @Column()
  title: string;

  @BelongsToColumn({
    related: HasOneThroughDefaultTestUser
  })
  public owner: FedacoRelationType<HasOneThroughDefaultTestUser>;
}

export class HasOneThroughDefaultTestPosition extends Model {
  _table: any   = 'positions_default';
  _guarded: any = [];

  @HasOneThroughColumn({
    related: HasOneThroughDefaultTestContract,
    through: HasOneThroughDefaultTestUser,
  })
  public contract: FedacoRelationType<HasOneThroughDefaultTestContract>;

  @HasOneColumn({
    related: HasOneThroughDefaultTestUser
  })
  public user: FedacoRelationType<HasOneThroughDefaultTestUser>;
}

export class HasOneThroughIntermediateTestPosition extends Model {
  _table: any   = 'positions';
  _guarded: any = [];

  @HasOneThroughColumn({
    related       : HasOneThroughTestContract,
    through       : HasOneThroughTestUser,
    firstKey      : 'position_short',
    secondKey     : 'email',
    localKey      : 'shortname',
    secondLocalKey: 'email'
  })
  public contract: FedacoRelationType<HasOneThroughTestContract>;

  @HasOneColumn({
    related   : HasOneThroughTestUser,
    foreignKey: 'position_id'
  })
  public user: FedacoRelationType<HasOneThroughTestUser>;
}

export class HasOneThroughSoftDeletesTestUser extends (mixinSoftDeletes<typeof Model>(
  Model) as typeof Model) {
  _table: any   = 'users';
  _guarded: any = [];

  @HasOneColumn({
    related   : forwardRef(() => HasOneThroughSoftDeletesTestContract),
    foreignKey: 'user_id'
  })
  public contract: FedacoRelationType<HasOneThroughSoftDeletesTestContract>;

  @DeletedAtColumn()
  deleted_at: Date;
}

/*Eloquent Models...*/
export class HasOneThroughSoftDeletesTestContract extends Model {
  _table: any   = 'contracts';
  _guarded: any = [];

  @Column()
  title: string;

  @BelongsToColumn({
    related   : HasOneThroughSoftDeletesTestUser,
    foreignKey: 'user_id'
  })
  public owner: FedacoRelationType<HasOneThroughSoftDeletesTestUser>;
}

export class HasOneThroughSoftDeletesTestPosition extends Model {
  _table: any   = 'positions';
  _guarded: any = [];

  @Column()
  shortname: string;

  @HasOneThroughColumn({
    related  : HasOneThroughSoftDeletesTestContract,
    through  : HasOneThroughTestUser,
    firstKey : 'position_id',
    secondKey: 'user_id'
  })
  public contract: FedacoRelationType<HasOneThroughSoftDeletesTestContract>;

  @HasOneColumn({
    related   : HasOneThroughSoftDeletesTestUser,
    foreignKey: 'position_id'
  })
  public user: FedacoRelationType<HasOneThroughSoftDeletesTestUser>;
}

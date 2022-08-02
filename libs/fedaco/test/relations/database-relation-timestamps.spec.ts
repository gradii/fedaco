import { format } from 'date-fns';
import { CreatedAtColumn } from '../../src/annotation/column/created-at.column';
import { UpdatedAtColumn } from '../../src/annotation/column/updated-at.column';
import { DatabaseConfig } from '../../src/database-config';
import { Model } from '../../src/fedaco/model';
import { SchemaBuilder } from '../../src/schema/schema-builder';

function connection(connectionName = 'default') {
  return Model.getConnectionResolver().connection(connectionName);
}

function schema(connectionName = 'default'): SchemaBuilder {
  return connection(connectionName).getSchemaBuilder();
}

async function createSchema() {
  await schema().create('users', table => {
    table.increments('id');
    table.string('email').withUnique();
    table.timestamps();
  });
  await schema().create('users_created_at', table => {
    table.increments('id');
    table.string('email').withUnique();
    table.string('created_at');
  });
  await schema().create('users_updated_at', table => {
    table.increments('id');
    table.string('email').withUnique();
    table.string('updated_at');
  });
}

describe('test database fedaco timestamps', () => {
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
    await schema().drop('users_created_at');
    await schema().drop('users_updated_at');
  });

  it('user with created at and updated at', async () => {
    const now  = new Date(format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
    const user = await UserWithCreatedAndUpdated.createQuery().create({
      'email': 'test@test.com'
    });
    expect(user.created_at).toEqual(now);
    expect(user.updated_at).toEqual(now);
  });

  it('user with created at', async () => {
    const now  = new Date(format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
    const user = await UserWithCreated.createQuery().create({
      'email': 'test@test.com'
    });
    expect(user.created_at).toEqual(now);
  });

  it('user with updated at', async () => {
    const now  = new Date(format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
    const user = await UserWithUpdated.createQuery().create({
      'email': 'test@test.com'
    });
    expect(user.updated_at).toEqual(now);
  });
});

/*Eloquent Models...*/
export class UserWithCreatedAndUpdated extends Model {
  _table: any   = 'users';
  _guarded: any = [];

  @CreatedAtColumn()
  created_at: Date;

  @UpdatedAtColumn()
  updated_at: Date;
}

export class UserWithCreated extends Model {
  _table: any               = 'users_created_at';
  _guarded: any             = [];
  protected dateFormat: any = 't';

  @CreatedAtColumn()
  created_at: Date;

  // @UpdatedAtColumn()
  // updated_at: Date;
}

export class UserWithUpdated extends Model {
  _table: any               = 'users_updated_at';
  _guarded: any             = [];
  protected dateFormat: any = 't';

  // @CreatedAtColumn()
  // created_at: Date;

  @UpdatedAtColumn()
  updated_at: Date;
}

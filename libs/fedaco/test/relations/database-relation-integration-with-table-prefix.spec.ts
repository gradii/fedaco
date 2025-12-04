import { isArray } from '@gradii/nanofn';
import { DatabaseConfig } from '../../src/database-config';
import { Model } from '../../src/fedaco/model';
import { type SchemaBuilder } from '../../src/schema/schema-builder';
import { EloquentTestUser } from '../fedaco-mysql-integration.spec';

function connection(connectionName = 'default') {
  return Model.getConnectionResolver().connection(connectionName);
}

function schema(connectionName = 'default'): SchemaBuilder {
  return connection(connectionName).getSchemaBuilder();
}

async function createSchema() {
  await schema('default').create('users', (table) => {
    table.increments('id');
    table.string('email');
    table.timestamps();
  });
  await schema('default').create('friends', (table) => {
    table.integer('user_id');
    table.integer('friend_id');
  });
  await schema('default').create('posts', (table) => {
    table.increments('id');
    table.integer('user_id');
    table.integer('parent_id').withNullable();
    table.string('name');
    table.timestamps();
  });
  await schema('default').create('photos', (table) => {
    table.increments('id');
    table.morphs('imageable');
    table.string('name');
    table.timestamps();
  });
}

describe('test database fedaco integration with table prefix', () => {
  beforeEach(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      driver  : 'sqlite',
      database: ':memory:',
    });
    db.bootFedaco();
    db.setAsGlobal();
    Model.getConnectionResolver().connection().setTablePrefix('prefix_');
    await createSchema();
  });

  it('basic model hydration', async () => {
    await EloquentTestUser.createQuery().create({
      email: 'linbolen@gradii.com',
    });
    await EloquentTestUser.createQuery().create({
      email: 'xsilen@gradii.com',
    });
    const models = await EloquentTestUser.createQuery().fromQuery('SELECT * FROM prefix_users WHERE email = ?', [
      'xsilen@gradii.com',
    ]);
    expect(isArray(models)).toBeTruthy();
    expect(models[0]).toBeInstanceOf(EloquentTestUser);
    expect(models[0].email).toBe('xsilen@gradii.com');
    expect(models).toHaveLength(1);
  });
});

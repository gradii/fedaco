import { faker } from '@faker-js/faker';
import { DatabaseConfig, schema } from '@gradii/fedaco';
import { Client } from 'pg';
import { PostgresqlUserModel } from './fixtures/postgresql.user.model';

describe('fedaco postgresql integration', () => {
  beforeAll(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      'driver'  : 'pgsql',
      'host'    : process.env.DB_HOST || '127.0.0.1',
      'port'    : process.env.PG_PORT || 5432,
      'database': process.env.DB_DATABASE || 'fedaco_test',
      'username': process.env.DB_USER || '',
      'password': process.env.DB_PASSWORD || '',
      'timezone': '+08:00'
    });
    db.bootFedaco();
    db.setAsGlobal();
  });

  afterAll(() => {

  });

  test('test init table', async () => {
    if (!await schema().hasTable('users')) {
      await schema().create('users', table => {
        table.increments('id');
        table.string('username');
        table.timestamps();
      });
    }
  });

  test('add user', async () => {
    const it = await PostgresqlUserModel.createQuery().create({
      username: 'Checking Account'
    });

    expect(it.id).toBeGreaterThan(0);
  });
});


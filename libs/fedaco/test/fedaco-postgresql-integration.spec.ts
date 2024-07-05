

import { DatabaseConfig, schema } from '@gradii/fedaco';

describe('fedaco postgresql integration', () => {
  beforeAll(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      'driver'  : 'pgsql',
      'host'    : process.env.DB_HOST || '127.0.0.1',
      'port'    : process.env.DB_PORT || 5432,
      'database': 'fedaco_test',
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
});
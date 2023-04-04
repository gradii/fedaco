import { DatabaseConfig } from '../src/database-config';
import { Model } from '../src/fedaco/model';
import { SchemaBuilder } from '../src/schema/schema-builder';

function connection(connectionName = 'default') {
  return Model.getConnectionResolver().connection(connectionName);
}

function schema(connectionName = 'default'): SchemaBuilder {
  return connection(connectionName).getSchemaBuilder();
}

jest.setTimeout(100000);

async function createSchema() {
  // await schema('default')
  //   .dropAllTables();

  await schema('default')
    .create('test_orders', table => {
      table.increments('id');
      table.string('item_type');
      table.integer('item_id');
      table.timestamps();
    });
}

let db: DatabaseConfig;
describe('schema operate', () => {

  beforeEach(async () => {

    db = new DatabaseConfig();
    db.addConnection({
      'driver'  : 'sqlite',
      'database': ':memory:'
    });
    db.bootFedaco();
    db.setAsGlobal();
  });

  it('get tables', async () => {
    await createSchema();
    const tableList = await schema().getAllTables();

    expect(tableList).toBeTruthy();
  });

  it('table exist', async () => {
    await createSchema();

    const tableExist = await schema('default').tablesExist('test_orders');

    expect(tableExist).toBe(true);
  });

});
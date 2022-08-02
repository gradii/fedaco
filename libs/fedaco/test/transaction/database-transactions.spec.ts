import { DatabaseConfig } from '../../src/database-config';
import { DatabaseTransactionsManager } from '../../src/database-transactions-manager';
import { Model } from '../../src/fedaco/model';
import { SchemaBuilder } from '../../src/schema/schema-builder';


function connection(connectionName = 'default') {
  return Model.getConnectionResolver().connection(connectionName);
}

function schema(connectionName = 'default'): SchemaBuilder {
  return connection(connectionName).getSchemaBuilder();
}

async function createSchema() {
  for (const connectionName of ['default', 'second_connection']) {
    await schema(connectionName).create('users', (table) => {
      table.increments('id');
      table.string('name').withNullable();
      table.string('value').withNullable();
    });
  }
}

describe('test database transactions', () => {
  beforeEach(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      'driver'  : 'sqlite',
      'database': ':memory:'
    });
    db.addConnection({
      'driver'  : 'sqlite',
      'database': ':memory:'
    }, 'second_connection');
    db.bootFedaco();
    db.setAsGlobal();
    await createSchema();
  });

  it('transaction is recorded and committed', async () => {
    const transactionManager = new DatabaseTransactionsManager();
    const spy1               = jest.spyOn(transactionManager, 'begin');
    const spy2               = jest.spyOn(transactionManager, 'commit');
    await connection().setTransactionManager(transactionManager);
    await connection().table('users').insert({
      'name' : 'zain',
      'value': 1
    });
    await connection().transaction(async () => {
      await connection().table('users').where({
        'name': 'zain'
      }).update({
        'value': 2
      });
    });

    expect(spy1).toBeCalledWith('default', 1);
    expect(spy2).toBeCalledWith('default');
  });

  it('transaction is recorded and committed using the separate methods', async () => {
    const transactionManager = new DatabaseTransactionsManager();
    const spy1               = jest.spyOn(transactionManager, 'begin');
    const spy2               = jest.spyOn(transactionManager, 'commit');
    await connection().setTransactionManager(transactionManager);
    await connection().table('users').insert({
      'name' : 'zain',
      'value': 1
    });
    await connection().beginTransaction();
    await connection().table('users').where({
      'name': 'zain'
    }).update({
      'value': 2
    });
    await connection().commit();
    expect(spy1).toBeCalledWith('default', 1);
    expect(spy2).toBeCalledWith('default');
  });

  it('nested transaction is recorded and committed', async () => {
    const transactionManager = new DatabaseTransactionsManager();
    const spy1               = jest.spyOn(transactionManager, 'begin');
    const spy2               = jest.spyOn(transactionManager, 'commit');
    connection().setTransactionManager(transactionManager);
    await connection().table('users').insert({
      'name' : 'zain',
      'value': 1
    });
    await connection().transaction(async () => {
      await connection().table('users').where({
        'name': 'zain'
      }).update({
        'value': 2
      });
      await connection().transaction(async () => {
        await connection().table('users').where({
          'name': 'zain'
        }).update({
          'value': 2
        });
      });
    });
    expect(spy1).toHaveBeenNthCalledWith(1, 'default', 1);
    expect(spy1).toHaveBeenNthCalledWith(2, 'default', 2);
    expect(spy1).toBeCalledTimes(2);
    expect(spy2).toBeCalledWith('default');
  });

  it('nested transaction is recorde for different connectionsd and committed', async () => {
    const transactionManager = new DatabaseTransactionsManager();
    const spy1               = jest.spyOn(transactionManager, 'begin');
    const spy2               = jest.spyOn(transactionManager, 'commit');
    connection().setTransactionManager(transactionManager);
    connection('second_connection').setTransactionManager(transactionManager);
    await connection().table('users').insert({
      'name' : 'zain',
      'value': 1
    });
    await connection().transaction(async () => {
      await connection().table('users').where({
        'name': 'zain'
      }).update({
        'value': 2
      });
      await connection('second_connection').transaction(async () => {
        await connection('second_connection')
          .table('users')
          .where({
            'name': 'zain'
          })
          .update({
            'value': 2
          });
        await connection('second_connection').transaction(async () => {
          await connection('second_connection')
            .table('users')
            .where({
              'name': 'zain'
            })
            .update({
              'value': 2
            });
        });
      });
    });

    expect(spy1).toHaveBeenNthCalledWith(1, 'default', 1);
    expect(spy1).toHaveBeenNthCalledWith(2, 'second_connection', 1);
    expect(spy1).toHaveBeenNthCalledWith(3, 'second_connection', 2);
    expect(spy1).toBeCalledTimes(3);

    expect(spy2).toHaveBeenNthCalledWith(1, 'second_connection');
    expect(spy2).toHaveBeenNthCalledWith(2, 'default');
    expect(spy2).toBeCalledTimes(2);

  });

  it('transaction is rolled back', async () => {
    const transactionManager = new DatabaseTransactionsManager();

    const spy1 = jest.spyOn(transactionManager, 'begin');
    const spy2 = jest.spyOn(transactionManager, 'rollback');
    const spy3 = jest.spyOn(transactionManager, 'commit');

    connection().setTransactionManager(transactionManager);
    await connection().table('users').insert({
      'name' : 'zain',
      'value': 1
    });
    try {
      await connection().transaction(async () => {
        await connection().table('users').where({
          'name': 'zain'
        }).update({
          'value': 2
        });
        throw new Error();
      });
    } catch (e) {
    }

    expect(spy1).toBeCalledWith('default', 1);
    expect(spy2).toBeCalledWith('default', 0);

    expect(spy3).not.toBeCalled();
  });

  it('transaction is rolled back using separate methods', async () => {
    const transactionManager = new DatabaseTransactionsManager();

    const spy1 = jest.spyOn(transactionManager, 'begin');
    const spy2 = jest.spyOn(transactionManager, 'rollback');
    const spy3 = jest.spyOn(transactionManager, 'commit');

    connection().setTransactionManager(transactionManager);
    await connection().table('users').insert({
      'name' : 'zain',
      'value': 1
    });
    await connection().beginTransaction();
    await connection().table('users').where({
      'name': 'zain'
    }).update({
      'value': 2
    });
    await connection().rollBack();

    expect(spy1).toBeCalledWith('default', 1);
    expect(spy2).toBeCalledWith('default', 0);

    expect(spy3).not.toBeCalled();
  });

  it('nested transactions are rolled back', async () => {
    const transactionManager = new DatabaseTransactionsManager();

    const spy1 = jest.spyOn(transactionManager, 'begin');
    const spy2 = jest.spyOn(transactionManager, 'rollback');
    const spy3 = jest.spyOn(transactionManager, 'commit');

    connection().setTransactionManager(transactionManager);
    await connection().table('users').insert({
      'name' : 'zain',
      'value': 1
    });
    try {
      await connection().transaction(async () => {
        await connection().table('users').where({
          'name': 'zain'
        }).update({
          'value': 2
        });
        await connection().transaction(async () => {
          await connection().table('users').where({
            'name': 'zain'
          }).update({
            'value': 2
          });
          throw new Error();
        });
      });
    } catch (e) {
    }

    expect(spy1).toHaveBeenNthCalledWith(1, 'default', 1);
    expect(spy1).toHaveBeenNthCalledWith(2, 'default', 2);
    expect(spy2).toHaveBeenNthCalledWith(1, 'default', 1);
    expect(spy2).toHaveBeenNthCalledWith(2, 'default', 0);

    expect(spy3).not.toBeCalled();
  });
});

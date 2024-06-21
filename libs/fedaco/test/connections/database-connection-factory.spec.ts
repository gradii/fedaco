import {
  BetterSqliteWrappedConnection
} from '../../src/connector/sqlite/better-sqlite/better-sqlite-wrapped-connection';
import { DatabaseConfig } from '../../src/database-config';

let db: DatabaseConfig;

class PDO {
}

describe('test database connection factory', () => {
  beforeEach(() => {
    db = new DatabaseConfig();
    db.addConnection({
      'driver'  : 'sqlite',
      'database': ':memory:'
    });
    db.addConnection({
      'url': 'sqlite:///:memory:'
    }, 'url');
    db.addConnection({
      'driver': 'sqlite',
      'read'  : {
        'database': ':memory:'
      },
      'write' : {
        'database': ':memory:'
      }
    }, 'read_write');
    db.setAsGlobal();
  });

  it('connection can be created', async () => {
    expect(await db.getConnection().getPdo()).toBeInstanceOf(BetterSqliteWrappedConnection);
    expect(await db.getConnection().getReadPdo()).toBeInstanceOf(BetterSqliteWrappedConnection);
    expect(await db.getConnection('read_write').getPdo()).toBeInstanceOf(BetterSqliteWrappedConnection);
    expect(await db.getConnection('read_write').getReadPdo()).toBeInstanceOf(
      BetterSqliteWrappedConnection);
    expect(await db.getConnection('url').getPdo()).toBeInstanceOf(BetterSqliteWrappedConnection);
    expect(await db.getConnection('url').getReadPdo()).toBeInstanceOf(BetterSqliteWrappedConnection);
  });

  it('connection from url has proper config', () => {
    db.addConnection({
      'url'           : 'mysql://root:pass@db/local?strict=true',
      'unix_socket'   : '',
      'charset'       : 'utf8mb4',
      'collation'     : 'utf8mb4_unicode_ci',
      'prefix'        : '',
      'prefix_indexes': true,
      'strict'        : false,
      'engine'        : null
    }, 'url-config');
    expect(db.getConnection('url-config').getConfig()).toEqual({
      'name'          : 'url-config',
      'driver'        : 'mysql',
      'database'      : 'local',
      'host'          : 'db',
      'username'      : 'root',
      'password'      : 'pass',
      'unix_socket'   : '',
      'charset'       : 'utf8mb4',
      'collation'     : 'utf8mb4_unicode_ci',
      'prefix'        : '',
      'prefix_indexes': true,
      'strict'        : true,
      'engine'        : null
    });
  });

  it('single connection not created until needed', () => {
    const connection = db.getConnection();
    // @ts-ignore
    expect(connection.pdo).not.toBeInstanceOf(PDO);
    // @ts-ignore
    expect(connection.readPdo).not.toBeInstanceOf(PDO);
  });

  it('read write connections not created until needed', () => {
    const connection = db.getConnection('read_write');
    // @ts-ignore
    expect(connection.pdo).not.toBeInstanceOf(PDO);
    // @ts-ignore
    expect(connection.readPdo).not.toBeInstanceOf(PDO);
  });

  it('sqlite foreign key constraints', async () => {
    db.addConnection({
      'url': 'sqlite:///:memory:?foreign_key_constraints=true'
    }, 'constraints_set');

    // init has a not important statement. it must be called
    db.getConnection('constraints_set');

    expect((await db.getConnection().select('PRAGMA foreign_keys'))[0].foreign_keys).toEqual(0);
    expect((await db.getConnection('constraints_set').select(
      'PRAGMA foreign_keys'
    ))[0].foreign_keys).toEqual(1);
  });

});

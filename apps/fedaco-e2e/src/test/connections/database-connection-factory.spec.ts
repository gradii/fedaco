import { DatabaseConfig } from '@gradii/fedaco';
import { BetterSqliteDriverConnection, betterSqliteDriver } from '@gradii/fedaco-sqlite-driver';
import { mysqlDriver } from '@gradii/fedaco-mysql-driver';

let db: DatabaseConfig;

class DriverConnectionStub {}

describe('test database connection factory', () => {
  beforeEach(() => {
    db = new DatabaseConfig();
    db.addConnection({
      driver: 'sqlite',
      factory: betterSqliteDriver(),
      database: ':memory:',
    });
    db.addConnection(
      {
        url: 'sqlite:///:memory:',
        factory: betterSqliteDriver(),
      },
      'url',
    );
    db.addConnection(
      {
        driver: 'sqlite',
        factory: betterSqliteDriver(),
        read: {
          database: ':memory:',
        },
        write: {
          database: ':memory:',
        },
      },
      'read_write',
    );
    db.setAsGlobal();
  });

  it('connection can be created', async () => {
    expect(await db.getConnection().getDriverConnection()).toBeInstanceOf(BetterSqliteDriverConnection);
    expect(await db.getConnection().getReadDriverConnection()).toBeInstanceOf(BetterSqliteDriverConnection);
    expect(await db.getConnection('read_write').getDriverConnection()).toBeInstanceOf(BetterSqliteDriverConnection);
    expect(await db.getConnection('read_write').getReadDriverConnection()).toBeInstanceOf(BetterSqliteDriverConnection);
    expect(await db.getConnection('url').getDriverConnection()).toBeInstanceOf(BetterSqliteDriverConnection);
    expect(await db.getConnection('url').getReadDriverConnection()).toBeInstanceOf(BetterSqliteDriverConnection);
  });

  it('connection from url has proper config', () => {
    const factory = mysqlDriver();
    db.addConnection(
      {
        url: 'mysql://root:pass@db/local?strict=true',
        factory: factory,
        unix_socket: '',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        prefix: '',
        prefix_indexes: true,
        strict: false,
        engine: null,
      },
      'url-config',
    );
    expect(db.getConnection('url-config').getConfig()).toEqual({
      name: 'url-config',
      driver: 'mysql',
      factory: factory,
      database: 'local',
      host: 'db',
      username: 'root',
      password: 'pass',
      unix_socket: '',
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
      prefix: '',
      prefix_indexes: true,
      strict: true,
      engine: null,
    });
  });

  it('single connection not created until needed', () => {
    const connection = db.getConnection();
    // @ts-ignore
    expect(connection.driverConnection).not.toBeInstanceOf(DriverConnectionStub);
    // @ts-ignore
    expect(connection.readDriverConnection).not.toBeInstanceOf(DriverConnectionStub);
  });

  it('read write connections not created until needed', () => {
    const connection = db.getConnection('read_write');
    // @ts-ignore
    expect(connection.driverConnection).not.toBeInstanceOf(DriverConnectionStub);
    // @ts-ignore
    expect(connection.readDriverConnection).not.toBeInstanceOf(DriverConnectionStub);
  });

  it('sqlite foreign key constraints', async () => {
    db.addConnection(
      {
        url: 'sqlite:///:memory:?foreign_key_constraints=true',
        factory: betterSqliteDriver(),
      },
      'constraints_set',
    );

    // init has a not important statement. it must be called
    await db.getConnection().getSchemaBuilder().disableForeignKeyConstraints();
    expect((await db.getConnection().select('PRAGMA foreign_keys'))[0].foreign_keys).toEqual(0);
    expect((await db.getConnection('constraints_set').select('PRAGMA foreign_keys'))[0].foreign_keys).toEqual(1);
  });
});

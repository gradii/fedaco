# Getting Started

This page documents how to configure and access database connections in Fedaco.

## Connection Basics

Fedaco uses `DatabaseConfig` to register connections, then exposes them through:

- `db(connectionName?)` for query builder / connection access
- `schema(connectionName?)` for schema builder access

## Single Connection

```ts
import 'reflect-metadata';
import { DatabaseConfig } from '@gradii/fedaco';
import { betterSqliteDriver } from '@gradii/fedaco-sqlite-driver';

const database = new DatabaseConfig();

database.addConnection({
  driver: 'sqlite',
  factory: betterSqliteDriver(),
  database: './tmp/app.sqlite',
});

database.bootFedaco();
database.setAsGlobal();
```

After this, you can use helpers anywhere:

```ts
import { db, schema } from '@gradii/fedaco';

const rows = await db().query().from('users').get();
await schema().hasTable('users');
```

## Multiple Connections

```ts
import { DatabaseConfig } from '@gradii/fedaco';
import { betterSqliteDriver } from '@gradii/fedaco-sqlite-driver';
import { postgresDriver } from '@gradii/fedaco-postgres-driver';

const database = new DatabaseConfig();

database.addConnection({
  driver: 'sqlite',
  factory: betterSqliteDriver(),
  database: './tmp/default.sqlite',
}, 'default');

database.addConnection({
  driver: 'pgsql',
  factory: postgresDriver(),
  host: '127.0.0.1',
  port: 5432,
  database: 'app',
  username: 'postgres',
  password: 'postgres',
}, 'reporting');

database.bootFedaco();
database.setAsGlobal();
```

Use non-default connection:

```ts
import { db, schema } from '@gradii/fedaco';

await db('reporting').query().from('users').count();
await schema('reporting').hasTable('users');
```

## Per-Model Connection

Set a connection name on the `@Table` decorator:

```ts
import { Model, Table } from '@gradii/fedaco';

@Table({
  tableName: 'users',
  connection: 'reporting',
})
export class ReportingUser extends Model {}
```

Override connection at runtime:

```ts
const records = await ReportingUser.useConnection('default').createQuery().get();
```

## Driver Packages

Install the matching driver package and native client for your database:

- SQLite: `@gradii/fedaco-sqlite-driver` + `better-sqlite3` (or `sqlite3`)
- MySQL/MariaDB: `@gradii/fedaco-mysql-driver` + `mysql2` (or `mariadb`)
- PostgreSQL: `@gradii/fedaco-postgres-driver` + `pg`
- SQL Server: `@gradii/fedaco-sqlserver-driver` + `tedious`

## Transactions

Run work in a transaction using the transaction-scoped connection (`tx`):

```ts
await db().transaction(async (tx) => {
  await tx.table('users').insert({ name: 'A' });
  await tx.table('users').where({ name: 'A' }).update({ name: 'B' });
});
```

If an error is thrown, the transaction is rolled back:

```ts
await db().transaction(async (tx) => {
  await tx.table('users').insert({ name: 'A' });
  throw new Error('fail');
});
```

Manual transaction methods are also available:

```ts
await db().beginTransaction();
try {
  await db().table('users').insert({ name: 'X' });
  await db().commit();
} catch (e) {
  await db().rollBack();
  throw e;
}
```

### Model Queries In Transaction

Use the transaction connection for model queries:

```ts
await db().transaction(async (tx) => {
  await User.createQuery(tx).create({ name: 'Alice', email: 'alice@example.com' });

  await User.createQuery()
    .withConnection(tx)
    .where('name', 'Alice')
    .update({ email: 'updated@example.com' });
});
```

### Transaction Options

Fedaco supports transaction options validated in e2e tests:

```ts
await db().transaction(
  async (tx) => {
    await tx.table('users').insert({ name: 'Alice' });
  },
  {
    timeout: 5000,
    isolationLevel: 'SERIALIZABLE',
    attempts: 3,
    isolated: true,
  },
);
```

- `timeout`: abort and roll back if execution exceeds the timeout
- `isolationLevel`: set transaction isolation (`READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`)
- `attempts`: retry on concurrency errors (for example deadlock)
- `isolated`: run on a dedicated connection (pool manager when available; connector fallback when not)

## Schema Builder

```ts
import { schema } from '@gradii/fedaco';

await schema().create('posts', (table) => {
  table.increments('id');
  table.string('title');
  table.text('content').withNullable();
  table.timestamps();
});
```

## Related Docs

- [Guide: Getting Started](/guide/getting-started)
- [SQLite Driver](/database/sqlite-driver)
- [MySQL Driver](/database/mysql-driver)
- [PostgreSQL Driver](/database/postgres-driver)
- [SQL Server Driver](/database/sqlserver-driver)
- [Transactions Guide](/database/transactions)
- [Transaction With Models](/database/transaction-with-models)
- [Transaction Options](/database/transaction-options)
- [Schema Operations](/database/schema-operations)
- [Nest Integration](/guide/nest-integration)
- [Relationships](/relationships/database)

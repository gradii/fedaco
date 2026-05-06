# Working With Multiple Connections

Fedaco supports more than one database connection per app. You'll want this when:

- A single service talks to two different databases (e.g. a transactional Postgres plus a reporting MySQL).
- You're sharding by tenant.
- You're splitting reads from writes against a primary/replica pair.

This guide covers all three patterns. It assumes you've already read the [Getting Started guide](/guide/getting-started).

## 1. Register Multiple Named Connections

`DatabaseConfig.addConnection(config, name?)` takes an optional name. The first call without a name defaults to `'default'` — the connection used by `db()`, `schema()`, and any `Model` without an explicit `connection`.

```ts
import { DatabaseConfig } from '@gradii/fedaco';
import { mysqlDriver } from '@gradii/fedaco-mysql-driver';
import { postgresDriver } from '@gradii/fedaco-postgres-driver';

const db = new DatabaseConfig();

// Primary OLTP database — used by db() / schema() / Model when no
// connection is specified.
db.addConnection({
  driver: 'mysql',
  factory: mysqlDriver(),
  host: 'oltp.internal',
  database: 'app',
  username: 'app',
  password: 'secret',
});

// Secondary reporting database.
db.addConnection(
  {
    driver: 'pgsql',
    factory: postgresDriver(),
    host: 'reporting.internal',
    database: 'reports',
    username: 'reader',
    password: 'reader',
  },
  'reporting',
);

db.bootFedaco();
db.setAsGlobal();
```

## 2. Pick a Connection per Query

The query builder, schema builder, and model APIs all let you target a named connection.

### Query builder

```ts
import { db } from '@gradii/fedaco';

await db('reporting').query().from('daily_revenue').get();
```

### Schema builder

```ts
import { schema } from '@gradii/fedaco';

await schema('reporting').create('daily_revenue', (t) => {
  t.integer('day');
  t.integer('cents');
});
```

### Models

Bind a model to a connection by setting `connection` on the `@Table` annotation:

```ts
import { Column, Model, PrimaryGeneratedColumn, Table } from '@gradii/fedaco';

@Table({ tableName: 'daily_revenue', connection: 'reporting' })
export class DailyRevenue extends Model {
  @PrimaryGeneratedColumn() declare id: number;
  @Column() declare day: number;
  @Column() declare cents: number;
}
```

For one-off overrides at call time, use the `useConnection` helper:

```ts
import { Model } from '@gradii/fedaco';
import { useConnection } from '@gradii/fedaco';

const rows = await User.useConnection('reporting').get();
```

`useConnection` is a tiny wrapper that calls `Model.SetConnection()` on a fresh instance and returns its query builder — see the [model functions reference](/model-functions/useConnection).

## 3. Read / Write Split

Fedaco ships first-class support for primary/replica setups. Define `read` and `write` blocks on the same connection config:

```ts
db.addConnection({
  driver: 'mysql',
  factory: mysqlDriver(),
  database: 'app',
  username: 'app',
  password: 'secret',
  read: {
    host: ['replica-a.internal', 'replica-b.internal'], // randomly picked per resolve
  },
  write: {
    host: 'primary.internal',
  },
});
```

Behaviour:

- `select(...)` queries go to the **read** PDO.
- `insert` / `update` / `delete` / `statement` / inside a transaction go to the **write** PDO.
- Once the connection has performed any write, it sticks to the write PDO for the rest of the request when `sticky: true` is set.
- `useWriteConnection()` on a query forces the write side for that query.

```ts
// Force a read query to use the primary (e.g. read-after-write checks):
await db().query().from('orders').useWriteConnection().get();
```

When `host` is an array, the driver picks one entry at random per fresh connection — that's how the connector spreads load across replicas.

## 4. Mixing Pools and Connections

Each named connection can have its own `pool` config — they're fully independent:

```ts
db.addConnection({
  driver: 'mysql',
  factory: mysqlDriver(),
  database: 'app',
  pool: { max: 20 },
});

db.addConnection(
  {
    driver: 'pgsql',
    factory: postgresDriver(),
    database: 'reports',
    pool: { max: 5 },
  },
  'reporting',
);
```

Calling `await db.getDatabaseManager().disconnect()` tears down every cached connection (and its pool, if any) in parallel. See [Connection Pooling](/guide/connection-pooling) for the full pool lifecycle.

## 5. Cross-Connection Caveats

A few things to keep in mind:

- **Transactions are per-connection.** A single `db().transaction(async tx => ...)` only spans the connection it was started on. There's no two-phase commit across connections.
- **Foreign keys and joins** can't cross connections (or even databases on most drivers without explicit setup). Plan your schema so each connection owns a coherent slice of data.
- **Connection name vs database name.** A *connection* is what you named via `addConnection(config, name)`. A *database* is what's in `config.database`. Two connections can point at the same physical database with different credentials, pool sizes, or read/write topology.

## Further Reading

- [Connection Pooling](/guide/connection-pooling) — when and how to enable connection pools per connection.
- [Transactions Guide](/database/transactions) — including isolated transactions and `withConnection(tx)`.
- [Database Configuration](/database/getting-started) — full list of supported drivers.

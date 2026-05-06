# Connection Pooling & Isolated Transactions

Fedaco ships a single long-lived connection per `ConnectionConfig` by default. That's the right choice for most apps — it has the lowest overhead and matches what `mysql2.createConnection` / `pg.Client` give you out of the box.

You'll want a **connection pool** when:

- Long-running transactions would otherwise block other queries on the same wire.
- Concurrent requests need to run transactions in parallel without serializing on a single connection.
- You're enforcing per-transaction `timeout` / `isolationLevel` and want each transaction to own its own session state.

This guide walks through enabling the pool, the new `isolated: true` transaction flag, and the contract drivers must satisfy.

## 1. Enable the Pool

Add a `pool` block to the connection config:

```ts
import { DatabaseConfig } from '@gradii/fedaco';
import { mysqlDriver } from '@gradii/fedaco-mysql-driver';

const db = new DatabaseConfig();

db.addConnection({
  driver: 'mysql',
  factory: mysqlDriver(),
  host: 'localhost',
  port: 3306,
  database: 'app',
  username: 'app',
  password: 'secret',
  pool: {
    max: 10,             // upper bound on open connections
    acquireTimeout: 30_000, // ms — fail fast on pool exhaustion
    idleTimeout: 30_000,    // ms — close idle connections after this
  },
});

db.bootFedaco();
db.setAsGlobal();
```

The pool is opt-in. Without `pool`, Fedaco's behaviour is unchanged — one long-lived connection, `transaction()` runs against it as before.

### Pool knobs

| Option           | Default | What it controls                                                          |
| ---------------- | ------- | ------------------------------------------------------------------------- |
| `max`            | `10`    | Hard cap on simultaneously open connections. Extra acquires queue.        |
| `acquireTimeout` | `30000` | How long a queued caller waits before rejecting with a timeout error.     |
| `idleTimeout`    | `30000` | How long a released connection sits idle before being closed. `0` = forever. |

`min` is accepted on the type but not pre-warmed by the default pool manager — connections are created lazily on first acquire.

## 2. Run an Isolated Transaction

Pass `isolated: true` to `transaction()` to grab a dedicated connection from the pool for the duration of the callback:

```ts
await db().transaction(
  async (tx) => {
    // `tx` is a fresh Connection of the same subclass (MysqlConnection,
    // PostgresConnection, ...) wrapping a pool-checked-out handle.
    await tx.table('orders').insert({ user_id: 42, total: 99 });
    await tx.table('users').where('id', 42).increment('order_count');
  },
  {
    isolated: true,
    timeout: 5000,
    isolationLevel: 'SERIALIZABLE',
  },
);
```

Mechanics:

1. Pool `acquire()` checks out a `DriverConnection`.
2. Driver `createConnection(pdo, db, prefix, config)` wraps it in a fresh `Connection` of the right subclass — its `_transactions` counter and PDO state are independent of the primary connection.
3. The callback runs against that isolated connection (not the primary).
4. On commit/rollback the connection is **released back to the pool** in `finally`, even if the callback throws or the timeout fires.

::: tip
Inside an isolated transaction, **always use the `tx` argument** (or `withConnection(tx)` / `createQuery(tx)` for model queries). Calls against `db()` will run on the primary connection and won't be part of the transaction.
:::

## 3. Drivers Without a Pool — The Fallback Path

Not every driver implements pooling. SQLite is the obvious example: each `:memory:` database is per-connection, so a pool that opens fresh handles wouldn't share data with the primary connection.

Fedaco still lets you call `isolated: true` on these drivers. When no pool manager is attached, `_executeIsolatedTransaction` falls back to `driver.createConnector(config)` — opening a one-shot connection, running the transaction on it, and disconnecting it in `finally`.

```ts
// File-based SQLite — the fallback works because both the primary
// connection and the one-shot isolated handle see the same file.
db.addConnection({
  driver: 'sqlite',
  factory: sqliteDriver(),
  database: '/var/data/app.sqlite',
});

await db().transaction(
  async (tx) => {
    await tx.table('users').insert({ name: 'Alice' });
  },
  { isolated: true },
);
```

::: warning
The fallback path **does not work for `:memory:` SQLite** — each new handle gets its own empty database, so writes inside the isolated transaction never reach the primary connection. Use a file path or a custom pool manager (next section).
:::

## 4. Custom Pool Managers

A driver opts into pooling by implementing `createPoolManager` on its `DatabaseDriver`:

```ts
import {
  DefaultConnectionPoolManager,
  type DatabaseDriver,
  type DriverConnectionResolver,
} from '@gradii/fedaco';

export function myDriver(): DatabaseDriver {
  return {
    name: 'my',
    createConnector: (config) => /* ... */,
    createConnection: (pdo, db, prefix, config) => /* ... */,
    createPoolManager: (
      pdoResolver: DriverConnectionResolver,
      poolConfig,
    ) => new DefaultConnectionPoolManager(pdoResolver, poolConfig),
  };
}
```

The signature mirrors `createConnection` — both take a `DriverConnectionResolver`. The driver does **not** parse pool config or build a native pool itself; it hands the resolver and the user's `ConnectionPoolConfig` to a pool implementation.

`DefaultConnectionPoolManager` (in `@gradii/fedaco`) is a generic, driver-agnostic pool that covers the common cases:

- Idle queue + active set
- FIFO waiter queue with `acquireTimeout`
- Per-connection `idleTimeout` (closes stale connections)
- `destroy()` rejects pending waiters and closes every checked-out + idle connection
- `unref()`-ed timers — won't keep the Node event loop alive on their own

If you need driver-specific behaviour (health checks, native keepalive, statement caching), implement `ConnectionPoolManager` yourself:

```ts
import type {
  ConnectionPoolConfig,
  ConnectionPoolManager,
  DriverConnection,
  DriverConnectionResolver,
} from '@gradii/fedaco';

class MyDriverPool implements ConnectionPoolManager {
  constructor(
    private readonly resolve: DriverConnectionResolver,
    private readonly cfg: ConnectionPoolConfig,
  ) { /* ... */ }

  acquire(): Promise<DriverConnection> { /* ... */ }
  release(c: DriverConnection): Promise<void> { /* ... */ }
  destroy(): Promise<void> { /* ... */ }
  getPoolSize() { return { total: 0, idle: 0, active: 0 }; }
}
```

## 5. Lifecycle

The pool is owned by the high-level `Connection` it was attached to. Its lifecycle is:

- **Created** lazily by `ConnectionFactory` when `config.pool` is set and the driver exposes `createPoolManager`.
- **Used** by `transaction({ isolated: true })`. Outside isolated transactions it's idle.
- **Destroyed** when `Connection.disconnect()` is called — every checked-out and idle connection is closed; pending acquire-waiters are rejected.

Calling `DatabaseManager.disconnect(name?)` forwards to each cached `Connection`, so this works:

```ts
// Cleanly close every connection (and pool) that this app opened.
await db.getDatabaseManager().disconnect();
```

`DatabaseManager.purge(name)` does the same and also drops the cached `Connection`, so the next `db.getConnection()` call rebuilds it from scratch.

## 6. Inspecting the Pool

`getPoolSize()` returns a snapshot of the pool — useful for metrics and tests:

```ts
const stats = db().getPoolManager()?.getPoolSize();
// { total: 4, idle: 3, active: 1 }
```

## 7. When *Not* to Enable Pooling

- **Single-process scripts / migrations / cron jobs.** A single connection is cheaper and simpler.
- **`:memory:` SQLite.** Each connection has its own database, so isolated transactions can't see each other's writes.
- **Serverless functions with very short lifespans.** Cold-start cost outweighs pool benefits; consider a single connection or an external pooler (PgBouncer, RDS Proxy).

## Recap

- `pool` config is opt-in. Without it, Fedaco behaves as before.
- `isolated: true` + a pool gives each transaction its own connection.
- `isolated: true` + no pool falls back to opening a one-shot connection via `createConnector` — convenient, but be aware of the `:memory:` SQLite caveat.
- Drivers expose pool support by implementing `createPoolManager(resolver, config)`. `DefaultConnectionPoolManager` covers most needs.
- `Connection.disconnect()` and `DatabaseManager.disconnect()` tear the pool down cleanly.

## Further Reading

- [Transactions Guide](/database/transactions) — the full transaction API, including non-isolated transactions, retries, and hooks.
- [Getting Started](/guide/getting-started) — install + first model walkthrough.

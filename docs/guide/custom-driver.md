# Writing a Custom Driver

Fedaco's core only knows how to *talk* to a database — it doesn't ship the wire protocol. Every database (MySQL, PostgreSQL, SQLite, SQL Server, …) is a separate driver package that plugs the protocol-specific bits into a small, fixed surface.

This guide walks through every piece you need to build your own driver, using a hypothetical fictional database called **Foobar** for the examples. It's structured so you can read top-to-bottom or skip to the pieces you're missing.

## What a Driver Provides

A driver is a `DatabaseDriver` factory. It hands Fedaco three or four things:

| Field                  | Required | Purpose                                                                |
| ---------------------- | -------- | ---------------------------------------------------------------------- |
| `name`                 | ✓        | Driver string (`'mysql'`, `'pgsql'`, …) — used by grammar selection.   |
| `createConnector(cfg)` | ✓        | Opens a fresh `DriverConnection` over the wire.                        |
| `createConnection(…)`  | ✓        | Wraps a `DriverConnection` in your `Connection` subclass.              |
| `createPoolManager(…)` | optional | Builds a `ConnectionPoolManager` for isolated transactions.            |

Underneath those three calls live a small number of glue classes you'll write:

```
your-driver-pkg/
├── src/
│   ├── connector/
│   │   ├── foobar-connector.ts          // opens the socket, configures session
│   │   ├── foobar-driver-connection.ts  // wraps the native client
│   │   └── foobar-driver-stmt.ts        // wraps a prepared statement
│   ├── connection/
│   │   └── foobar-connection.ts         // the high-level Connection subclass
│   ├── query-builder/
│   │   ├── foobar-query-grammar.ts      // SQL dialect for SELECT/INSERT/...
│   │   └── foobar-processor.ts          // post-processing (insertGetId, etc)
│   ├── schema/
│   │   ├── foobar-schema-grammar.ts     // SQL dialect for CREATE/ALTER/...
│   │   └── foobar-schema-builder.ts     // optional: schema introspection
│   ├── foobar-driver.ts                 // the public factory
│   └── index.ts
└── package.json
```

The next sections walk through each layer in the order data flows: from your factory, down through the connector to the wire, then back up through the connection and grammars.

## 1. The Public Factory

Start at the outside. Users will write `factory: foobarDriver()` in their `addConnection` config — that call returns a plain `DatabaseDriver` object.

```ts
// src/foobar-driver.ts
import type {
  ConnectionConfig,
  DatabaseDriver,
  DriverConnection,
  DriverConnectionResolver,
} from '@gradii/fedaco';
import { connectWithHosts, DefaultConnectionPoolManager } from '@gradii/fedaco';
import { FoobarConnection } from './connection/foobar-connection';
import { FoobarConnector } from './connector/foobar-connector';

export function foobarDriver(driverConfig?: ConnectionConfig): DatabaseDriver {
  return {
    name: driverConfig?.driver ?? 'foobar',

    createConnector: (config) =>
      connectWithHosts(config, new FoobarConnector()),

    createConnection: (
      pdo: DriverConnection | DriverConnectionResolver,
      database: string,
      prefix: string,
      config: any,
    ) => {
      const merged = { ...config, ...driverConfig };
      return new FoobarConnection(
        pdo,
        driverConfig?.database ?? database,
        driverConfig?.prefix ?? prefix,
        merged,
      );
    },

    createPoolManager: (resolver, poolConfig) =>
      new DefaultConnectionPoolManager(resolver, poolConfig),
  };
}
```

A few patterns to copy:

- **`connectWithHosts`** handles `config.host` being an array (cluster) vs a string (single host). Always delegate to it; don't reimplement the host-shuffle logic.
- **`createConnector` returns a Promise of a fresh connection.** Each call must produce a new, independent `DriverConnection` — the lazy resolver wired up in `Connection` and the pool both rely on this.
- **`driverConfig` overrides `config`.** That lets dialect-shim drivers (e.g. `mariadbDriver` reusing `MysqlConnector`) customize the `name` while sharing infrastructure.
- **`createPoolManager` is optional.** Skip it if your database can't be pooled (per-connection state, exclusive file locks, etc). Isolated transactions then fall back to opening a one-shot connection — see the [connection pooling guide](/guide/connection-pooling).

## 2. The Connector

The connector's job is to take a config and produce a fully configured `DriverConnection`. It typically:

1. Opens a TCP/socket connection via the native client lib.
2. Selects the database / schema.
3. Sets session-level options (charset, timezone, isolation level, search path, …).

Extend `Connector` (which gives you `getOptions` and a couple of helpers) and implement `connect(config)`:

```ts
// src/connector/foobar-connector.ts
import { Connector, type ConnectorInterface } from '@gradii/fedaco';
import { FoobarDriverConnection } from './foobar-driver-connection';

export class FoobarConnector extends Connector implements ConnectorInterface {
  public async connect(config: any): Promise<FoobarDriverConnection> {
    const { connect } = await import('@foobar/client'); // lazy — keep startup cheap

    const native = await connect({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      ssl: config.ssl,
    });

    // Optional session configuration (charset, timezone, …).
    if (config.charset) {
      await native.exec(`SET CLIENT_ENCODING TO '${config.charset}'`);
    }

    return new FoobarDriverConnection(native);
  }
}
```

::: tip
Use `await import(...)` inside `connect`. That means importing your driver package doesn't pay the cost of loading the native client unless someone actually opens a connection.
:::

## 3. The DriverConnection Wrapper

`DriverConnection` is the small adapter interface Fedaco uses to do everything: prepare statements, run them, manage transactions, fetch the last insert id, and disconnect.

```ts
// src/connector/foobar-driver-connection.ts
import type { DriverConnection } from '@gradii/fedaco';
import type { FoobarClient } from '@foobar/client';
import { FoobarDriverStmt } from './foobar-driver-stmt';

export class FoobarDriverConnection implements DriverConnection {
  constructor(private readonly client: FoobarClient) {}

  async prepare(sql: string): Promise<FoobarDriverStmt> {
    const stmt = await this.client.prepare(sql);
    return new FoobarDriverStmt(stmt);
  }

  async execute(sql: string, bindings?: any[]): Promise<any> {
    return this.client.exec(sql, bindings ?? []);
  }

  async lastInsertId(): Promise<number> {
    const row = await this.client.queryOne('SELECT lastval() AS id');
    return Number(row?.id ?? 0);
  }

  async beginTransaction(): Promise<void> {
    await this.client.exec('BEGIN');
  }

  async commit(): Promise<void> {
    await this.client.exec('COMMIT');
  }

  async rollBack(): Promise<void> {
    await this.client.exec('ROLLBACK');
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }
}
```

Two things easy to get wrong:

- **`lastInsertId` runs a query.** Most native drivers don't auto-track this in TypeScript, so you typically issue a follow-up query (`lastval()` for Postgres, `last_insert_rowid()` for SQLite, `LAST_INSERT_ID()` for MySQL). Cache it on the statement if your wire protocol gives it back with the INSERT response.
- **`beginTransaction` / `commit` / `rollBack` should be idempotent-safe at the wire level.** Fedaco's transaction mixin already guards against double-commit, but driver-level `BEGIN` on a connection that's already in a transaction will fail differently per database — keep that path off the happy path.

## 4. The DriverStmt Wrapper

`DriverStmt` is the prepared-statement adapter. The methods Fedaco calls are tightly scoped:

```ts
// src/connector/foobar-driver-stmt.ts
import type { DriverStmt } from '@gradii/fedaco';
import type { FoobarStatement } from '@foobar/client';

export class FoobarDriverStmt implements DriverStmt {
  private bindings: any[] = [];
  private affected = 0;

  constructor(private readonly stmt: FoobarStatement) {}

  bindValues(values: any[]): this {
    this.bindings = values;
    return this;
  }

  // Required by the interface but rarely useful — Fedaco binds in batches.
  bindValue(): this {
    return this;
  }

  async execute(bindings?: any[]): Promise<any> {
    const result = await this.stmt.run(bindings ?? this.bindings);
    this.affected = result.affectedRows;
    return result;
  }

  async fetchAll(bindings?: any[]): Promise<any> {
    return this.stmt.all(bindings ?? this.bindings);
  }

  affectCount(): number {
    return this.affected;
  }
}
```

Notes:

- **`bindValues` is a setter.** Fedaco calls it before `execute` / `fetchAll`. The actual binding can either happen there or be deferred to the run call (most common).
- **`affectCount()` is a *sync* getter** that returns the row count from the most recent `execute`. Fedaco reads it immediately after `await statement.execute()`, so capture the value during execute.

## 5. The Connection Subclass

`Connection` is the high-level wrapper users see. Subclassing it lets you wire in your dialect's grammar and post-processor.

```ts
// src/connection/foobar-connection.ts
import { Connection, type QueryGrammar, type SchemaBuilder, type SchemaGrammar } from '@gradii/fedaco';
import { FoobarQueryGrammar } from '../query-builder/foobar-query-grammar';
import { FoobarProcessor } from '../query-builder/foobar-processor';
import { FoobarSchemaGrammar } from '../schema/foobar-schema-grammar';

export class FoobarConnection extends Connection {
  protected getDefaultQueryGrammar(): QueryGrammar {
    return this.withTablePrefix(new FoobarQueryGrammar()) as QueryGrammar;
  }

  protected getDefaultSchemaGrammar(): SchemaGrammar {
    return this.withTablePrefix(new FoobarSchemaGrammar()) as SchemaGrammar;
  }

  protected getDefaultPostProcessor() {
    return new FoobarProcessor();
  }

  // Optional: override only if your dialect needs a non-default schema builder
  // (e.g. SQLite's column-rename workaround).
  // public getSchemaBuilder(): SchemaBuilder { ... }

  // Optional: override the binary escape if your wire format is hex/base64/etc.
  protected escapeBinary(value: string) {
    return `x'${Buffer.from(value).toString('hex')}'`;
  }
}
```

If your dialect is a near-clone of one Fedaco already supports, **subclass that driver's grammar instead of starting from scratch**. `MariadbDriver` does this: it reuses `MysqlConnector` and `MysqlConnection` whole, only the `name` differs.

## 6. The Grammars and Processor

These are the SQL-generating workhorses. The shape isn't custom to your driver — they extend `QueryGrammar`, `SchemaGrammar`, and `Processor` from `@gradii/fedaco`:

- `QueryGrammar` compiles `SELECT/INSERT/UPDATE/DELETE/UPSERT` AST nodes into your dialect.
- `SchemaGrammar` compiles `CREATE TABLE`, `ALTER`, indexes, foreign keys, etc.
- `Processor` post-processes results (most importantly, picks the right strategy for `insertGetId` per dialect).

Look at the closest existing driver and copy the shape. The five files in `libs/sqlite-driver/src/query-builder/` and `libs/sqlite-driver/src/schema/` are a good starting point for any new driver.

The minimal `Processor` does almost nothing:

```ts
// src/query-builder/foobar-processor.ts
import { Processor } from '@gradii/fedaco';

export class FoobarProcessor extends Processor {
  // Override only if your dialect needs a different INSERT...RETURNING shape
  // or a custom select post-processing step.
}
```

## 7. Pool Support (Optional)

Once your `createConnector` returns a fresh `DriverConnection` per call, pool support is a one-liner. Hand the resolver and the user's pool config to `DefaultConnectionPoolManager`:

```ts
createPoolManager: (resolver, poolConfig) =>
  new DefaultConnectionPoolManager(resolver, poolConfig),
```

That gives users:

- `acquire()` reuses idle connections, otherwise opens up to `max`, otherwise queues with `acquireTimeout`.
- `release()` returns to the queue head, otherwise parks idle with `idleTimeout`.
- `destroy()` rejects pending waiters and closes every connection.

If your database has features `DefaultConnectionPoolManager` doesn't (native keepalive, prepared-statement caches, replica routing, …), implement `ConnectionPoolManager` yourself. The interface is four methods:

```ts
interface ConnectionPoolManager {
  acquire(): Promise<DriverConnection>;
  release(connection: DriverConnection): Promise<void>;
  destroy(): Promise<void>;
  getPoolSize(): { total: number; idle: number; active: number };
}
```

See [Connection Pooling](/guide/connection-pooling) for the lifecycle and the contract callers rely on.

## 8. Wiring It Up

Re-export the public factory from your package entrypoint:

```ts
// src/index.ts
export { foobarDriver } from './foobar-driver';
export { FoobarConnection } from './connection/foobar-connection';
export { FoobarDriverConnection } from './connector/foobar-driver-connection';
```

Users then plug your driver in just like the bundled ones:

```ts
import { DatabaseConfig } from '@gradii/fedaco';
import { foobarDriver } from '@your-org/fedaco-foobar-driver';

const db = new DatabaseConfig();

db.addConnection({
  driver: 'foobar',
  factory: foobarDriver(),
  host: 'foobar.internal',
  port: 9000,
  database: 'app',
  username: 'app',
  password: 'secret',
  pool: { max: 10 },
});

db.bootFedaco();
db.setAsGlobal();
```

## 9. Testing

The cheapest sanity-check matrix once you have a driver compiling:

1. **Open and close.** `await db.getConnection().getDriverConnection()` returns a `FoobarDriverConnection`; `await db.getDatabaseManager().disconnect()` closes it.
2. **Round-trip a query.** `db().query().select(db().raw('1 AS one')).get()` returns `[{ one: 1 }]`.
3. **Schema builder.** Create a table, insert a row, select it back.
4. **Transactions.** Wrap an insert in `db().transaction(...)` and verify rollback on throw.
5. **Pool acquire/release.** Set `pool: { max: 2 }`, run two `isolated: true` transactions in parallel, observe both succeed and `getPoolSize().active` returns to 0.

The transaction tests in `apps/fedaco-e2e/src/test/transaction/*.spec.ts` can be lifted with only a `factory:` swap — they already cover most of the behaviour any driver needs to honour.

## 10. Reference: Existing Drivers

Before writing anything from scratch, read the source of the closest existing driver and mirror its layout. They're all small enough to read in one sitting:

- [`@gradii/fedaco-sqlite-driver`](https://github.com/gradii/fedaco/tree/main/libs/sqlite-driver) — file-backed and `:memory:`, no pool.
- [`@gradii/fedaco-mysql-driver`](https://github.com/gradii/fedaco/tree/main/libs/mysql-driver) — TCP, charset/timezone/strict-mode handling, includes the `mariadb` dialect alias.
- [`@gradii/fedaco-postgres-driver`](https://github.com/gradii/fedaco/tree/main/libs/postgres-driver) — TCP/SSL, `search_path`, application name, synchronous commit.
- [`@gradii/fedaco-sqlserver-driver`](https://github.com/gradii/fedaco/tree/main/libs/sqlserver-driver) — `tedious` adapter, dialect quirks for `OUTPUT INSERTED`.

## Further Reading

- [Connection Pooling & Isolated Transactions](/guide/connection-pooling) — the contract a `ConnectionPoolManager` must honour.
- [Multiple Connections](/guide/multiple-connections) — read/write split, named connections, host arrays.
- [Transactions Guide](/database/transactions) — what `beginTransaction`/`commit`/`rollBack` need to satisfy on the wire.

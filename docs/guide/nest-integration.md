# Nest Integration

Fedaco ships a first-class NestJS module — [`@gradii/nest-fedaco`](https://github.com/gradii/fedaco/tree/main/libs/nest-fedaco). It boots `DatabaseConfig`, registers every connection you declare, and wires Fedaco's lifecycle into Nest's: `onApplicationShutdown` disconnects every connection (and tears down their pools) for you.

This guide assumes you've already read the [Getting Started guide](/guide/getting-started) and have a working Nest project.

## Installation

Install Nest, Fedaco core, the Nest module, and **one driver package per database** you want to talk to. The driver packages bring their own native clients in — you no longer install `better-sqlite3` / `mysql2` / `pg` directly.

::: code-group

```sh [npm]
npm install @gradii/fedaco @gradii/nest-fedaco @gradii/fedaco-sqlite-driver reflect-metadata
```

```sh [yarn]
yarn add @gradii/fedaco @gradii/nest-fedaco @gradii/fedaco-sqlite-driver reflect-metadata
```

```sh [pnpm]
pnpm add @gradii/fedaco @gradii/nest-fedaco @gradii/fedaco-sqlite-driver reflect-metadata
```

:::

For other databases swap the driver package:

| Database          | Driver package                      |
| ----------------- | ----------------------------------- |
| SQLite (sqlite3)  | `@gradii/fedaco-sqlite-driver`      |
| SQLite (better-sqlite3) | `@gradii/fedaco-sqlite-driver` (`betterSqliteDriver()` factory) |
| MySQL / MariaDB   | `@gradii/fedaco-mysql-driver`       |
| PostgreSQL        | `@gradii/fedaco-postgres-driver`    |
| SQL Server        | `@gradii/fedaco-sqlserver-driver`   |

You also need `experimentalDecorators` and `emitDecoratorMetadata` enabled in `tsconfig.json`, and `import 'reflect-metadata'` once at app startup. NestJS projects already have this set up.

## Register `FedacoModule`

`FedacoModule.forRoot(connections)` takes an object whose **keys are connection names** and **values are `ConnectionConfig`**. Each entry needs at least a `driver` string and a `factory` callable — Fedaco no longer ships drivers in core, so the factory is the runtime hook into the driver package you installed.

```ts
import { FedacoModule } from '@gradii/nest-fedaco';
import { sqliteDriver } from '@gradii/fedaco-sqlite-driver';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    FedacoModule.forRoot({
      default: {
        driver: 'sqlite',
        factory: sqliteDriver(),
        database: ':memory:',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

What `forRoot` does behind the scenes:

1. Creates a `DatabaseConfig` and calls `addConnection(config, name)` for every entry.
2. Calls `bootFedaco()` so models can resolve their connections.
3. Calls `setAsGlobal()` so `db()` and `schema()` (the global helpers) work anywhere.
4. Hooks into `onApplicationShutdown` — when Nest tears down, every connection is disconnected and any attached pool is destroyed.

::: tip
The connection key is the *connection name*. Models default to `'default'`; pass any other name in the `@Table({ connection: ... })` annotation or via `Model.useConnection('name')`.
:::

## Multiple Connections

Add as many entries as you need. Names are arbitrary — pick whatever makes sense for your app.

```ts
import { FedacoModule } from '@gradii/nest-fedaco';
import { sqliteDriver } from '@gradii/fedaco-sqlite-driver';
import { postgresDriver } from '@gradii/fedaco-postgres-driver';

@Module({
  imports: [
    FedacoModule.forRoot({
      default: {
        driver: 'sqlite',
        factory: sqliteDriver(),
        database: ':memory:',
      },
      reporting: {
        driver: 'pgsql',
        factory: postgresDriver(),
        host: 'reporting.internal',
        port: 5432,
        database: 'reports',
        username: 'reader',
        password: 'reader',
      },
    }),
  ],
})
export class AppModule {}
```

Bind a model to a non-default connection via the `@Table` annotation:

```ts
import { Column, CreatedAtColumn, Model, PrimaryGeneratedColumn, Table, UpdatedAtColumn } from '@gradii/fedaco';

@Table({
  tableName: 'daily_revenue',
  connection: 'reporting',
})
export class DailyRevenue extends Model {
  @PrimaryGeneratedColumn() declare id: number;
  @Column() declare day: number;
  @Column() declare cents: number;

  @CreatedAtColumn() declare created_at: Date;
  @UpdatedAtColumn() declare updated_at: Date;
}
```

Or override the connection per call site with `Model.useConnection`:

```ts
const rows = await User.useConnection('reporting').get();
```

See [Multiple Connections](/guide/multiple-connections) for read/write splitting and other multi-connection patterns.

## Connection Pooling

Each connection accepts an optional `pool` block. Fedaco builds a `DefaultConnectionPoolManager` per connection — isolated transactions then pull dedicated connections out of it.

```ts
FedacoModule.forRoot({
  default: {
    driver: 'mysql',
    factory: mysqlDriver(),
    host: 'oltp.internal',
    database: 'app',
    username: 'app',
    password: 'secret',
    pool: {
      max: 20,
      acquireTimeout: 30_000,
      idleTimeout: 30_000,
    },
  },
}),
```

When Nest calls `onApplicationShutdown`, the module disconnects every connection — that disconnect tears the pool down (rejects pending acquire-waiters, closes idle and active connections). You don't need to do anything special on shutdown.

See [Connection Pooling & Isolated Transactions](/guide/connection-pooling) for the full pool API.

## Using Fedaco From Services

Inside a service, just import the global helpers — `forRoot` already called `setAsGlobal()`:

```ts
import { Injectable } from '@nestjs/common';
import { db, schema } from '@gradii/fedaco';
import { User } from './models/user.model';

@Injectable()
export class UserService {
  async findAll() {
    return User.createQuery().get();
  }

  async findRaw() {
    return db().query().from('users').select('*').get();
  }

  async createSchema() {
    await schema().create('users', (table) => {
      table.increments('id');
      table.string('username');
      table.timestamps();
    });
  }
}
```

::: tip
Default schema and column names use `snake_case`. The schema builder DSL is the same one used outside Nest — see [Getting Started](/guide/getting-started).
:::

## Transactions

Use `db().transaction(callback)` exactly like outside of Nest:

```ts
import { Injectable } from '@nestjs/common';
import { db } from '@gradii/fedaco';

@Injectable()
export class CheckoutService {
  async place(orderInput: any) {
    return db().transaction(async (tx) => {
      const order = await tx.table('orders').insertGetId(orderInput);
      await tx.table('users').where('id', orderInput.userId).increment('order_count');
      return order;
    });
  }
}
```

For long-running or concurrency-sensitive transactions, opt into `isolated: true` so the transaction takes a dedicated connection from the pool:

```ts
await db().transaction(
  async (tx) => {
    await tx.table('orders').insert(input);
  },
  { isolated: true, timeout: 5000, isolationLevel: 'SERIALIZABLE' },
);
```

See the [Transactions Guide](/database/transactions) for the full set of options.

## Async Configuration

If your config comes from `ConfigService` (env vars, secrets manager, …), wrap `forRoot` with whatever async-config pattern your app already uses. The simplest is to construct the config at bootstrap time:

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

```ts
// app.module.ts
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FedacoModule } from '@gradii/nest-fedaco';
import { mysqlDriver } from '@gradii/fedaco-mysql-driver';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FedacoModule.forRoot(buildFedacoConfig()),
  ],
})
export class AppModule {}

function buildFedacoConfig() {
  // process.env is already populated by ConfigModule at this point.
  return {
    default: {
      driver: 'mysql',
      factory: mysqlDriver(),
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      pool: { max: Number(process.env.DB_POOL_MAX ?? 10) },
    },
  };
}
```

## Shutdown

`FedacoCoreModule` implements `OnApplicationShutdown`. To make sure Nest fires it, enable shutdown hooks on the application:

```ts
// main.ts
const app = await NestFactory.create(AppModule);
app.enableShutdownHooks(); // [!code highlight]
await app.listen(3000);
```

With shutdown hooks enabled, `SIGINT` / `SIGTERM` will trigger `onApplicationShutdown`, which calls `connection.disconnect()` on each registered connection. That closes the underlying socket *and* destroys the pool if one is attached — no resource leak on graceful exit.

## Examples

A full NestJS + Fedaco example app lives in the examples repo: [https://github.com/gradii/fedaco-examples](https://github.com/gradii/fedaco-examples).

## Further Reading

- [Multiple Connections](/guide/multiple-connections) — read/write split and named connections.
- [Connection Pooling & Isolated Transactions](/guide/connection-pooling) — pool config, lifecycle, and `isolated: true`.
- [Transactions Guide](/database/transactions) — full transaction API.
- [Writing a Custom Driver](/guide/custom-driver) — build a driver for a database Fedaco doesn't ship.

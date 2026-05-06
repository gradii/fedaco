# SQLite Driver

Use this driver for local development, lightweight apps, and test environments.

## Install

::: code-group

```sh [npm]
npm install @gradii/fedaco @gradii/fedaco-sqlite-driver better-sqlite3
```

```sh [yarn]
yarn add @gradii/fedaco @gradii/fedaco-sqlite-driver better-sqlite3
```

```sh [pnpm]
pnpm add @gradii/fedaco @gradii/fedaco-sqlite-driver better-sqlite3
```

:::

Alternative runtime package:

- `sqlite3` with `sqliteDriver()`
- `better-sqlite3` with `betterSqliteDriver()`

## Configure Connection

```ts
import { DatabaseConfig } from '@gradii/fedaco';
import { betterSqliteDriver } from '@gradii/fedaco-sqlite-driver';

const db = new DatabaseConfig();

db.addConnection({
  driver: 'sqlite',
  factory: betterSqliteDriver(),
  database: './tmp/app.sqlite',
});

db.bootFedaco();
db.setAsGlobal();
```

## In-Memory Mode (Testing)

```ts
db.addConnection({
  driver: 'sqlite',
  factory: betterSqliteDriver(),
  database: ':memory:',
});
```

## Multi Connection Example

```ts
db.addConnection({
  driver: 'sqlite',
  factory: betterSqliteDriver(),
  database: './tmp/default.sqlite',
}, 'default');

db.addConnection({
  driver: 'sqlite',
  factory: betterSqliteDriver(),
  database: './tmp/reporting.sqlite',
}, 'reporting');
```

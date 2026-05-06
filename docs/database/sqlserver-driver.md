# SQL Server Driver

Use this driver for Microsoft SQL Server deployments.

## Install

::: code-group

```sh [npm]
npm install @gradii/fedaco @gradii/fedaco-sqlserver-driver tedious
```

```sh [yarn]
yarn add @gradii/fedaco @gradii/fedaco-sqlserver-driver tedious
```

```sh [pnpm]
pnpm add @gradii/fedaco @gradii/fedaco-sqlserver-driver tedious
```

:::

## Configure Connection

```ts
import { DatabaseConfig } from '@gradii/fedaco';
import { sqlserverDriver } from '@gradii/fedaco-sqlserver-driver';

const db = new DatabaseConfig();

db.addConnection({
  driver: 'sqlserver',
  factory: sqlserverDriver(),
  host: '127.0.0.1',
  port: 1433,
  database: 'app',
  username: 'sa',
  password: 'StrongPassword123!',
});

db.bootFedaco();
db.setAsGlobal();
```

## Connection URL Style

```ts
db.addConnection({
  driver: 'sqlserver',
  factory: sqlserverDriver(),
  url: 'sqlserver://sa:StrongPassword123!@127.0.0.1:1433/app',
});
```

## Optional Pool

```ts
db.addConnection({
  driver: 'sqlserver',
  factory: sqlserverDriver(),
  host: '127.0.0.1',
  port: 1433,
  database: 'app',
  username: 'sa',
  password: 'StrongPassword123!',
  pool: { min: 2, max: 10 },
});
```

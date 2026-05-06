# PostgreSQL Driver

Use this driver for PostgreSQL deployments.

## Install

::: code-group

```sh [npm]
npm install @gradii/fedaco @gradii/fedaco-postgres-driver pg
```

```sh [yarn]
yarn add @gradii/fedaco @gradii/fedaco-postgres-driver pg
```

```sh [pnpm]
pnpm add @gradii/fedaco @gradii/fedaco-postgres-driver pg
```

:::

## Configure Connection

```ts
import { DatabaseConfig } from '@gradii/fedaco';
import { postgresDriver } from '@gradii/fedaco-postgres-driver';

const db = new DatabaseConfig();

db.addConnection({
  driver: 'pgsql',
  factory: postgresDriver(),
  host: '127.0.0.1',
  port: 5432,
  database: 'app',
  username: 'postgres',
  password: 'postgres',
});

db.bootFedaco();
db.setAsGlobal();
```

## Connection URL Style

```ts
db.addConnection({
  driver: 'pgsql',
  factory: postgresDriver(),
  url: 'postgres://postgres:postgres@127.0.0.1:5432/app',
});
```

## Optional Pool

```ts
db.addConnection({
  driver: 'pgsql',
  factory: postgresDriver(),
  host: '127.0.0.1',
  port: 5432,
  database: 'app',
  username: 'postgres',
  password: 'postgres',
  pool: { min: 2, max: 10 },
});
```

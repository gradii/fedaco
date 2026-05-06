# MySQL Driver

Use this driver for MySQL and MariaDB deployments.

## Install

::: code-group

```sh [npm]
npm install @gradii/fedaco @gradii/fedaco-mysql-driver mysql2
```

```sh [yarn]
yarn add @gradii/fedaco @gradii/fedaco-mysql-driver mysql2
```

```sh [pnpm]
pnpm add @gradii/fedaco @gradii/fedaco-mysql-driver mysql2
```

:::

## Configure Connection (MySQL)

```ts
import { DatabaseConfig } from '@gradii/fedaco';
import { mysqlDriver } from '@gradii/fedaco-mysql-driver';

const db = new DatabaseConfig();

db.addConnection({
  driver: 'mysql',
  factory: mysqlDriver(),
  host: '127.0.0.1',
  port: 3306,
  database: 'app',
  username: 'root',
  password: 'secret',
});

db.bootFedaco();
db.setAsGlobal();
```

## Configure Connection (MariaDB)

```ts
import { mariadbDriver } from '@gradii/fedaco-mysql-driver';

db.addConnection({
  driver: 'mariadb',
  factory: mariadbDriver(),
  host: '127.0.0.1',
  port: 3306,
  database: 'app',
  username: 'root',
  password: 'secret',
}, 'mariadb');
```

## Connection URL Style

```ts
db.addConnection({
  driver: 'mysql',
  factory: mysqlDriver(),
  url: 'mysql://root:secret@127.0.0.1:3306/app',
});
```

## Optional Pool

```ts
db.addConnection({
  driver: 'mysql',
  factory: mysqlDriver(),
  host: '127.0.0.1',
  port: 3306,
  database: 'app',
  username: 'root',
  password: 'secret',
  pool: { min: 2, max: 10 },
});
```

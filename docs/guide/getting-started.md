
# Getting Started

This guide takes you from install to working CRUD with Fedaco in TypeScript.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- TypeScript project with `experimentalDecorators` and `emitDecoratorMetadata` enabled

## Install Packages

Install Fedaco and one database driver package. The driver is required at runtime.

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

## 1. Bootstrap Fedaco

Create one file (for example `src/db.ts`) and initialize the connection:

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

## 2. Create Table

Use the schema builder to create a table:

```ts
import { schema } from '@gradii/fedaco';

await schema().create('users', (table) => {
  table.increments('id');
  table.string('name');
  table.string('email').withUnique();
  table.timestamps();
});
```

## 3. Define a Model

```ts
import { Column, CreatedAtColumn, Model, PrimaryGeneratedColumn, Table, UpdatedAtColumn } from '@gradii/fedaco';

@Table({ tableName: 'users' })
export class User extends Model {
  _fillable = ['name', 'email'];

  @PrimaryGeneratedColumn()
  declare id: number;

  @Column()
  declare name: string;

  @Column()
  declare email: string;

  @CreatedAtColumn()
  declare created_at: Date;

  @UpdatedAtColumn()
  declare updated_at: Date;
}
```

## 4. Query Data

```ts
// create
const created = await User.createQuery().create({
  name: 'Ada',
  email: 'ada@example.com',
});

// read
const user = await User.createQuery().where('email', 'ada@example.com').first();

// update
await user.update({ name: 'Ada Lovelace' });

// delete
await user.delete();
```

## 5. Use Query Builder Directly

```ts
import { db } from '@gradii/fedaco';

const rows = await db()
  .query()
  .from('users')
  .select(['id', 'name', 'email'])
  .orderBy('id', 'desc')
  .get();
```

## Next Reading

- [Database Configuration](/database/getting-started)
- [Migration Guide](/guide/migration)
- [Transactions Guide](/database/transactions)
- [Transaction With Models](/database/transaction-with-models)
- [Transaction Options](/database/transaction-options)
- [Schema Operations](/database/schema-operations)
- [Nest Integration](/guide/nest-integration)
- [Relationships](/relationships/defining-relationships/relation-one-to-one)
- [Model Functions](/model-functions/createQuery)

## Example Repositories

- Fedaco examples: [https://github.com/gradii/fedaco-examples](https://github.com/gradii/fedaco-examples)

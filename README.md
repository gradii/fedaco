# Fedaco ORM

[![Build Status](https://github.com/gradii/fedaco/workflows/CI/badge.svg)](https://github.com/gradii/fedaco/actions?query=workflow%3ACI)

Laravel Eloquent-style ORM for TypeScript. Decorator-based models, fluent query builder, eager-loaded relationships, transactions, schema builder.

📚 **[Full documentation](https://gradii.github.io/fedaco/)** · 🧪 **[Examples](https://github.com/gradii/fedaco-examples)**

## Install

Install fedaco core plus **one driver package per database** you want to talk to:

```sh
# SQLite (good default for local dev / tests)
npm install @gradii/fedaco @gradii/fedaco-sqlite-driver
```

| Database          | Driver package                      |
| ----------------- | ----------------------------------- |
| SQLite            | `@gradii/fedaco-sqlite-driver`      |
| MySQL / MariaDB   | `@gradii/fedaco-mysql-driver`       |
| PostgreSQL        | `@gradii/fedaco-postgres-driver`    |
| SQL Server        | `@gradii/fedaco-sqlserver-driver`   |

Enable `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json`.

## Quick Start

### 1. Set up a connection

```typescript
import { DatabaseConfig } from '@gradii/fedaco';
import { sqliteDriver } from '@gradii/fedaco-sqlite-driver';

const db = new DatabaseConfig();

db.addConnection({
  driver: 'sqlite',
  factory: sqliteDriver(),
  database: ':memory:',
});

db.bootFedaco();
db.setAsGlobal();
```

The `factory` field is required — fedaco no longer ships drivers in core, so the driver package supplies its own factory.

### 2. Create a table

```typescript
import { schema } from '@gradii/fedaco';

await schema().create('users', (table) => {
  table.increments('id');
  table.string('email').withUnique();
  table.string('name').nullable();
  table.integer('age').nullable();
  table.timestamps();
});
```

### 3. Define a model

```typescript
import {
  Column,
  CreatedAtColumn,
  Model,
  PrimaryGeneratedColumn,
  Table,
  UpdatedAtColumn,
} from '@gradii/fedaco';

@Table({ tableName: 'users' })
export class User extends Model {
  _fillable = ['email', 'name', 'age'];

  @PrimaryGeneratedColumn()
  declare id: number;

  @Column()
  declare email: string;

  @Column()
  declare name: string;

  @Column()
  declare age: number;

  @CreatedAtColumn()
  declare created_at: Date;

  @UpdatedAtColumn()
  declare updated_at: Date;
}
```

### 4. CRUD

```typescript
// create
const user = await User.createQuery().create({
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  age: 36,
});

// read
const list = await User.createQuery().where('age', '>', 18).get();
const ada = await User.createQuery().where('email', 'ada@example.com').first();

// update
await ada.Update({ age: 37 });

// delete
await ada.Delete();
```

### 5. Transactions

```typescript
import { db } from '@gradii/fedaco';

await db().transaction(async (tx) => {
  const user = await User.createQuery(tx).create({
    email: 'bob@example.com',
    name: 'Bob',
    age: 25,
  });
  // every model query inside this callback uses `tx`
});
```

For long-running or concurrent transactions, opt into `isolated: true` with a connection pool — see the [Connection Pooling guide](https://gradii.github.io/fedaco/guide/connection-pooling.html).

## Features

- Decorator-based model definition (`@Table`, `@Column`, `@PrimaryGeneratedColumn`, `@CreatedAtColumn`, …)
- Fluent query builder compiled to SQL
- All eager-load patterns: `HasOne`, `HasMany`, `BelongsTo`, `BelongsToMany`, `HasOneThrough`, `HasManyThrough`, `HasOneOfMany`, polymorphic
- Per-relation `onQuery` hook for baked-in constraints, custom pivots, "one of many" disambiguation
- Soft deletes, mass-assignment guards, accessors, casts
- Multi-connection, read/write split, connection pooling, isolated transactions
- Schema builder with migration CLI
- Drivers: SQLite (sqlite3 / better-sqlite3), MySQL, MariaDB, PostgreSQL, SQL Server
- NestJS module: [`@gradii/nest-fedaco`](https://github.com/gradii/fedaco/tree/main/libs/nest-fedaco)

## TypeScript Note

When `target` is `es2022` or higher, TypeScript emits modern class-field semantics — every declared field is initialised to `undefined` in the constructor, which clobbers values fedaco populates via decorators.

**Workaround** — mark every column declaration with `declare` so TypeScript skips the runtime field initialisation:

```typescript
@Table({ tableName: 'users' })
class User extends Model {
  @PrimaryGeneratedColumn()
  declare id: number;   // <-- `declare`, not a plain field

  @Column()
  declare email: string;
}
```

## Documentation

- [Getting Started](https://gradii.github.io/fedaco/guide/getting-started.html)
- [Multiple Connections](https://gradii.github.io/fedaco/guide/multiple-connections.html)
- [Connection Pooling & Isolated Transactions](https://gradii.github.io/fedaco/guide/connection-pooling.html)
- [Writing a Custom Driver](https://gradii.github.io/fedaco/guide/custom-driver.html)
- [Nest Integration](https://gradii.github.io/fedaco/guide/nest-integration.html)
- [Migration Guide](https://gradii.github.io/fedaco/guide/migration.html)
- [Transactions](https://gradii.github.io/fedaco/database/transactions.html)
- [Defining Relationships](https://gradii.github.io/fedaco/relationships/defining-relationships/relation-one-to-one.html)
- [Predefined `onQuery` Hook](https://gradii.github.io/fedaco/relationships/defining-relationships/on-query.html)
- [Model Functions Reference](https://gradii.github.io/fedaco/model-functions/createQuery.html)

## License

MIT

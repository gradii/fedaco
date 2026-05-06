# E2E Scenario: Transaction With Models

This guide is derived from `apps/fedaco-e2e/src/test/transaction/transaction-with-models.spec.ts`.

## Setup Pattern

```ts
import { Column, DatabaseConfig, Model, PrimaryColumn, Table } from '@gradii/fedaco';
import { sqliteDriver } from '@gradii/fedaco-sqlite-driver';

@Table({ tableName: 'users' })
class User extends Model {
  _timestamps = false;

  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}
```

Use a connection and create tables before each scenario.

## Pattern 1: `.withConnection(tx)`

```ts
await connection.transaction(async (tx) => {
  const user = await User.createQuery()
    .withConnection(tx)
    .create({ name: 'Alice', email: 'alice@example.com' });

  await Post.createQuery()
    .withConnection(tx)
    .create({
      user_id: user.id,
      title: 'First Post',
      content: 'Hello World',
    });
});
```

## Pattern 2: `createQuery(tx)`

```ts
await connection.transaction(async (tx) => {
  const user = await User.createQuery(tx).create({
    name: 'Bob',
    email: 'bob@example.com',
  });

  await Post.createQuery(tx).create({
    user_id: user.id,
    title: 'Second Post',
    content: 'Using createQuery(tx)',
  });
});
```

## Rollback Behavior

Both patterns roll back when an error is thrown:

```ts
await connection.transaction(async (tx) => {
  await User.createQuery(tx).create({ name: 'David', email: 'david@example.com' });
  throw new Error('Transaction failed');
});
```

After rollback, inserted rows are not persisted.

## With Transaction Options

```ts
await connection.transaction(
  async (tx) => {
    await User.createQuery(tx).create({ name: 'Frank', email: 'frank@example.com' });
  },
  { timeout: 5000, isolationLevel: 'SERIALIZABLE' },
);
```

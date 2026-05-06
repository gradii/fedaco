# Transactions Guide

This guide follows patterns used in `apps/fedaco-e2e/src/test/transaction/*`.

## Basic Transaction

Use the transaction-scoped connection passed into the callback:

```ts
await db().transaction(async (tx) => {
  await tx.table('users').insert({ name: 'Alice' });
  await tx.table('users').where({ name: 'Alice' }).update({ name: 'Alice A.' });
});
```

## Rollback On Error

Throwing inside callback rolls back all changes:

```ts
await db().transaction(async (tx) => {
  await tx.table('users').insert({ name: 'Alice' });
  throw new Error('force rollback');
});
```

## Nested Transactions

Nested transactions are supported and tracked by level:

```ts
await db().transaction(async () => {
  await db().table('users').insert({ name: 'Outer' });

  await db().transaction(async () => {
    await db().table('users').insert({ name: 'Inner' });
  });
});
```

## Manual Transaction API

```ts
await db().beginTransaction();
try {
  await db().table('users').insert({ name: 'Manual' });
  await db().commit();
} catch (e) {
  await db().rollBack();
  throw e;
}
```

## Model Queries In Transaction

From e2e, both patterns are valid:

```ts
await db().transaction(async (tx) => {
  await User.createQuery(tx).create({ name: 'Bob', email: 'bob@example.com' });

  await User.createQuery()
    .withConnection(tx)
    .where('name', 'Bob')
    .update({ email: 'bob2@example.com' });
});
```

## Transaction Options

```ts
await db().transaction(
  async (tx) => {
    await tx.table('users').insert({ name: 'OptionUser' });
  },
  {
    timeout: 5000,
    isolationLevel: 'SERIALIZABLE',
    attempts: 3,
    isolated: true,
  },
);
```

- `timeout`: rolls back if callback exceeds limit
- `isolationLevel`: sets SQL isolation
- `attempts`: retries on concurrency errors (for example deadlock)
- `isolated`: uses dedicated connection; can use connector fallback when no pool manager exists

## Transaction Manager Hooks

When needed, set `DatabaseTransactionsManager` to observe begin/commit/rollback and register callbacks:

```ts
const manager = new DatabaseTransactionsManager();
db().setTransactionManager(manager);

await db().transaction(async () => {
  await db().table('users').insert({ name: 'Tracked' });
});
```

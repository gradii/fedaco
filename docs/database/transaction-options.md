# E2E Scenario: Transaction Options

This guide is derived from `apps/fedaco-e2e/src/test/transaction/transaction-options.spec.ts`.

## Base Usage

```ts
await connection.transaction(async (tx) => {
  await tx.statement('INSERT INTO users (name) VALUES (?)', ['Alice']);
});
```

## Timeout

```ts
await connection.transaction(
  async (tx) => {
    await tx.statement('INSERT INTO users (name) VALUES (?)', ['Alice']);
  },
  { timeout: 5000 },
);
```

When the callback runs too long, transaction throws and rolls back:

```ts
await connection.transaction(
  async (tx) => {
    await tx.statement('INSERT INTO users (name) VALUES (?)', ['Alice']);
    await new Promise((resolve) => setTimeout(resolve, 200));
  },
  { timeout: 100 },
);
```

## Isolation Level

```ts
await connection.transaction(
  async (tx) => {
    await tx.statement('INSERT INTO users (name) VALUES (?)', ['Alice']);
  },
  { isolationLevel: 'SERIALIZABLE' },
);
```

## Retry Attempts

```ts
await connection.transaction(
  async (tx) => {
    if (needRetry) {
      throw new Error('Deadlock found when trying to get lock');
    }
    await tx.statement('INSERT INTO users (name) VALUES (?)', ['Alice']);
  },
  { attempts: 3 },
);
```

## Isolated Transactions

```ts
await connection.transaction(
  async (tx) => {
    await tx.statement('INSERT INTO users (name) VALUES (?)', ['Alice']);
    await tx.statement('INSERT INTO users (name) VALUES (?)', ['Bob']);
  },
  { isolated: true },
);
```

From e2e:
- Isolated transactions can run even without a pool manager (connector fallback)
- For SQLite isolated mode, file-based DB is required for shared visibility (`:memory:` is not shared across handles)

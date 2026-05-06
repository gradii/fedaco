# `chunkById`

Process matching rows in fixed-size pages, using **keyset pagination** instead of OFFSET. Safer than [`chunk`](./chunk) when rows are inserted or deleted while you're iterating.

## Signature

```ts
FedacoBuilder<T>.chunkById(
  count: number,
  callback: (models: T[], page: number) => Promise<boolean | void> | boolean | void,
  column?: string,
  alias?: string,
): Promise<boolean>
```

## Parameters

| Name        | Description |
| ----------- | ----------- |
| `count`     | Page size. |
| `callback`  | Receives the page's models. Return `false` to stop iteration. |
| `column`    | Column to paginate by. Defaults to the model's primary key. |
| `alias`     | Alias for the `column` if it's been aliased in the SELECT (joins, subqueries). |

## Returns

`Promise<boolean>` — `true` if iteration completed, `false` if a callback short-circuited.

## Real-World Use Cases

### 1. Backfill safe under concurrent writes

```ts
await User.createQuery()
  .where('legacy_password_hash', 'is not', null)
  .chunkById(500, async (users) => {
    for (const u of users) {
      await migrateHash(u);
    }
  });
```

Each chunk is `WHERE id > <last_id> ORDER BY id LIMIT 500`. Even if other code inserts users mid-scan, you keep moving forward — no rows are skipped or revisited.

### 2. Custom column

Useful when the table has a sequential `created_at` and you want time-ordered iteration:

```ts
await Event.createQuery()
  .where('processed', false)
  .chunkById(100, async (batch) => {
    for (const e of batch) await process(e);
  }, 'created_at');
```

The column should be unique and monotonic to avoid skipping ties.

### 3. Stop early

```ts
let processed = 0;
await Order.createQuery().chunkById(1000, (orders) => {
  for (const o of orders) processOrder(o);
  processed += orders.length;
  if (processed >= 100_000) return false;
});
```

### 4. Aliased column

When joining and the primary key column has been aliased:

```ts
await Order.createQuery()
  .leftJoin('users', 'users.id', '=', 'orders.user_id')
  .select('orders.id as order_id', 'users.email')
  .chunkById(500, async (rows) => {...}, 'orders.id', 'order_id');
```

## `chunkById` vs `chunk` vs `each` / `eachById`

| Method        | Pagination strategy | Stable under writes? | Per-row callback? |
| ------------- | ------------------- | -------------------- | ----------------- |
| [`chunk`](./chunk)         | LIMIT/OFFSET    | ✗ shifts on insert/delete | ✗ — chunk |
| [`chunkById`](./chunkById) | `WHERE id > X`  | ✓                       | ✗ — chunk |
| [`each`](./each)           | wraps `chunk`   | ✗                       | ✓ |
| [`eachById`](./eachById)   | wraps `chunkById` | ✓                     | ✓ |

Default to `chunkById` / `eachById` unless you've measured that OFFSET is faster on a static table.

## Common Pitfalls

- **Column must be unique and monotonic.** `chunkById` on a non-unique column may skip rows that share the same value at a page boundary.
- **Order is implied** — `chunkById` adds its own `ORDER BY column ASC`. Don't add a conflicting one.
- **Cursor lives in memory.** If your iteration takes hours, the last id is still in JS — fine for processes, but a long-running cursor could be lost on crash. Add idempotent restart logic if needed.

## See Also

- [`chunk`](./chunk) — OFFSET-based variant.
- [`each`](./each) / [`eachById`](./eachById) — per-row API.
- [`forPageAfterId`](./forPageAfterId) — single keyset page (the building block).

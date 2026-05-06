# `each`

Iterate matching rows one at a time. Wraps [`chunk`](./chunk) — fetches in pages internally, hands you one row per callback.

## Signature

```ts
FedacoBuilder<T>.each(
  callback: (model: T, index: number) => Promise<boolean | void> | boolean | void,
  count?: number,
): Promise<boolean>
```

## Parameters

| Name       | Default | Description |
| ---------- | ------- | ----------- |
| `callback` | —       | Called for each row with the model and a 0-indexed position. Return `false` to stop iteration. |
| `count`    | `1000`  | Page size used internally — how many rows are fetched per database round trip. |

## Returns

`Promise<boolean>` — `true` if iteration completed, `false` if a callback short-circuited.

## Real-World Use Cases

### 1. Per-row processing

```ts
await User.createQuery()
  .where('active', true)
  .orderBy('id')
  .each(async (user) => {
    await sendDigest(user);
  });
```

Memory stays bounded — fedaco loads `count` rows, calls your callback `count` times, then loads the next page.

### 2. Custom page size

```ts
// Smaller pages for heavier per-row work
await Order.createQuery().each(async (order) => {
  await heavyComputation(order);
}, 100);

// Larger pages for lightweight iteration
await User.createQuery().each(async (u) => {
  metrics.increment(u.team_id);
}, 5000);
```

### 3. Stop early

```ts
let count = 0;
await User.createQuery().each((u) => {
  count += u.balance;
  if (count > 1_000_000) return false;
});
```

### 4. Index in callback

```ts
await Post.createQuery()
  .orderBy('created_at')
  .each((post, i) => {
    if (i % 100 === 0) console.log(`processed ${i}`);
  });
```

## `each` vs `eachById` vs `chunk`

| Method                 | Pagination | Per-row API |
| ---------------------- | ---------- | ----------- |
| [`each`](./each)       | LIMIT/OFFSET (via `chunk`)    | ✓ |
| [`eachById`](./eachById) | `WHERE id > X` (via `chunkById`) | ✓ |
| [`chunk`](./chunk)     | LIMIT/OFFSET    | ✗ — page array |
| [`chunkById`](./chunkById) | `WHERE id > X` | ✗ — page array |

::: tip
Use [`eachById`](./eachById) by default — it's stable when other writers are running on the same table.
:::

## Common Pitfalls

- **`OFFSET`-based** by default. If the table is being written to during iteration, rows can be skipped or revisited. Switch to `eachById`.
- **`async` callbacks are awaited.** A callback that fires-and-forgets won't apply back-pressure.
- **Always order.** Without `orderBy`, "next page" has no defined contents.

## See Also

- [`eachById`](./eachById) — keyset-paginated variant.
- [`chunk`](./chunk) / [`chunkById`](./chunkById) — page-at-a-time API.
- [`paginate`](./paginate) — for user-facing pagination.

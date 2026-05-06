# `chunk`

Process matching rows in fixed-size pages. Use when you want to walk a large result set without holding it all in memory.

## Signature

```ts
FedacoBuilder<T>.chunk(
  count: number,
  callback: (models: T[], page: number) => Promise<boolean | void> | boolean | void,
): Promise<boolean>
```

## Parameters

| Name        | Description |
| ----------- | ----------- |
| `count`     | Page size (rows per chunk). |
| `callback`  | Called once per chunk with the page's models and the 1-indexed page number. Returning `false` stops iteration. |

## Returns

`Promise<boolean>` — `true` if iteration completed, `false` if a callback short-circuited.

## Real-World Use Cases

### 1. Server-side batch processing

```ts
await User.createQuery()
  .where('active', true)
  .orderBy('id')
  .chunk(500, async (users) => {
    for (const u of users) {
      await sendWeeklyDigest(u);
    }
  });
```

Each chunk is a separate `SELECT ... LIMIT 500 OFFSET ...`. Memory stays bounded — only 500 rows are hydrated at a time.

### 2. Stop early

```ts
let processed = 0;

await Order.createQuery()
  .where('status', 'pending')
  .orderBy('id')
  .chunk(100, (orders) => {
    for (const o of orders) {
      processOrder(o);
      processed++;
    }
    if (processed >= 1000) return false; // stop iteration
  });
```

### 3. Async work per chunk

```ts
await User.createQuery()
  .orderBy('id')
  .chunk(200, async (batch) => {
    await Promise.all(batch.map((u) => syncToCrm(u)));
  });
```

Fedaco awaits your callback before fetching the next chunk, so back-pressure is automatic.

### 4. Filtered + ordered chunking

```ts
await Post.createQuery()
  .where('archived', false)
  .where('updated_at', '<', oneYearAgo)
  .orderBy('updated_at')
  .chunk(1000, async (posts) => {
    await Post.createQuery().whereIn('id', posts.map((p) => p.id)).update({ archived: true });
  });
```

## `chunk` vs `chunkById` vs `each`

| Method        | Strategy | When to use |
| ------------- | -------- | ----------- |
| [`chunk`](./chunk)     | LIMIT + OFFSET   | Static result set; rows aren't being inserted/deleted while you iterate. |
| [`chunkById`](./chunkById) | `WHERE id > last` | Default for safety — stable when rows shift, primary-key-ordered. |
| [`each`](./each)       | Iteration on top of `chunk` | When you want a row-at-a-time API. |
| [`eachById`](./eachById) | Iteration on top of `chunkById` | Same as `each`, but with the safer paging strategy. |

::: warning
`chunk` uses OFFSET. **If your callback inserts or deletes rows in the same scan range, the offsets shift and you can skip or re-visit rows.** Switch to `chunkById` whenever in doubt.
:::

## Common Pitfalls

- **Always order**, otherwise the LIMIT/OFFSET pages have no defined contents.
- **Awaitable callbacks must be `async` or return a `Promise`.** A synchronous callback that internally fires off `setTimeout`-style work won't be awaited.
- **Memory is bounded per chunk, not total.** If you collect all rows into an outer array, you've defeated the purpose.
- **Returning `false`** stops the loop; returning anything else (or `undefined`) continues.

## See Also

- [`chunkById`](./chunkById) — keyset chunking; safer when the table is being written to.
- [`each`](./each) / [`eachById`](./eachById) — per-row iteration.
- [`forPageAfterId`](./forPageAfterId) — single keyset page (the building block for `chunkById`).
- [`paginate`](./paginate) — UI pagination instead of server-side iteration.

# `forPageAfterId`

Build the SQL for **a single keyset page**: `WHERE id > <lastSeenId> ORDER BY id LIMIT N`. The building block underneath [`chunkById`](./chunkById) and [`eachById`](./eachById).

## Signature

```ts
FedacoBuilder<T>.forPageAfterId(
  perPage: number,
  lastId: number | string | null,
  column?: string,
): this
```

## Parameters

| Name      | Default | Description |
| --------- | ------- | ----------- |
| `perPage` | —       | Rows per page. |
| `lastId`  | —       | The cursor — pass the last id from the previous page. Use `0` (or the smallest possible value) for the first page. |
| `column`  | primary key | The cursor column. Must be unique and monotonic. |

Returns `this` — chainable. Consume with `.get()` / `.first()`.

## Real-World Use Cases

### 1. Manual cursor pagination

```ts
let cursor = 0;
while (true) {
  const page = await User.createQuery()
    .forPageAfterId(500, cursor)
    .get();

  if (page.length === 0) break;

  for (const user of page) {
    await processUser(user);
  }

  cursor = page[page.length - 1].id;
}
```

### 2. From an HTTP `?after=...` parameter

```ts
async function listAfter(req: Request) {
  const after = req.query.after ? Number(req.query.after) : 0;
  const limit = 50;

  const rows = await User.createQuery()
    .forPageAfterId(limit, after)
    .get();

  return {
    items: rows,
    nextCursor: rows.length === limit ? rows[rows.length - 1].id : null,
  };
}
```

This is the cursor-based pattern most APIs (GitHub, Stripe) use — stable under writes, no `OFFSET` cost growing with page number.

### 3. Custom cursor column

```ts
const rows = await Event.createQuery()
  .forPageAfterId(100, lastEventTimestamp, 'created_at')
  .get();
```

When the table is naturally time-ordered. The column must be unique — if two events share a `created_at`, one will be skipped at a page boundary. Use a `(created_at, id)` composite cursor when ties happen.

### 4. Combined with WHERE clauses

```ts
const rows = await Order.createQuery()
  .where('status', 'paid')
  .forPageAfterId(200, after)
  .get();
```

`forPageAfterId` adds its own `WHERE id > X ORDER BY id ASC` — fedaco preserves your other filters.

## `forPageAfterId` vs `paginate` vs `chunkById`

| Tool                                | Strategy        | UI / cursor | Stable under writes? |
| ----------------------------------- | --------------- | ----------- | -------------------- |
| [`paginate`](./paginate)            | OFFSET + COUNT(*) | page number | ✗ |
| [`forPageAfterId`](./forPageAfterId) | keyset (manual) | cursor    | ✓ |
| [`chunkById`](./chunkById)          | keyset (auto-loop) | n/a    | ✓ |

## Common Pitfalls

- **Always pass an integer/scalar `lastId`** — `null` typically resolves to `0`, but be explicit.
- **The cursor column must be ordered ASC** internally. Don't add a conflicting `orderBy(column, 'desc')`.
- **Compound keys aren't directly supported.** For composite cursors (timestamp + id), encode the comparison via `whereRaw`.

## See Also

- [`chunkById`](./chunkById) — automated loop over keyset pages.
- [`eachById`](./eachById) — per-row variant.
- [`paginate`](./paginate) — UI pagination.

# `paginate`

Run two queries: a `COUNT(*)` for the total and a paged `SELECT` for the slice. Returns metadata you can render directly.

## Signature

```ts
FedacoBuilder<T>.paginate(
  page?: number,
  pageSize?: number,
  columns?: string[],
): Promise<{
  items: T[];
  total: number;
  pageSize: number;
  page: number;
}>
```

## Parameters

| Name       | Default | Description |
| ---------- | ------- | ----------- |
| `page`     | `1`     | 1-indexed page number. |
| `pageSize` | model's `_perPage` (default `10`) | Rows per page. |
| `columns`  | `['*']` | Columns to select on the row query. The COUNT query ignores this. |

## Returns

```ts
{
  items: T[];      // hydrated models for the requested page
  total: number;   // total matching rows (independent of page)
  pageSize: number;
  page: number;
}
```

## Real-World Use Cases

### 1. Basic pagination

```ts
const result = await Post.createQuery()
  .where('published', true)
  .orderBy('created_at', 'desc')
  .paginate(1, 20);

console.log(result.items);   // 20 posts
console.log(result.total);   // total matching rows
console.log(Math.ceil(result.total / result.pageSize)); // total pages
```

### 2. Driven by query string

```ts
async function listPosts(req: Request) {
  const page = Number(req.query.page ?? 1);
  const size = Math.min(Number(req.query.size ?? 20), 100); // clamp

  return Post.createQuery()
    .where('published', true)
    .orderBy('id', 'desc')
    .paginate(page, size);
}
```

### 3. With eager-loaded relations

```ts
const result = await Post.createQuery()
  .with('author', 'tags')
  .where('published', true)
  .paginate(page, 20);
```

The `with` is applied after the paged select, so the eager-load batched query covers exactly the rows on the current page.

### 4. Empty page

When no rows match, `items` is `[]` and the count query is skipped from the result fetch (it still ran):

```ts
const empty = await User.createQuery().where('active', null).paginate();
// { items: [], total: 0, pageSize: 10, page: 1 }
```

### 5. Lighter alternative — `simplePaginate`

For "next/prev" UIs that don't need a total count:

```ts
const result = await Post.createQuery()
  .orderBy('id', 'desc')
  .simplePaginate(page, 20);

// { items: T[], pageSize: number, page: number } — no `total`, no COUNT(*)
```

`simplePaginate` over-fetches by 1 row to detect a next page; check `items.length > pageSize` to know whether to render a "next" link.

### 6. Custom `_perPage` per model

```ts
@Table({ tableName: 'audit_logs' })
class AuditLog extends Model {
  _perPage = 50; // default page size for this model
}

const result = await AuditLog.createQuery().paginate(1); // pageSize: 50
```

## Common Pitfalls

- **Always order before paginating.** Without an `ORDER BY`, the database may return rows in any order, and pages can shift between requests.
- **`paginate` runs two queries.** For very large tables where COUNT(*) is slow, prefer `simplePaginate` or a cursor-based approach.
- **Page is 1-indexed.** Page `0` would `OFFSET -pageSize`, which most databases reject.
- **`columns` doesn't affect COUNT.** If your `select(...)` is computed (joins, expressions), make sure `paginate` still returns the right total — restate the where clauses, not the select.

## See Also

- [`simplePaginate`](./pluck) — no-total variant for cursor-style UI.
- [`forPageAfterId`](./forPageAfterId) — keyset pagination for stable ordering on large tables.
- [`getCountForPagination`](./getCountForPagination) — the underlying total-rows query.
- [`chunk`](./chunk) / [`chunkById`](./chunkById) — process all rows server-side without paging in user space.

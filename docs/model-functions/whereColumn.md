# `whereColumn`

Compare two columns (or pairs of columns) within the same query. Compiles to `WHERE col_a = col_b`, not `WHERE col_a = ?` — no value binding, just a column-to-column predicate.

## Signature

```ts
FedacoBuilder<T>.whereColumn(first: string, second: string): this
FedacoBuilder<T>.whereColumn(first: string, operator: string, second: string): this
FedacoBuilder<T>.whereColumn(pairs: Array<[string, string] | [string, string, string]>): this

FedacoBuilder<T>.orWhereColumn(...): this
```

## Parameters

| Name        | Description |
| ----------- | ----------- |
| `first`     | Left-hand column. |
| `operator`  | `=`, `!=`, `<`, `<=`, `>`, `>=`. Defaults to `=`. |
| `second`    | Right-hand column. |
| `pairs`     | Array form for multiple comparisons in one call. |

## Real-World Use Cases

### 1. Correlated subquery for counting

The canonical e2e pattern — a self-correlated count via `whereColumn`:

```ts
const query = await User.createQuery()
  .select({
    0: 'id',
    friends_count: await User.createQuery()
      .whereColumn('friend_id', 'user_id')
      .count(),
  })
  .groupBy('email')
  .getQuery();
```

The inner query counts friend rows where `friend_id` equals the outer row's `user_id` — pure column-to-column comparison.

### 2. Sub-query foreign-key match

Common in `EXISTS` / `whereHas` style queries:

```ts
await User.createQuery()
  .whereExists((q) => {
    q.from('orders')
     .whereColumn('orders.user_id', 'users.id')
     .where('orders.status', 'paid');
  })
  .get();
```

This is exactly the pattern `whereHas` uses internally — `whereColumn` matches the parent FK to the child PK without a binding.

### 3. Find rows where two columns disagree

```ts
// Posts whose `version` field disagrees with `latest_version`.
await Post.createQuery()
  .whereColumn('version', '!=', 'latest_version')
  .get();
```

### 4. Multiple comparisons in one call

```ts
await Inventory.createQuery()
  .whereColumn([
    ['warehouse_id', '=', 'preferred_warehouse_id'],
    ['stock', '>=', 'minimum'],
  ])
  .get();
```

### 5. Operator on `OR`

```ts
await User.createQuery()
  .where('active', true)
  .orWhereColumn('last_login_at', '>', 'created_at')
  .get();
```

## `whereColumn` vs `where`

| Tool             | Right-hand side | Compiles to |
| ---------------- | --------------- | ----------- |
| `where('a', 1)`         | bound value     | `a = ?` |
| `where('a', 'b')`       | bound value     | `a = ?` (with `'b'` as a string) |
| `whereColumn('a', 'b')` | column reference | `a = b` |

**This is a common foot-gun**: `where('a', 'b')` doesn't compare two columns — it compares column `a` to the literal string `'b'`. Use `whereColumn` whenever both operands are columns.

## Common Pitfalls

- **Both operands are column references.** Don't pass values to either side — they'll be quoted as identifiers, not as data.
- **Qualify with the table name** when ambiguous (`'users.id'` rather than `'id'`) inside joins.
- **For complex correlated queries**, prefer `whereExists` + `whereColumn` rather than hand-rolled `whereRaw` — keeps the SQL portable across drivers.

## See Also

- [`where`](./where) — value-based predicates.
- `whereExists` — for correlated subqueries.
- [`join`](./join) — when you actually want to combine the rows.
- [`getCountForPagination`](./getCountForPagination) — common consumer of correlated `whereColumn`.

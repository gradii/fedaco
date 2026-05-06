# `where`

Add a `WHERE` clause to the query. Identical signature on both `FedacoBuilder` and the underlying `QueryBuilder` — the model form qualifies columns with the model's table when needed.

## Signatures

```ts
.where(column: string, value: any): this
.where(column: string, operator: string, value: any): this
.where(callback: (q: FedacoBuilder) => void): this  // nested group
.where(conditions: Record<string, any>): this        // map of equality clauses
```

## Parameters

| Name        | Description |
| ----------- | ----------- |
| `column`    | Column name. Use a `'table.column'` string when joining or to disambiguate. |
| `operator`  | SQL operator: `=`, `!=`, `<`, `<=`, `>`, `>=`, `like`, `not like`, `in`, `not in`, `between`, … When omitted, `=` is implied. |
| `value`     | Right-hand side. Arrays bind as `IN (...)`. Pass `null` with `is`/`is not` for null checks. |
| `callback`  | A function that receives a fresh sub-builder for nested grouping. The result is wrapped in parentheses. |

The two-argument form (`.where('col', value)`) is shorthand for `=`.

## Real-World Use Cases

### 1. Equality and basic operators

```ts
await User.createQuery().where('email', 'ada@example.com').first();

await Order.createQuery()
  .where('status', '=', 'pending')
  .where('total', '>', 100)
  .get();
```

### 2. `IN` via array

```ts
const usersInTeam = await User.createQuery()
  .where('team_id', [1, 2, 3])
  .get();
```

This compiles to `WHERE team_id IN (?, ?, ?)`. For an explicit `whereIn`, see [`whereIn`](./where#) on the query builder API.

### 3. Like / pattern match

```ts
await Product.createQuery()
  .where('name', 'like', '%coffee%')
  .orderBy('name')
  .get();
```

### 4. Equality map (the conditions object form)

When all clauses are simple equalities:

```ts
await User.createQuery()
  .where({
    team_id: 7,
    role: 'admin',
    active: true,
  })
  .get();
```

### 5. Nested groups with `OR`

Use a callback to build a parenthesised group:

```ts
await User.createQuery()
  .where('active', true)
  .where((q) => {
    q.where('role', 'admin').orWhere('role', 'owner');
  })
  .get();
// SELECT ... WHERE active = ? AND (role = ? OR role = ?)
```

### 6. Combining with relations — `whereHas`

`where` is for columns on the model's own table; for filtering by a related table, use [`whereHas`](./whereHas):

```ts
await User.createQuery()
  .whereHas('posts', (q) => {
    q.where('published', true);
  })
  .get();
```

### 7. Negation: `whereKeyNot`, `whereNotIn`

Special helpers for primary-key negation:

```ts
await User.createQuery().whereKeyNot(currentUser.id).get();
```

### 8. Date comparisons

The query builder accepts `Date` objects — they're serialised via the connection's date format:

```ts
await Order.createQuery()
  .where('created_at', '>=', new Date('2026-01-01'))
  .get();
```

For day/month/year extraction, prefer the dedicated where-date mixins (`whereDate`, `whereMonth`, …).

## Common Pitfalls

- **Two-arg ambiguity**: `.where('col', null)` is treated as `col = NULL` (which never matches). Use `.whereNull('col')` for null checks.
- **Operator typos** throw `InvalidArgumentException Illegal operator and value combination` from `_invalidOperatorAndValue`. Check your operator against the supported list.
- **Column name vs alias**: when joining, qualify with `'orders.status'` to avoid the wrong table picking it up.

## See Also

- [`firstWhere`](./first) — `where(...).first()` shorthand.
- [`whereHas`](./whereHas) / [`has`](./has) — filter by relationship existence.
- [`orderBy`](./oldest) / [`groupBy`](./groupBy) — chain after filtering.
- [`get`](./pluck) — terminal call to materialise the rows.

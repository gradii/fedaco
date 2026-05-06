# `join`

Add a `JOIN` clause to the query. Several flavours: standard `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `CROSS JOIN`, plus subquery variants.

## Signature

```ts
FedacoBuilder<T>.join(table: string, first: string, operator: string, second: string): this
FedacoBuilder<T>.join(table: string, callback: (q: JoinClause) => void): this

FedacoBuilder<T>.leftJoin(...): this
FedacoBuilder<T>.rightJoin(...): this
FedacoBuilder<T>.crossJoin(...): this

FedacoBuilder<T>.joinSub(
  query: QueryBuilder | ((q) => void),
  as: string,
  first: string,
  operator: string,
  second: string,
): this
```

## Real-World Use Cases

### 1. Inner join with model context

```ts
const rows = await User.createQuery()
  .join('orders', 'users.id', '=', 'orders.user_id')
  .select('users.id', 'users.email', 'orders.total')
  .where('orders.status', 'paid')
  .get();
```

The result hydrates `User` instances — only the columns from `users` populate model fields. Joined `orders.*` columns end up as raw values on the model.

### 2. Left join with eager-load alternative

For most cases — "users and their orders" — prefer eager-load:

```ts
const users = await User.createQuery().with('orders').get();
```

Use a join when you specifically need the **flattened tabular shape** for grouping or specialised filtering.

### 3. Multi-condition `ON` via callback

```ts
await User.createQuery()
  .leftJoin('roles', (j) => {
    j.on('users.id', '=', 'roles.user_id')
      .where('roles.expired', false);
  })
  .get();
```

### 4. Join a subquery

```ts
await Order.createQuery()
  .joinSub(
    (q) => q.from('order_items')
            .select('order_id', db().raw('SUM(qty) AS total_qty'))
            .groupBy('order_id'),
    'item_totals',
    'orders.id',
    '=',
    'item_totals.order_id',
  )
  .select('orders.*', 'item_totals.total_qty')
  .get();
```

### 5. Cross join

```ts
await db().query()
  .from('regions')
  .crossJoin('months')
  .select('regions.id', 'months.id')
  .get();
```

## Common Pitfalls

- **Hydration only fills the model's own columns.** Joined columns appear in the result row but aren't model attributes by default — use `select` to project them out, then read them via `getAttribute(...)`.
- **Watch out for column collisions.** Both tables having an `id` column means the result picks one. Prefix with `users.id`, `orders.id`, etc.
- **For relations, prefer `with` / `whereHas`.** Joins are imperative; `with` describes intent and stays orthogonal to the model schema.

## See Also

- [`with`](./with) — load relations as a side query.
- [`whereHas`](./whereHas) — filter parents by relation existence.
- [`groupBy`](./groupBy) — for aggregating joined data.
- [`select`](./select) — project specific columns.

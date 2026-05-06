# `getCountForPagination`

Return the row count that `paginate` would use for its total. Useful when you want the count *and* the rows in two separate calls, or when you need to override paging behaviour.

## Signature

```ts
FedacoBuilder<T>.getCountForPagination(columns?: string[]): Promise<number>
```

## Parameters

| Name      | Default | Description |
| --------- | ------- | ----------- |
| `columns` | `['*']` | Columns passed through to the COUNT query. The result rarely depends on this — most importantly, fedaco strips ORDER BY and LIMIT from the count query. |

## Real-World Use Cases

### 1. Hand-rolled paginate

When `paginate` doesn't quite fit (e.g. you want to enrich the result with extra metadata):

```ts
const builder = Order.createQuery().where('status', 'paid');

const total = await builder.getCountForPagination();
const items = await builder
  .orderBy('created_at', 'desc')
  .limit(20)
  .offset(0)
  .get();

return {
  items,
  total,
  totalPages: Math.ceil(total / 20),
  hasNext: 0 + items.length < total,
};
```

### 2. Count over a grouped query

`getCountForPagination` handles `GROUP BY` correctly — wrapping the original query in a subquery so the count is the number of *grouped rows*, not the underlying detail count:

```ts
const builder = Order.createQuery()
  .select('user_id', db().raw('SUM(total) AS revenue'))
  .where('status', 'paid')
  .groupBy('user_id');

const numUsers = await builder.getCountForPagination();
// counts distinct user_id groups, not order rows
```

### 3. Subquery + group

Tested e2e pattern — counting distinct emails with a correlated subquery:

```ts
const query = User.createQuery()
  .select({
    0: 'id',
    friends_count: await User.createQuery()
      .whereColumn('friend_id', 'user_id')
      .count(),
  })
  .groupBy('email')
  .getQuery();

const total = await User.createQuery().groupBy('email').getCountForPagination();
```

## How It Differs From `count`

| Method                  | Strips ORDER BY / SELECT? | GROUP BY behaviour |
| ----------------------- | ------------------------- | ------------------ |
| [`count`](./count)      | partly                    | counts rows in groups (one row per group) |
| `getCountForPagination` | yes — replaces them       | wraps the query in a subquery so the count matches what `paginate` shows |

For "size of paginated result" the two often differ — use `getCountForPagination` to match `paginate`.

## Common Pitfalls

- **The query state is preserved on the builder.** Don't call `getCountForPagination` then `get()` expecting paginate-style behaviour — `getCountForPagination` removes ORDER BY/LIMIT internally but doesn't mutate the original builder.
- **For deeply nested subqueries**, double-check the generated SQL with [`toSql`](./toSql). Wrap-in-subquery is correct for grouped queries but adds overhead.

## See Also

- [`paginate`](./paginate) — uses this internally.
- [`count`](./count) — plain COUNT(*).
- [`exists`](./has) / [`doesntExist`](./doesntExist) — boolean.

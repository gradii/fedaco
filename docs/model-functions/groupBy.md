# `groupBy`

Add `GROUP BY` clauses to the query. Pair with aggregates ([`count`](./count) / [`max`](./max) / [`min`](./min) / `sum` / `avg`) and `having` to compute roll-ups in the database.

## Signature

```ts
FedacoBuilder<T>.groupBy(...columns: string[]): this
FedacoBuilder<T>.groupByRaw(sql: string, bindings?: any[]): this
```

## Real-World Use Cases

### 1. Count per dimension

```ts
const rows = await Order.createQuery()
  .select('status', db().raw('COUNT(*) AS total'))
  .groupBy('status')
  .get();

// rows: [{ status: 'pending', total: 12 }, { status: 'paid', total: 87 }, ...]
```

### 2. Multiple group columns

```ts
const rows = await Order.createQuery()
  .select('user_id', 'status', db().raw('COUNT(*) AS total'))
  .groupBy('user_id', 'status')
  .get();
```

### 3. Aggregate plus filter

```ts
const top = await Order.createQuery()
  .select('user_id', db().raw('SUM(total) AS revenue'))
  .where('status', 'paid')
  .groupBy('user_id')
  .having('revenue', '>', 1000)
  .orderBy('revenue', 'desc')
  .limit(20)
  .get();
```

### 4. Date-bucket aggregation (raw)

```ts
const rows = await Event.createQuery()
  .select(db().raw("DATE_TRUNC('day', created_at) AS day"), db().raw('COUNT(*) AS total'))
  .where('user_id', userId)
  .groupByRaw("DATE_TRUNC('day', created_at)")
  .orderBy('day')
  .get();
```

`groupByRaw` is the escape hatch when you need a function call or expression in the GROUP BY.

## Common Pitfalls

- **Fedaco hydrates models from the result rows.** When you GROUP BY, the rows aren't full models — selected aggregate columns aren't part of the model schema. Call `.toBase()` to drop the model layer if you only want plain rows:

  ```ts
  await Order.createQuery()
    .select('user_id', db().raw('COUNT(*) AS total'))
    .groupBy('user_id')
    .toBase()
    .get();
  ```

- **GROUP BY columns must appear in SELECT** in strict SQL modes (MySQL `ONLY_FULL_GROUP_BY`, Postgres). Add them or wrap them in an aggregate.
- **`paginate`** doesn't always do the right thing on grouped queries — the COUNT(*) it builds may not match. Use [`getCountForPagination`](./getCountForPagination) or roll your own.

## See Also

- [`count`](./count), [`max`](./max), [`min`](./min) — aggregates.
- [`having`](./groupBy) — filter on aggregates.
- [`orderBy`](./oldest) — sort the grouped result.

# `max`

Aggregate: `SELECT MAX(column) FROM ... WHERE ...`. Returns the largest value of a column across matching rows.

## Signature

```ts
FedacoBuilder<T>.max(column: string): Promise<number | string | Date | null>
```

## Real-World Use Cases

### 1. Latest timestamp

```ts
const latestLogin = await User.createQuery()
  .where('active', true)
  .max('last_login_at');
// Date or null if no rows
```

### 2. Highest order total

```ts
const biggestOrder = await Order.createQuery()
  .where('status', 'completed')
  .max('total');
```

### 3. Combined with a `whereHas`

```ts
const peakRevenue = await Order.createQuery()
  .whereHas('user', (q) => q.where('active', true))
  .max('total');
```

### 4. Returns `null` on empty result

Calling `max` on a query that matches zero rows returns `null`, not `0`. Branch accordingly:

```ts
const max = await Order.createQuery().where('user_id', userId).max('total');
if (max === null) {
  // user has no orders
}
```

## See Also

- [`min`](./min) — symmetric.
- [`sum`](./pluck) / [`avg`](./pluck) — totals.
- [`count`](./count) — row count (cheaper than collecting and counting).

# `min`

Aggregate: `SELECT MIN(column) FROM ... WHERE ...`. Returns the smallest value of a column across matching rows.

## Signature

```ts
FedacoBuilder<T>.min(column: string): Promise<number | string | Date | null>
```

## Real-World Use Cases

### 1. Earliest signup

```ts
const firstUserAt = await User.createQuery().min('created_at');
```

### 2. Lowest price in a category

```ts
const cheapest = await Product.createQuery()
  .where('category_id', categoryId)
  .where('in_stock', true)
  .min('price');
```

### 3. Returns `null` on empty result

```ts
const min = await Order.createQuery().where('user_id', userId).min('total');
if (min === null) {
  // user has no orders
}
```

## See Also

- [`max`](./max) — symmetric.
- [`count`](./count) — row count.
- [`pluck`](./pluck) — flat values for in-JS aggregation.

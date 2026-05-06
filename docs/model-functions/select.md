# `select`

Choose which columns the query returns. Defaults to `*` when not called.

## Signature

```ts
FedacoBuilder<T>.select(...columns: (string | RawExpression)[]): this
FedacoBuilder<T>.addSelect(...columns: (string | RawExpression)[]): this
FedacoBuilder<T>.selectRaw(expression: string, bindings?: any[]): this
FedacoBuilder<T>.selectSub(query, as: string): this
```

## Real-World Use Cases

### 1. Project specific columns

```ts
const headlines = await Post.createQuery()
  .select('id', 'title', 'created_at')
  .orderBy('created_at', 'desc')
  .limit(20)
  .get();
```

Each `Post` instance has only the projected fields populated. Other fields are `undefined`.

### 2. Aliasing

```ts
await Order.createQuery()
  .select('orders.id AS order_id', 'orders.total AS amount')
  .get();
```

### 3. Add to an existing select

```ts
const q = User.createQuery().select('id', 'email');

if (req.includeName) {
  q.addSelect('name');
}

const users = await q.get();
```

### 4. Raw expressions

```ts
await Order.createQuery()
  .select('user_id', db().raw('SUM(total) AS revenue'))
  .groupBy('user_id')
  .get();
```

`selectRaw` is shorthand:

```ts
await Order.createQuery()
  .selectRaw('user_id, SUM(total) AS revenue')
  .groupBy('user_id')
  .get();
```

### 5. Subquery selection

For computed columns from another table:

```ts
await User.createQuery()
  .select('users.*')
  .selectSub(
    (q) => q.from('orders')
            .whereColumn('orders.user_id', 'users.id')
            .select(db().raw('COUNT(*)')),
    'order_count',
  )
  .get();

// Each user has order_count populated as a raw column.
```

### 6. Select inside a relation eager-load

When eager-loading and you only need a couple of columns from the relation:

```ts
await User.createQuery().with('posts:id,user_id,title').get();
```

Don't drop the foreign key (`user_id`) — fedaco needs it to match children to parents.

## Common Pitfalls

- **`select` resets the column list.** A second call replaces; use `addSelect` to append.
- **Hydrated models reflect what was selected.** Reading an unselected attribute returns `undefined`, not the database value.
- **Aliases need to be in the model's `_visible` / `_fillable` if you want them to round-trip via `toArray`.**

## See Also

- [`pluck`](./pluck) — return a flat array of values from a single column.
- [`get`](./pluck) — terminal call.
- [`with`](./with) — load relations alongside a thin parent.
- [`groupBy`](./groupBy) / [`join`](./join) — composes naturally with `select`.

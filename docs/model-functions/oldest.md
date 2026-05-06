# `oldest`

Add an ascending `ORDER BY` on a timestamp column. Sugar for `orderBy(column, 'asc')` — the symmetric counterpart of `latest()`.

## Signature

```ts
FedacoBuilder<T>.oldest(column?: string): this
FedacoBuilder<T>.latest(column?: string): this
```

## Parameters

| Name      | Default | Description |
| --------- | ------- | ----------- |
| `column`  | model's `created_at` column (`'created_at'` by default) | Column to order by ASC (`oldest`) or DESC (`latest`). |

## Real-World Use Cases

### 1. First-created first

```ts
await User.createQuery().create({ id: 1, email: 'linbolen@gradii.com' });
await User.createQuery().create({ id: 2, email: 'xsilen@gradii.com' });

const models = await new User().NewQuery().oldest('id').get();
console.log(models[0].email); // 'linbolen@gradii.com'
console.log(models[1].email); // 'xsilen@gradii.com'
```

Equivalent to:

```ts
const models = await User.createQuery().orderBy('id', 'asc').get();
```

### 2. List in registration order

```ts
const users = await User.createQuery().oldest().get();
```

Without an argument, `oldest` orders by the model's `created_at` column.

### 3. Combined with `paginate`

```ts
let page = await User.createQuery().oldest('id').paginate(1, 2);
// page.items[0].email — earliest record on page 1.

page = await User.createQuery().oldest('id').paginate(2, 2);
```

The order is preserved when paginating — without it, paginated results have non-deterministic content.

### 4. Combined with `pluck`

```ts
const keyed = await User.createQuery()
  .oldest('id')
  .pluck('users.email', 'users.id');
// { 1: 'linbolen@gradii.com', 2: 'xsilen@gradii.com' }
```

`pluck`'s second argument is the key column — combined with `oldest('id')`, the resulting object is iterated in insertion order.

### 5. `latest` for descending order

```ts
const newest = await Post.createQuery().latest().first();
// equivalent to .orderBy('created_at', 'desc').first()
```

## When to Skip the Sugar

Use full `orderBy(...)` when:

- The column isn't `created_at`-shaped — `oldest` / `latest` are deliberately about timestamps.
- You want to combine multiple sort columns (`orderBy('priority').orderBy('created_at')`).
- You want descending on a non-timestamp column.

## Common Pitfalls

- **Defaults to `created_at`.** If your model uses a different timestamp (`@CreatedAtColumn` with a custom column name), pass the column explicitly or override `GetCreatedAtColumn()` on the model.
- **`oldest` adds an order; it doesn't replace.** Subsequent `orderBy` clauses keep stacking. Call `reorder()` first if you want to reset.

## See Also

- [`paginate`](./paginate) — naturally pairs with an order.
- [`first`](./first) — "first in chosen order".
- `latest` — descending sibling.
- [`pluck`](./pluck) — keyed plucks rely on order.

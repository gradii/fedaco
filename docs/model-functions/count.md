# `count`

Count rows matching the query. Issues `SELECT COUNT(*)` — no rows are hydrated, so it's cheap.

## Signature

```ts
FedacoBuilder<T>.count(column?: string): Promise<number>
```

## Parameters

| Name      | Default | Description |
| --------- | ------- | ----------- |
| `column`  | `'*'`   | Pass a column name to count non-null values of that column. |

## Real-World Use Cases

### 1. Total rows

```ts
const total = await User.createQuery().count();
```

### 2. Filtered count

```ts
const verified = await User.createQuery()
  .where('email_verified', true)
  .count();
```

### 3. Count non-null values

```ts
// Users with a profile picture set
const withAvatar = await User.createQuery().count('avatar_url');
```

This is `COUNT(avatar_url)`, which counts non-null values — different from `COUNT(*)`.

### 4. Combined with `whereHas`

```ts
const writers = await User.createQuery()
  .whereHas('posts')
  .count();
```

### 5. Distinct counts

```ts
const distinctEmails = await User.createQuery()
  .distinct('email')
  .count('email');
```

### 6. Compare against a threshold

For "are there any?" prefer [`exists`](./has) — it returns a boolean and stops at the first match:

```ts
if (await User.createQuery().where('email', email).exists()) {
  throw new Error('email already taken');
}
```

`exists()` is cheaper than `count() > 0` for "is there at least one" checks.

## Related Aggregates

The same builder exposes a few more aggregates that mirror SQL:

```ts
await Order.createQuery().sum('total');     // SUM
await Order.createQuery().avg('total');     // AVG
await Order.createQuery().min('total');     // MIN
await Order.createQuery().max('total');     // MAX
```

Each compiles to one `SELECT <agg>(col)` query and returns a number.

## Common Pitfalls

- **`count()` ignores `select`, `with`, and `orderBy`.** They're stripped before compiling — only `where` / `groupBy` / `having` survive.
- **`COUNT(column)` vs `COUNT(*)`** — they differ on null. Use `*` for total rows; pass a column for non-null counts.
- **For pagination, use [`getCountForPagination`](./getCountForPagination)** — it preserves the right SQL shape (handles GROUP BY rows correctly).

## See Also

- [`exists`](./has) / `doesntExist` — boolean existence checks.
- [`max`](./max) / [`min`](./min) / [`sum`](./pluck) / [`avg`](./pluck) — other aggregates.
- [`getCountForPagination`](./getCountForPagination) — used by `paginate`.

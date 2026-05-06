# `first`

Run the query and return the first matching row, or `undefined` when nothing matches. Uses the model's order — if you haven't called `orderBy`, "first" is whatever the database returns first.

## Signature

```ts
FedacoBuilder<T>.first(columns?: string[]): Promise<T | undefined>
FedacoBuilder<T>.firstWhere(column, operator?, value?): Promise<T | undefined>
FedacoBuilder<T>.firstOrFail(columns?: string[]): Promise<T>
FedacoBuilder<T>.firstOr(callback): Promise<T>
FedacoBuilder<T>.firstOr(columns: string[], callback): Promise<T>
```

## Returns

- `first` — the model or `undefined`.
- `firstOrFail` — the model, or throws `ModelNotFoundException`.
- `firstOr(cb)` — the model, or whatever `cb()` returns.

## Real-World Use Cases

### 1. Lookup by criteria

```ts
const user = await User.createQuery().where('email', email).first();
if (!user) {
  return null;
}
```

### 2. Shorthand: `firstWhere`

`.where(...).first(...)` collapses into one call:

```ts
const user = await User.createQuery().firstWhere('email', email);
```

Three-arg form for non-`=` operators:

```ts
const draft = await Post.createQuery().firstWhere('status', '=', 'draft');
```

### 3. Throw on missing — `firstOrFail`

```ts
const user = await User.createQuery()
  .where('email', email)
  .firstOrFail();
```

Throws `ModelNotFoundException` if no row matched.

### 4. Default value — `firstOr`

```ts
const post = await Post.createQuery()
  .where('user_id', userId)
  .firstOr(() => ({ user_id: userId, title: 'untitled', body: '' }));
```

The fallback is invoked only when nothing matched. Pair with `firstOrCreate` if you want the fallback persisted.

### 5. Order before "first"

The database doesn't promise an order without `ORDER BY`:

```ts
const newest = await Post.createQuery()
  .orderBy('created_at', 'desc')
  .first();

const oldest = await Post.createQuery()
  .orderBy('id')
  .first();
```

`oldest()` and `latest()` are sugar for `orderBy('created_at', 'asc' | 'desc')`.

### 6. With eager loading

```ts
const post = await Post.createQuery()
  .with('author', 'tags')
  .where('slug', slug)
  .first();
```

Eager loads run after the parent SELECT — they only fetch related rows for the one parent that came back.

### 7. Project specific columns

```ts
const headline = await Post.createQuery().first(['id', 'title']);
```

## Common Pitfalls

- **`undefined`, not `null`.** Test with `if (!post)` rather than `if (post === null)`.
- **No implicit ordering.** Without `orderBy`, "first" is non-deterministic across page caches, indexes, replicas.
- **Inside transactions**, use `createQuery(tx)` so `first` runs on the transaction's connection.

## See Also

- [`firstOrCreate`](./firstOrCreate) — find or insert.
- [`firstOrNew`](./firstOrNew) — find or build (no save).
- [`find`](./find) — primary-key lookup.
- [`get`](./pluck) — return all matching rows instead of one.

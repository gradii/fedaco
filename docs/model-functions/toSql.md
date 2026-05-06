# `toSql`

Compile the query into a SQL string + bindings array — without running it. Indispensable for debugging, profiling, or unit tests that assert SQL shape.

## Signature

```ts
QueryBuilder.toSql(): { result: string; bindings: any[] }
FedacoBuilder<T>.toSql(): { result: string; bindings: any[] }
```

(Both return the same shape.)

## Real-World Use Cases

### 1. Debug a query

```ts
const builder = User.createQuery()
  .where('active', true)
  .with('posts')
  .orderBy('created_at', 'desc');

const { result, bindings } = builder.toSql();
console.log(result);
// 'select * from "users" where "active" = ? order by "created_at" desc'
console.log(bindings);
// [true]
```

### 2. Assert binding count in tests

```ts
const user = await User.createQuery().create({ id: 1, email: 'linbolen@gradii.com' });
await (await user.NewRelation('posts').create({ name: 'Post 2' }))
  .NewRelation('photos')
  .create({ name: 'photo.jpg' });

const query = await User.createQuery().has('postWithPhotos');
const { result: sql, bindings } = query.toSql();

const placeholders = sql.match(/\?/g)?.length ?? 0;
expect(placeholders).toBe(bindings.length);
```

If the binding count mismatches the placeholders, the SQL is malformed — typical sign of a fedaco grammar bug or a relation that didn't apply its constraints. This pattern is useful in driver compatibility tests.

### 3. Inspect generated SQL for an unexpected scope

```ts
const builder = SoftDeletePost.createQuery();
console.log(builder.toSql().result);
// '... where "deleted_at" is null' — confirms the soft-delete scope applied.
```

### 4. Hand off to another tool

```ts
const { result, bindings } = builder.toSql();
const explainOutput = await db().query()
  .selectRaw(`EXPLAIN ${result}`, bindings)
  .get();
```

You can feed the compiled SQL into `EXPLAIN`, query analyzers, or migration tooling.

## Notes

- **`toSql` is sync.** Most builder calls are async, but compilation isn't — it returns immediately.
- **Bindings preserve order.** They line up with the `?` placeholders left-to-right.
- **Doesn't apply global scopes.** Call `applyScopes()` first (or use `toBase()` to materialise a scope-aware base query) when you want the post-scope SQL.

## Common Pitfalls

- **`.get().toSql()` runs the query first.** `toSql` is on the builder, not on the resolved result — call it before any terminal method.
- **Counts use a different shape.** `getCountForPagination` wraps the query when grouping is involved; running `toSql` on it shows the wrapper, not the original.

## See Also

- [`getQuery`](./getQuery) — drop to the underlying QueryBuilder.
- [`select`](./select) / [`where`](./where) — inputs that show up in the compiled SQL.
- [`getCountForPagination`](./getCountForPagination) — special-case count compilation.

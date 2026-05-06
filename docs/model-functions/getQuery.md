# `getQuery`

Return the underlying `QueryBuilder` from a `FedacoBuilder`. Used internally to drop down to the raw query layer — e.g. in custom scopes that need to manipulate clauses directly.

## Signature

```ts
FedacoBuilder<T>.getQuery(): QueryBuilder
FedacoBuilder<T>.toBase(): QueryBuilder
```

`getQuery` returns the builder's internal `_query` field — the raw clause container without the model layer. `toBase` does the same after applying global scopes.

## Real-World Use Cases

### 1. Inspect generated SQL

```ts
const builder = User.createQuery()
  .where('active', true)
  .with('posts');

const { result, bindings } = builder.toSql();
console.log(result);   // 'select * from "users" where "active" = ?'
console.log(bindings); // [true]
```

`toSql` is itself defined on the underlying `QueryBuilder` — see [`toSql`](./toSql).

### 2. Subquery construction

When you need a subquery on the raw query layer (e.g. to feed into `selectSub` / `whereExists`):

```ts
const subQuery = User.createQuery()
  .select({
    0: 'id',
    friends_count: await User.createQuery()
      .whereColumn('friend_id', 'user_id')
      .count(),
  })
  .groupBy('email')
  .getQuery(); // <-- raw QueryBuilder

await User.createQuery().fromSub(subQuery, 'grouped').get();
```

### 3. Inspect clause state in a custom scope

```ts
class TenantScope extends BaseScope {
  apply(builder: FedacoBuilder, model: Model) {
    const query = builder.getQuery();
    if (!query._wheres.some((w) => w.column === 'tenant_id')) {
      builder.where('tenant_id', currentTenantId());
    }
  }
}
```

Reach into `_wheres` / `_groups` / `_orders` to make scope decisions based on what's already on the query.

### 4. Drop the model layer for performance

```ts
const rows = await User.createQuery()
  .where('active', true)
  .toBase()
  .get();
// rows are plain objects — no FedacoBuilder hydration overhead.
```

When you don't need the model API on the result, `toBase().get()` skips hydration.

## `getQuery` vs `toBase`

| Method     | Applies global scopes first? |
| ---------- | ---------------------------- |
| `getQuery` | ✗ — raw underlying builder |
| `toBase`   | ✓ — runs `applyScopes()` first |

Use `getQuery` when reading internal state (in scopes, plugins). Use `toBase` when you want to *execute* a scope-aware raw query.

## Common Pitfalls

- **Mutating the returned `QueryBuilder` mutates the FedacoBuilder.** They share state — there's no defensive copy.
- **Don't await `getQuery()`**: it's synchronous. Calls like `getQuery().get()` execute SQL.

## See Also

- [`toSql`](./toSql) — compile to SQL string + bindings.
- [`select`](./select) / [`where`](./where) — declarative composition.
- [`getCountForPagination`](./getCountForPagination) — uses `getQuery` internally for grouped counts.

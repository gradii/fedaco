# `newQuery`

Build a fresh query rooted at this model's table, with the model's global scopes applied. Lower-level than [`createQuery`](./createQuery) — `createQuery` is just `new this().NewQuery()`.

## Signature

```ts
model.NewQuery<T>(): FedacoBuilder<T>
model.NewModelQuery(): FedacoBuilder<this>
model.NewQueryWithoutScopes(): FedacoBuilder<this>
model.NewQueryWithoutScope(scope: string): FedacoBuilder<this>
model.NewQueryWithoutRelationships(): FedacoBuilder<this>
model.NewQueryForRestoration(ids: any | any[]): FedacoBuilder<this>
```

## Variants

| Method                      | Global scopes | `_with` / `_withCount` |
| --------------------------- | ------------- | ---------------------- |
| `NewQuery`                  | applied       | included |
| `NewModelQuery`             | not applied   | not included — bare |
| `NewQueryWithoutScopes`     | not applied   | included |
| `NewQueryWithoutScope(s)`   | applied except `s` | included |
| `NewQueryWithoutRelationships` | applied    | not included |
| `NewQueryForRestoration(id)` | not applied  | filtered to the given id(s) |

## Real-World Use Cases

### 1. Standard query — same as `createQuery`

```ts
const writers = await new User().NewQuery().where('active', true).get();
// equivalent to:
const writers2 = await User.createQuery().where('active', true).get();
```

`createQuery` exists because the static form reads better. Use `NewQuery` from inside instance methods where you already have a `this`.

### 2. Bypass global scopes

If your model has a soft-delete scope or a tenant scope and you need to look at *everything*:

```ts
const all = await user.NewQueryWithoutScopes().get();
```

Or skip just one named scope:

```ts
const includingTrashed = await user.NewQueryWithoutScope('soft_deleting').get();
```

### 3. Restoration workflow

Used by soft-delete restore — fetches by id, ignoring scopes:

```ts
const trashed = await new Post().NewQueryForRestoration(postId).first();
trashed?.restore();
```

### 4. Bare query (no scopes, no eager loads)

```ts
// Internal — for building scope/relation queries that explicitly compose the SQL.
const bare = user.NewModelQuery();
```

`NewModelQuery` is the building block. Use it when writing custom relation classes or schema-builder helpers; for application code, prefer `NewQuery` / `createQuery`.

## See Also

- [`createQuery`](./createQuery) — the public static form.
- [`with`](./with) — pre-load relations on the new query.

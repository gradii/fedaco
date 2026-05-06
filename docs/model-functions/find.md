# `find`

Fetch a single model (or many) by primary key. Returns `undefined` when no match — use [`findOrFail`](./findOrFail) to throw instead.

## Signature

```ts
FedacoBuilder<T>.find(id: string | number, columns?: string[]): Promise<T | undefined>
FedacoBuilder<T>.find(ids: any[], columns?: string[]): Promise<T[]>
```

## Parameters

| Name      | Required | Description |
| --------- | -------- | ----------- |
| `id`      | ✓        | A primary-key value (scalar) or an array of primary-key values. |
| `columns` | optional | Columns to select. Defaults to `['*']`. Useful for trimming wide tables. |

The behaviour switches based on whether `id` is an array:

- **Scalar** → returns one model or `undefined`.
- **Array**  → returns an array of models (only the ones that matched).

## Real-World Use Cases

### 1. Fetch by id

```ts
const user = await User.createQuery().find(42);

if (!user) {
  throw new NotFoundError('user 42 not found');
}
```

### 2. Project specific columns

When you only need a couple of columns, trim the SELECT:

```ts
const user = await User.createQuery().find(42, ['id', 'email']);
```

The other columns aren't loaded, so `user.name` would be `undefined`. Use this for hot paths where you control the access pattern.

### 3. Bulk fetch by ids

```ts
const userIds = [1, 2, 3, 99];
const users = await User.createQuery().find(userIds);

// Returns existing users only — `99` is skipped if it doesn't exist.
console.log(users.length); // ≤ 4
```

The order is **not guaranteed** to match the input ids. If you need ordering, sort after the fact:

```ts
const byId = new Map(users.map((u) => [u.id, u]));
const ordered = userIds.map((id) => byId.get(id)).filter(Boolean);
```

### 4. Inside a transaction

```ts
await db().transaction(async (tx) => {
  const user = await User.createQuery(tx).find(42);
  if (!user) return;

  user.balance -= 10;
  await user.save();
});
```

### 5. Eager-loaded relations

`find` composes with [`with`](./with):

```ts
const user = await User.createQuery().with('posts', 'profile').find(42);
console.log(user.posts.length);
```

### 6. Across a non-default connection

```ts
const replicaUser = await User.useConnection('replica').find(42);
console.log(replicaUser.getConnectionName()); // 'replica'
```

## See Also

- [`findOrFail`](./findOrFail) — throw `ModelNotFoundException` instead of returning `undefined`.
- [`findOrNew`](./findOrNew) — return a fresh, unsaved instance when no row exists.
- [`first`](./first) — first row matching arbitrary criteria.
- [`where`](./where) — build the criteria for non-key lookups.
- [`createQuery`](./createQuery) — entry point for the builder.
- [`useConnection`](./useConnection) — query against a non-default connection.

# `getConnectionName`

Return the name of the connection this model instance is bound to.

## Signature

```ts
model.GetConnectionName(): string
```

## Returns

A string — either the value set explicitly on the instance (via `SetConnection` / `useConnection` / `@Table({ connection })`) or `'default'` as a fallback.

## Real-World Use Cases

### 1. Inspect the connection

```ts
const user = await User.useConnection('replica').find(42);
console.log(user.GetConnectionName()); // 'replica'
```

### 2. Verify after attach in a transaction

```ts
await db().transaction(async (tx) => {
  const user = await User.createQuery(tx).create({ ... });
  expect(user.GetConnectionName()).toBe(tx.getName());
});
```

### 3. Conditional logic per connection

```ts
function isReadOnly(model: Model) {
  return model.GetConnectionName().endsWith('_replica');
}
```

### 4. Resolution order

`GetConnectionName` walks through possible sources in this order:

1. The instance's own `_connection` field (set by `SetConnection` or `useConnection`).
2. `@Table({ connection })` annotation on the model class.
3. Static `Model.connectionName` (rarely used).
4. Falls back to `'default'`.

It memoises into `_connection` on the first call, so subsequent reads are pure property access.

## See Also

- [`setConnection`](./setConnection) — change the connection on an instance.
- [`useConnection`](./useConnection) — query against a specific named connection.
- [Multiple Connections](../guide/multiple-connections)

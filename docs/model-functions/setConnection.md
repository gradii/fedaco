# `setConnection`

Bind this model instance to a specific named connection. Subsequent `save()` / `delete()` calls on this instance use that connection.

## Signature

```ts
model.SetConnection(name: string | null): this
```

## Parameters

| Name   | Description |
| ------ | ----------- |
| `name` | Connection name. Must match a connection registered with `DatabaseConfig.addConnection`. Pass `null` to reset to the default. |

## Returns

`this` — the same instance, mutated. Chainable.

## Real-World Use Cases

### 1. Insert against a non-default connection

```ts
const user = User.initAttributes({
  email: 'admin@example.com',
});
user.SetConnection('second_connection');
await user.save();

console.log(user.GetConnectionName()); // 'second_connection'
```

### 2. Move an instance to another connection (rare)

After a migration / dual-write window, you may need to retarget an instance:

```ts
const u = await User.createQuery().find(1);
u.SetConnection('new_connection');
await u.save();
```

This re-uses the row's primary key — fedaco issues an UPDATE on `new_connection` (which fails if the row doesn't exist there). For replication, use a proper data pipeline; `SetConnection` is for narrow targeting only.

### 3. Per-instance override inside a controller

```ts
async function adminWrite(req: Request) {
  const user = User.initAttributes(req.body);
  user.SetConnection(req.user.tenantConnection);
  await user.save();
}
```

## When to use what

| Tool              | Granularity      | Persists in instance? |
| ----------------- | ---------------- | --------------------- |
| `Model.useConnection('x')` | per-query | no — fresh builder, fresh result |
| `instance.SetConnection('x')` | per-instance | yes — sticks until reset |
| `@Table({ connection })`     | per-class | yes — applies to every instance |
| `createQuery(tx)` / `withConnection(tx)` | per-query, transaction-aware | yes within scope |

For transactions specifically, prefer `createQuery(tx)` over `SetConnection` — `tx` carries the right pooled connection; `SetConnection` re-resolves by name and would miss the transaction.

## Common Pitfalls

- **Connection must already exist.** `SetConnection('foo')` doesn't create the connection — `addConnection` does. The error surfaces on the next `save()` / `find()` call, not on `SetConnection`.
- **Doesn't move the row.** Calling `save()` on a different connection issues a SQL write against that connection only. The original is untouched.
- **Loaded relations stay on their original connection.** `instance.SetConnection` only affects the parent.

## See Also

- [`useConnection`](./useConnection) — query-builder-level scoping.
- [`getConnectionName`](./getConnectionName) — read the current connection.
- [Multiple Connections](../guide/multiple-connections)

# `useConnection`

Bind a model class to a specific named connection for one query. Returns a fresh `FedacoBuilder` rooted at that connection — without mutating the model class globally.

## Signature

```ts
class Model {
  static useConnection<T>(this: Constructor<T>, connection?: string): FedacoBuilder<T>;
}
```

## Parameters

| Name         | Required | Description |
| ------------ | -------- | ----------- |
| `connection` | optional | Name of a connection registered on `DatabaseConfig`. Pass `undefined` to fall back to the model's default. |

## Returns

A `FedacoBuilder<T>` whose underlying `Connection` is the one named by `connection`. Subsequent calls (`get`, `find`, `create`, …) execute against it.

## Real-World Use Cases

### 1. Read from a replica

```ts
// Heavy read against the replica, write still goes to the primary.
const dashboard = await User.useConnection('replica')
  .where('active', true)
  .with('lastOrder')
  .get();
```

### 2. Write to a different database

```ts
// Audit logs live on a separate logical database.
await AuditLog.useConnection('audit').create({
  actor_id: req.user.id,
  action: 'login',
});
```

### 3. Tenant-aware lookups

```ts
function tenantConnection(tenantId: string): string {
  return `tenant_${tenantId}`;
}

const user = await User.useConnection(tenantConnection(tenantId)).find(userId);
```

The instance keeps the connection name on `_connection`, so subsequent `save()` / `delete()` calls stay on that connection without re-specifying:

```ts
user.email = 'new@example.com';
await user.save(); // still 'tenant_42'
```

### 4. Fallback to default

Passing `undefined` uses the model's normal connection — useful when a function's `connection` argument is optional:

```ts
async function fetchUser(id: number, connection?: string) {
  return User.useConnection(connection).find(id);
}
```

### 5. Combine with `firstOrCreate` / `findOrNew` on a different connection

```ts
const user = await User.useConnection('second')
  .firstOrCreate({ email: 'tony.stark@example.com' });

console.log(user.getConnectionName()); // 'second'
```

## How It Differs From Alternatives

| Tool | Scope |
| ---- | ----- |
| `useConnection('replica')`        | One query — fresh builder on the named connection. |
| `Model.SetConnection('replica')`  | Mutates one instance — affects future `save` / `delete` on that instance. |
| `@Table({ connection: 'replica' })` | Class-wide default — every model instance starts on this connection. |
| `createQuery(tx)` / `withConnection(tx)` | Bind a query to a `Connection` *instance* (typically a transaction tx). |

## Common Pitfalls

- **Connection must exist.** `useConnection('foo')` throws when `foo` isn't registered on the global `DatabaseConfig`.
- **Doesn't switch the underlying `Model.resolver`.** Loaded models still report whichever connection they were loaded on — `useConnection` is a per-builder scoping mechanism, not a global swap.
- **For transactions, prefer `createQuery(tx)`** over `useConnection`. `tx` already carries the right pooled connection; `useConnection` re-resolves by name and would miss the transaction.

## See Also

- [`createQuery`](./createQuery) — accepts a `Connection` argument for transaction binding.
- [`setConnection`](./setConnection) — mutates the connection on an instance.
- [`getConnectionName`](./getConnectionName) — read the current connection.
- [Multiple Connections](../guide/multiple-connections)

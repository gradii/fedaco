# `createQuery`

Static factory for building a fresh query against the model's table. This is the entry point you'll use most often when retrieving, filtering, or inserting model rows.

## Signature

```ts
class Model {
  static createQuery<T>(this: Constructor<T>): FedacoBuilder<T>;
  static createQuery<T>(this: Constructor<T>, connection: Connection): FedacoBuilder<T>;
}
```

## Parameters

| Name         | Required | Description |
| ------------ | -------- | ----------- |
| `connection` | optional | A `Connection` to bind the query to — typically the `tx` argument inside a transaction callback. When omitted, the query uses the model's default connection. |

## Returns

A `FedacoBuilder<T>` — chainable, lazily executed. Nothing hits the database until you `await` a terminal method (`get`, `first`, `count`, `create`, …).

## Real-World Use Cases

### 1. Read a row

```ts
import { User } from './models/user';

const ada = await User.createQuery().where('email', 'ada@example.com').first();
```

### 2. Insert + return the model

```ts
const user = await User.createQuery().create({
  name: 'Ada Lovelace',
  email: 'ada@example.com',
});
// user.id is set, user._wasRecentlyCreated === true
```

### 3. Bind the query to a transaction

When you're inside `db().transaction(async (tx) => {...})`, every model query needs to run on `tx` — otherwise it bypasses the transaction. `createQuery(tx)` is the shortest way:

```ts
await db().transaction(async (tx) => {
  const user = await User.createQuery(tx).create({
    name: 'Bob',
    email: 'bob@example.com',
  });

  await Post.createQuery(tx).create({
    user_id: user.id,
    title: 'Hello',
  });
});
```

The same effect with `withConnection`:

```ts
await User.createQuery().withConnection(tx).create({...});
```

Pick whichever reads better in your codebase — they compile to the same SQL.

### 4. Compose with scopes and eager loads

```ts
const activeUsersWithPosts = await User.createQuery()
  .where('active', true)
  .with('posts')
  .orderBy('created_at', 'desc')
  .limit(20)
  .get();
```

## Notes

- `createQuery` is a static method — call it on the class, not an instance.
- For one-off connection overrides per model class, see [`useConnection`](./useConnection).
- The plain instance equivalent is `model.NewQuery()` — `createQuery` is the public, ergonomic surface.

## See Also

- [`useConnection`](./useConnection) — bind a model class to a different connection per call.
- [`create`](./create) — insert and return a model.
- [`find`](./find), [`findOrFail`](./findOrFail) — fetch by primary key.
- [`first`](./first), [`firstOrCreate`](./firstOrCreate) — fetch the first matching row.
- [Transactions Guide](../database/transactions)

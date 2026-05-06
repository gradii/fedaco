# `fromQuery`

Run a raw SQL `SELECT` and hydrate the result rows into model instances. Use it as an escape hatch for queries that the builder can't express, while still getting back rich models instead of raw rows.

## Signature

```ts
FedacoBuilder<T>.fromQuery(query: string, bindings?: any[]): Promise<T[]>
```

## Parameters

| Name        | Required | Description |
| ----------- | -------- | ----------- |
| `query`     | ✓        | The raw SQL string. Use `?` placeholders for bindings; never concatenate user input into the SQL. |
| `bindings`  | optional | Values for the `?` placeholders, in order. |

Returns an array of hydrated `T[]` — every row goes through the model's `NewFromBuilder` path, so casts and accessors apply normally.

## Real-World Use Cases

### 1. Raw SQL on a non-default connection

```ts
let user = User.initAttributes({ email: 'linbolen@gradii.com' });
user.SetConnection('second_connection');
await user.save();

user = User.initAttributes({ email: 'xsilen@gradii.com' });
user.SetConnection('second_connection');
await user.save();

const models = await User.useConnection('second_connection').fromQuery(
  'SELECT * FROM users WHERE email = ?',
  ['xsilen@gradii.com'],
);

console.log(models[0]);                       // FedacoTestUser
console.log(models[0].email);                 // 'xsilen@gradii.com'
console.log(models[0].GetConnectionName());   // 'second_connection'
console.log(models.length);                   // 1
```

Hydrated models retain the named connection — subsequent `save()` writes back to it.

### 2. Driver-specific functions

```ts
const users = await User.createQuery().fromQuery(
  'SELECT * FROM users WHERE LOWER(email) = ?',
  ['ada@example.com'],
);
```

When the builder doesn't expose the function you need (window functions, recursive CTEs, vendor-specific date parts), drop into raw SQL.

### 3. Complex JOINs / CTEs

```ts
const sql = `
  WITH ranked AS (
    SELECT id, email,
           ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY score DESC) AS rk
    FROM users
  )
  SELECT * FROM ranked WHERE rk = 1
`;

const topPerTeam = await User.createQuery().fromQuery(sql);
```

Each row is hydrated into a `User` — but only the columns from the SELECT populate model fields.

### 4. Test setup helper

```ts
async function fetchUserBy(email: string) {
  return User.createQuery().fromQuery(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email],
  );
}
```

## Common Pitfalls

- **`?` placeholders only.** Don't string-concat user input — always use bindings.
- **Result columns must match the model's expected attributes** for the rest of the model API to work. Missing columns become `undefined`; extra ones are ignored.
- **No automatic `WHERE deleted_at IS NULL`** for soft-delete models — your raw SQL is responsible for trash handling.

## See Also

- [`createQuery`](./createQuery) — the standard builder entry point.
- [`useConnection`](./useConnection) — choose which connection runs the raw SQL.
- [`select`](./select) / [`selectRaw`](./select) — composable raw expressions inside builder queries.

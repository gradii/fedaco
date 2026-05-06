# `pluck`

Fetch the values of a single column from the result set. Hydrate-free — returns plain JS values, not models.

## Signature

```ts
// Plain array of values
FedacoBuilder<T>.pluck(column: string): Promise<any[]>

// Object/map keyed by another column
FedacoBuilder<T>.pluck(column: string, key: string): Promise<Record<string, any>>
```

## Parameters

| Name     | Description |
| -------- | ----------- |
| `column` | The column whose values you want. |
| `key`    | When given, the result becomes an object whose keys come from this column. |

The model's accessors and casts on `column` are still applied (so a `@JsonColumn` returns parsed objects, a date column returns `Date` instances, etc).

## Real-World Use Cases

### 1. Just the values

```ts
const emails = await User.createQuery().where('active', true).pluck('email');
// ['ada@example.com', 'bob@example.com', ...]
```

### 2. Map by id

```ts
const namesById = await User.createQuery().pluck('name', 'id');
// { '1': 'Ada', '2': 'Bob', ... }

console.log(namesById['1']); // 'Ada'
```

Useful when you need a lookup table for a small set of records.

### 3. Filtered + ordered

```ts
const adminEmails = await User.createQuery()
  .where('role', 'admin')
  .orderBy('email')
  .pluck('email');
```

### 4. Casted columns

```ts
@Table({ tableName: 'users' })
class User extends Model {
  @JsonColumn() declare preferences: { theme: string; locale: string };
}

const allPrefs = await User.createQuery().pluck('preferences');
// preferences[0].theme, etc — already parsed
```

### 5. Date columns

```ts
const lastLogins = await User.createQuery()
  .where('active', true)
  .pluck('last_login_at');
// Date instances, not raw strings
```

### 6. Transform after plucking

```ts
const userIds = (await User.createQuery().pluck('id')) as number[];
const placeholders = userIds.map(() => '?').join(', ');
```

## `pluck` vs `select` + `get`

| Tool          | Returns                                | When |
| ------------- | -------------------------------------- | ---- |
| `pluck('col')` | flat array (or object) of column values | you want one column out |
| `pluck('col', 'key')` | keyed object             | you want a quick lookup |
| `.select('col').get()` | array of partial models  | you need the model API on the result |

Pluck is faster when you don't need model methods.

## Common Pitfalls

- **Duplicate keys**: when you pass a `key` and that column has duplicates, later rows overwrite earlier ones. Use [`get`](./pluck) and group manually if duplicates matter.
- **`pluck` on a JSON path** isn't supported — pluck the whole JSON column and dig in JS.
- **For `count` / `sum` / `avg`** of plucked values, prefer the dedicated aggregate methods. They run in the database.

## See Also

- [`get`](./pluck) (terminal `get`) — full models or model-shaped objects.
- [`select`](./select) — choose columns at the SQL level.
- [`count`](./count) / [`max`](./max) / [`min`](./min) — aggregates.
- [`first`](./first) — one row instead of many.

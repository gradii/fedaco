# `toArray`

Convert a model instance into a plain JS object — combining its **attributes** with its **loaded relations**. The recursive opposite of `Fill` / `SetRawAttributes`. Used by `toJSON()` and JSON-serialised whenever a model is passed through `JSON.stringify`.

## Signature

```ts
model.ToArray(): Record<string, any>
```

## Returns

A plain object containing:

- All attributes from `attributesToArray()` — applies casts, accessors, and date formatting.
- All loaded relations from `relationsToArray()` — recursively `toArray()`d.

Hidden attributes (declared in `_hidden`) are omitted. Visible attributes (`_visible`) take precedence when set.

## Real-World Use Cases

### 1. Serialise for an HTTP response

```ts
app.get('/users/:id', async (req, res) => {
  const user = await User.createQuery().find(req.params.id);
  if (!user) return res.status(404).end();
  res.json(user.ToArray()); // — or just `res.json(user)`, JSON.stringify uses toJSON()
});
```

### 2. With eager-loaded relations

```ts
const user = await User.createQuery().with('posts').find(1);
const json = user.ToArray();
// {
//   id: 1,
//   name: 'Ada',
//   posts: [
//     { id: 10, title: '...', body: '...' },
//     ...
//   ]
// }
```

The `posts` array is itself an array of `ToArray()` outputs.

### 3. Hide sensitive fields

```ts
@Table({ tableName: 'users' })
class User extends Model {
  _hidden = ['password_hash', 'remember_token'];

  @Column() declare password_hash: string;
}

const user = await User.createQuery().find(1);
user.ToArray(); // password_hash and remember_token are gone
```

### 4. Whitelist specific fields

```ts
@Table({ tableName: 'users' })
class User extends Model {
  _visible = ['id', 'email'];
}
```

`_visible` is the inverse of `_hidden` — only listed columns appear.

### 5. Override per-call with `MakeVisible` / `MakeHidden`

```ts
const user = await User.createQuery().find(1);
const debug = user.MakeVisible(['password_hash']).ToArray();
// `password_hash` included on this view only
```

### 6. Casts and accessors

```ts
@Table({ tableName: 'users' })
class User extends Model {
  @JsonColumn() declare preferences: any;
  @CreatedAtColumn() declare created_at: Date;
}

const u = await User.createQuery().find(1);
u.ToArray();
// {
//   id: 1,
//   preferences: { theme: 'dark' }, // parsed JSON
//   created_at: '2026-05-07T...',   // ISO string from the date cast
// }
```

### 7. Implicit via `JSON.stringify`

`JSON.stringify(model)` calls `toJSON()`, which calls `ToArray()`:

```ts
const body = JSON.stringify(user);
```

`Express` / `Nest` controllers that return a model trigger this automatically when they call `res.json(...)` / `JSON.stringify(...)`.

## `ToArray` vs `getAttributes` vs `_attributes`

| Tool                | Includes relations | Applies casts/accessors | Respects `_hidden`/`_visible` |
| ------------------- | ------------------ | ----------------------- | ----------------------------- |
| `model.ToArray()`        | ✓ | ✓ | ✓ |
| `model.AttributesToArray()` | ✗ | ✓ | ✓ |
| `model.GetAttributes()`     | ✗ | ✗ | ✗ — raw stored values |

For internal serialization (logging full state), use `getAttributes`. For API responses, use `ToArray`.

## Common Pitfalls

- **Loaded relations are recursive.** A circular relation graph will recurse forever — fedaco doesn't detect cycles. Avoid loading both sides of a self-referential pivot.
- **Hidden vs visible**: when both are set, `_visible` wins.
- **Date format** depends on the connection's grammar — usually ISO. Override `serializeDate` on the model if you need custom output.

## See Also

- [`toJSON`](./toJSON) — alias for `JSON.stringify(toArray())`.
- [`makeHidden` / `makeVisible`](./toArray) — per-instance overrides.
- [`getAttribute`](./getAttribute) — read one attribute (with casts/accessors).
- [`fresh`](./fresh) — reload a fresh model from the database.

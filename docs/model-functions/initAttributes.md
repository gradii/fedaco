# `initAttributes`

Static factory: build a model instance pre-filled with attributes, **without** persisting it to the database. Useful when you want to construct a model in memory, mutate it, then call `save()` yourself.

## Signature

```ts
class Model {
  static initAttributes<T>(this: Constructor<T>, attributes?: Record<string, any>): T;
}
```

## Parameters

| Name         | Required | Description |
| ------------ | -------- | ----------- |
| `attributes` | optional | Object of column → value. Subject to `_fillable` whitelist. |

## Returns

A new model instance with `_exists = false` and the given attributes populated. `_original` is synced so the dirty-attribute tracking starts clean.

## Real-World Use Cases

### 1. Build-then-save with a non-default connection

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
console.log(models[0].GetConnectionName()); // 'second_connection'
```

This is the long form of `User.createQuery().create({...})` when you need to do extra work between construction and save (set the connection, attach event handlers, mutate attributes).

### 2. Pre-fill a form model

```ts
const draft = User.initAttributes({
  email: req.query.email,
  plan: 'free',
});
return render('signup', { draft });
```

The instance carries default values and a `_exists === false` flag — useful for "is this a new record?" branching in templates.

### 3. Pre-construct then `saveOrFail` — duplicate-entry assertion

```ts
const date = '1970-01-01';
await Post.createQuery().create({
  id: 1,
  user_id: 1,
  name: 'Post',
  created_at: date,
  updated_at: date,
});

const dup = Post.initAttributes({
  id: 1,
  user_id: 1,
  name: 'Post',
  created_at: date,
  updated_at: date,
});

await expect(dup.saveOrFail()).rejects.toThrowError('SQLSTATE[23000]:');
```

`initAttributes` doesn't persist — the second `Post` only hits the database when you save it.

### 4. Compose with `setRawAttributes`

`initAttributes` runs through `Fill` (mass-assignment guards apply). For internal hydration that bypasses guards (e.g. database loaders), use `setRawAttributes` directly:

```ts
const u = new User();
u.setRawAttributes({ id: 42, email: 'ada@example.com' }, /* sync */ true);
u._exists = true; // mark as loaded
```

## `initAttributes` vs `new Model()` vs `create`

| Tool                              | Persists? | Mass-assigns | When |
| --------------------------------- | --------- | ------------ | ---- |
| `Class.initAttributes({...})`     | ✗         | ✓ (uses `Fill`) | Construct + later save. |
| `new Class().Fill({...})`         | ✗         | ✓ | Same — older API style. |
| `Class.createQuery().create({...})` | ✓       | ✓ | One-shot insert + return. |
| `Class.initAttributes(...).SetRawAttributes(...)` | ✗ | ✗ | Hydration from a DB row. |

## Common Pitfalls

- **`MassAssignmentException`**: keys not in `_fillable` throw. Use `forceFill` if you really need to bypass.
- **`_exists` is `false` until you `save()`.** Calling `Update`/`Delete` immediately after `initAttributes` won't write anything (those methods early-return when `_exists` is false).
- **Static method, not constructor.** `initAttributes` is a class-level factory — call `User.initAttributes(...)`, not `new User().initAttributes(...)`.

## See Also

- [`fillable`](./fillable) — the mass-assignment whitelist.
- [`save`](./save) / [`saveOrFail`](./saveOrFail) — persist after construction.
- [`create`](./create) — combined construct + save.
- [`setRawAttributes`](./setRawAttributes) — bypass mass-assignment for internal hydration.

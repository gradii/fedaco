# `findOrNew`

Find a row by primary key. If no row matches, return a **new, unsaved** instance.

## Signature

```ts
FedacoBuilder<T>.findOrNew(id: any, columns?: string[]): Promise<T>
```

## Parameters

| Name      | Required | Description |
| --------- | -------- | ----------- |
| `id`      | ✓        | Primary-key value. |
| `columns` | optional | Columns to select. Defaults to `['*']`. |

## Returns

- An existing model — `_exists === true`.
- A new instance — `_exists === false`. **Not persisted.**

## Real-World Use Cases

### 1. Lookup-or-build

```ts
const user = await User.createQuery().findOrNew(req.params.id);
if (!user._exists) {
  user.id = req.params.id;
  user.email = derivedEmail;
  await user.save();
}
```

### 2. Build form data without inserting

```ts
const user = await User.createQuery().findOrNew(req.params.id);
return render('user-form', { user });
// `user` carries DB values when the row exists, or empty fields otherwise.
```

### 3. Combined with `useConnection`

```ts
const user = await User.useConnection('second_connection').findOrNew(1);
console.log(user._exists, user.GetConnectionName());
```

The new instance retains the named connection — calling `save()` later persists to that connection.

## `findOrNew` vs `findOrFail` vs `firstOrNew`

| Method                       | Lookup         | Lookup miss → | Persists on miss? |
| ---------------------------- | -------------- | ------------- | ----------------- |
| [`findOrNew`](./findOrNew)   | primary key    | new instance  | ✗ |
| [`findOrFail`](./findOrFail) | primary key    | throws        | n/a |
| [`firstOrNew`](./firstOrNew) | attribute set  | new instance  | ✗ |
| [`firstOrCreate`](./firstOrCreate) | attribute set | INSERT     | ✓ |

## Common Pitfalls

- **`_exists`, not `null`.** The result is always a model instance — branch on `_exists`, not `if (!user)`.
- **Doesn't auto-fill the primary key.** When `_exists === false`, the instance has *no attributes*. Set them yourself before saving.

## See Also

- [`find`](./find) — returns `undefined` instead.
- [`findOrFail`](./findOrFail) — throws on miss.
- [`firstOrNew`](./firstOrNew) — same idea, attribute-based lookup.

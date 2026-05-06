# `toJSON`

Return the same object as [`toArray`](./toArray). Implemented so that `JSON.stringify(model)` produces the right output without any extra wrapping.

## Signature

```ts
model.toJSON(): Record<string, any>
```

## Returns

The model converted to a plain JS object — attributes (with casts/accessors applied) plus loaded relations. Hidden fields (`_hidden`) are stripped.

## Real-World Use Cases

### 1. `JSON.stringify` works directly

```ts
const user = await User.createQuery().with('posts').find(1);
const json = JSON.stringify(user);
```

`JSON.stringify` calls `toJSON()` automatically, which calls `ToArray()` internally.

### 2. Express / Nest / Fastify response

```ts
app.get('/users/:id', async (req, res) => {
  const user = await User.createQuery().find(req.params.id);
  res.json(user); // res.json calls JSON.stringify, which calls toJSON
});
```

You don't need to do anything special — the framework's JSON serialiser picks up `toJSON()`.

### 3. Custom date serialisation

```ts
@Table({ tableName: 'posts' })
class Post extends Model {
  @CreatedAtColumn() declare created_at: Date;

  // Override per-model serialisation if you want non-ISO dates
  serializeDate(date: Date): string {
    return date.toISOString();
  }
}
```

`toJSON` runs casts and accessors, so a `Date` column is rendered through `serializeDate`.

## `toJSON` vs `toArray`

These are aliases in fedaco — `toJSON` calls `ToArray`. Use `toJSON` when integrating with `JSON.stringify`, use `ToArray` when you want the dictionary directly.

## See Also

- [`toArray`](./toArray) — same output, called more explicitly.
- `_hidden` / `_visible` — control which fields are exposed.
- `MakeHidden` / `MakeVisible` — per-instance overrides.

# `getAttribute`

Read a single attribute on the model — applies casts, accessors, and date conversion. The right way to read fields when you might have casts in play.

## Signature

```ts
model.GetAttribute(key: string): any
```

## Parameters

| Name  | Description |
| ----- | ----------- |
| `key` | Column name, accessor name (camelCase getter), or relation name. |

## Returns

The cast/accessor-processed value, or `undefined` for unknown keys. For relation names, returns the loaded relation collection (eager-loaded only — does not lazy-load).

## Real-World Use Cases

### 1. Read a column

```ts
const user = await User.createQuery().find(1);
const email = user.GetAttribute('email');

// Equivalent — direct property access goes through the same accessor pipeline
const sameEmail = user.email;
```

In most code you'll use property access. Use `GetAttribute` when the key is dynamic.

### 2. Casted fields

```ts
@Table({ tableName: 'configs' })
class Config extends Model {
  @JsonColumn() declare settings: any;
  @CreatedAtColumn() declare created_at: Date;
}

const cfg = await Config.createQuery().find(1);

cfg.GetAttribute('settings');    // parsed JS object
cfg.GetAttribute('created_at');  // Date instance
cfg.GetRawOriginal('settings');  // original JSON string from the DB
```

### 3. Accessor methods

If the model defines a `getFullNameAttribute()` method, the camelCase form is reachable through `getAttribute`:

```ts
class User extends Model {
  getFullNameAttribute() {
    return `${this.first_name} ${this.last_name}`;
  }
}

const u = await User.createQuery().find(1);
u.GetAttribute('full_name'); // -> 'Ada Lovelace'
u.full_name;                 // same — accessor is called via the proxy
```

### 4. Reading a loaded relation

If you've eager-loaded a relation, `GetAttribute` returns the loaded data:

```ts
const user = await User.createQuery().with('posts').find(1);
user.GetAttribute('posts'); // Post[]
user.posts;                 // same
```

For unloaded relations, `GetAttribute` returns `undefined` — it does **not** trigger a lazy load.

### 5. Dynamic field access

```ts
function audit(model: Model, fields: string[]) {
  return fields.map((f) => ({ field: f, value: model.GetAttribute(f) }));
}
```

## `GetAttribute` vs raw property access

| Tool                       | Casts/accessors | Date parsing | Relations |
| -------------------------- | --------------- | ------------ | --------- |
| `model.GetAttribute(key)`  | ✓               | ✓            | loaded only |
| `model.column`             | ✓ (via Proxy)   | ✓            | loaded only |
| `model.GetAttributes()`    | ✗ — raw stored values | ✗     | ✗ |
| `model.GetRawOriginal(key)` | ✗ — original from `_original` | ✗ | ✗ |

For internal operations (writing to the DB, computing diffs) prefer `GetAttributes` / `GetRawOriginal`. For application logic, prefer property access or `GetAttribute`.

## See Also

- [`setRawAttributes`](./setRawAttributes) — bulk write underlying storage.
- [`fillable`](./fillable) — control which keys are mass-assignable.
- [`fresh`](./fresh) / `Refresh` — reload from the DB.
- [`toArray`](./toArray) — full snapshot through casts/accessors.

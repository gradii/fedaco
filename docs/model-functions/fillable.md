# `fillable` / `_fillable`

The mass-assignment whitelist. Only attributes whose names appear in `_fillable` may be written via `Fill` / `create` / `update` (the bulk forms). Other keys throw `MassAssignmentException` when the model is `TotallyGuarded()`.

## Signature

```ts
class Model {
  _fillable: string[]; // declared on the model class
}

model.Fillable(fields: string[]): this;        // per-instance override
model.MergeFillable(fields: string[]): this;   // additive override
```

## Real-World Use Cases

### 1. Declare on the class

```ts
@Table({ tableName: 'users' })
class User extends Model {
  _fillable = ['name', 'email', 'plan'];

  @PrimaryGeneratedColumn() declare id: number;
  @Column() declare name: string;
  @Column() declare email: string;
  @Column() declare plan: string;
  @Column() declare role: string; // not fillable — guarded
}

await User.createQuery().create({
  name: 'Ada',
  email: 'ada@example.com',
  plan: 'pro',
});

// MassAssignmentException — `role` is not in _fillable
await User.createQuery().create({
  name: 'Ada',
  role: 'admin',
});
```

### 2. Bypass for specific call — `forceCreate` / `forceFill`

```ts
const user = await User.createQuery().forceCreate({
  name: 'Ada',
  role: 'admin', // allowed via forceCreate
});
```

`forceCreate` and `model.ForceFill(...)` ignore `_fillable` — use sparingly and only on trusted input (admin tooling, migrations).

### 3. JSON-path fillable entries

```ts
@Table({ tableName: 'configs' })
class Config extends Model {
  _fillable = ['settings', 'settings->theme', 'settings->locale'];

  @JsonColumn() declare settings: any;
}

const cfg = await Config.createQuery().create({ settings: { theme: 'dark' } });

await cfg.Update({ 'settings->theme': 'light' });  // ✓ fillable JSON path
await cfg.Update({ 'settings->theme': 'light', 'settings->color': 'blue' });
//                                            ↑ throws — 'settings->color' not fillable
```

This makes JSON columns safe to mass-assign at specific paths only.

### 4. Per-instance overrides

```ts
const cfg = await Config.createQuery().create({ settings: {} });
cfg.fillable(['settings->y', 'settings->a->b']);
await cfg.update({ 'settings->y': '1' });
```

`Fillable` replaces the whitelist on this instance only.

### 5. Add to the whitelist temporarily

```ts
cfg.MergeFillable(['settings->locked']);
await cfg.update({ 'settings->locked': true });
```

## `_fillable` vs `_guarded`

Two strategies that produce the same outcome:

```ts
_fillable = ['name', 'email'];   // allow only these (whitelist)
_guarded  = ['id', 'role'];      // forbid these (blacklist)
```

You use one or the other, not both. The whitelist is safer — adding a new column doesn't accidentally make it mass-assignable.

`_guarded = ['*']` rejects all mass assignment (`TotallyGuarded() === true`). `_guarded = []` allows everything.

## Common Pitfalls

- **`MassAssignmentException`** is thrown only when `TotallyGuarded()` is `true` — i.e. `_fillable` is empty AND `_guarded === ['*']`. With either set, unrecognised keys are silently ignored.
- **JSON paths require explicit listing.** A bare `'settings'` in `_fillable` doesn't allow `'settings->key'`.
- **Decorators don't auto-populate `_fillable`.** `@Column()` makes a column part of the model's serialisation, but you still need to declare it in `_fillable` to mass-assign.

## See Also

- [`create`](./create) — the most common mass-assignment entry point.
- [`forceCreate`](./create) — bypass `_fillable`.
- [`update`](./update) — mass-assign on an existing row.

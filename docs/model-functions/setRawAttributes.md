# `setRawAttributes`

Bulk-load attributes onto a model **without** going through the cast/accessor pipeline or mass-assignment guards. Used internally by hydration (`NewFromBuilder`) and date-handling tests.

## Signature

```ts
model.setRawAttributes(attributes: Record<string, any>, sync?: boolean): this
```

## Parameters

| Name         | Default | Description |
| ------------ | ------- | ----------- |
| `attributes` | —       | Object of column → raw value. Stored verbatim in `_attributes`. |
| `sync`       | `false` | When `true`, also copies the new attributes into `_original` so dirty tracking starts clean (the model is treated as freshly loaded). |

## Real-World Use Cases

### 1. Hydration from a raw row

When you fetch a row by hand (raw SQL, an external cache), you can build a model from it:

```ts
const row = { id: 1, email: 'ada@example.com', created_at: '2026-05-07 10:00:00' };
const user = new User();
user.setRawAttributes(row, /* sync */ true);
user._exists = true;
```

`setRawAttributes(row, true)` means "this is the canonical state from the database — don't treat any of it as dirty."

### 2. Test setup for date formats

```ts
const model = new User();
model.setDateFormat('yyyy-MM-dd HH:mm:ss.SSSS');
model.setRawAttributes({
  created_at: '2026-05-07 10:23:19.0000',
  updated_at: '2026-05-07 10:23:19.7348',
});

model.fromDateTime(model.GetAttribute('updated_at'));
// '2026-05-07 10:23:19.734800'
```

This is the canonical pattern in fedaco's test suite — load attributes raw, then assert what `fromDateTime` produces with a custom format.

### 3. Custom date-serialised model

```ts
const model = new UserWithCustomDateSerialization();
model.setRawAttributes({
  created_at: '2012-12-04',
  updated_at: '2012-12-05',
});

const arr = model.toArray();
console.log(arr['updated_at']); // '05-12-12' — driven by serializeDate() override
```

`setRawAttributes` doesn't run `serializeDate` — that runs when `toArray` reads back through accessors.

### 4. Restore from a snapshot

```ts
const snapshot = JSON.parse(redis.get(`user:${id}`)!);
const user = new User();
user.setRawAttributes(snapshot, true);
```

Faster than hitting the database when you have a known-good cached row.

## `setRawAttributes` vs `Fill` vs `forceFill`

| Method               | Mass-assignment guard | Casts/accessors | Marks attributes dirty |
| -------------------- | --------------------- | --------------- | ---------------------- |
| `Fill(...)`          | ✓ (uses `_fillable`)  | ✓               | ✓ |
| `ForceFill(...)`     | ✗                     | ✓               | ✓ |
| `setRawAttributes`   | ✗                     | ✗               | depends on `sync` arg |

Use `setRawAttributes` only when you control the input — never on user-supplied data.

## Common Pitfalls

- **Doesn't run `_fillable` checks.** Untrusted input here can write to any column. Mass-assignment guards exist for a reason — bypass them deliberately.
- **No casts**: a `JsonColumn` written via `setRawAttributes` keeps the raw string; `getAttribute` will still try to parse it on read, but `getRawOriginal` returns the verbatim value.
- **Forgetting `sync = true`** when restoring loaded state means every attribute is considered dirty — the next `save()` will UPDATE every column.

## See Also

- [`getAttribute`](./getAttribute) — read with casts/accessors.
- [`fillable`](./fillable) / `forceFill` — guarded mass-assignment.
- [`save`](./save) — what the dirty-tracking interacts with.
- [`fresh`](./fresh) — reload from the database instead.

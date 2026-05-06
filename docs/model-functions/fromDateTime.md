# `fromDateTime`

Convert a `Date` (or date-like input) into the model's storage format. Pair with [`setDateFormat`](./setDateFormat) to override how dates are persisted.

## Signature

```ts
model.fromDateTime(value: any): string
```

## Parameters

| Name    | Description |
| ------- | ----------- |
| `value` | A `Date`, an ISO string, a numeric epoch, or anything `fromDateTime` can coerce via the model's date format. |

Returns the formatted string that fedaco would write to the database for this column.

## Real-World Use Cases

### 1. Custom date format with sub-second precision

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

This is mostly used internally — fedaco calls `fromDateTime` whenever it needs to pre-format a date for an INSERT or UPDATE.

### 2. SQL Server's default datetime format

```ts
const model = new User();
model.setDateFormat('yyyy-MM-dd HH:mm:ss.SSS');
model.setRawAttributes({
  created_at: '2026-05-07 10:23:19.000',
  updated_at: '2026-05-07 10:23:19.734',
});

model.fromDateTime(model.GetAttribute('updated_at'));
// '2026-05-07 10:23:19.734'
```

SQL Server's `DATETIME` is millisecond precision — match the format string accordingly.

### 3. Old SQL Server format (no fractions)

```ts
const model = new User();
model.setDateFormat('yyyy-MM-dd HH:mm:ss.000');
model.setRawAttributes({ created_at: '2026-05-07 10:23:19.000' });
```

Some legacy schemas store always-zero fractional seconds — the format makes the round-trip lossless.

### 4. Inspect what fedaco will write

```ts
const post = new Post();
post.published_at = new Date('2026-05-07T10:00:00Z');
console.log(post.fromDateTime(post.published_at));
// e.g. '2026-05-07 10:00:00' (default MySQL/Postgres format)
```

Useful when debugging timezone or precision issues — you can see exactly what string would be sent.

## `fromDateTime` vs `serializeDate`

| Method               | Used for | Result |
| -------------------- | -------- | ------ |
| `fromDateTime`       | Storage / SQL bindings | string in the DB's expected format |
| `serializeDate`      | JSON serialisation (`toArray`) | string in API output (default ISO) |

`fromDateTime` is the storage-layer equivalent; `serializeDate` is the API layer.

## Common Pitfalls

- **Format string vs JS conventions.** fedaco uses [date-fns](https://date-fns.org/) format tokens — `yyyy` / `MM` / `dd`, not `YYYY` / `MM` / `DD`.
- **Timezones.** `fromDateTime` formats in the system's local timezone unless you've configured a connection-level timezone.

## See Also

- [`setDateFormat`](./setDateFormat) — override the format used by `fromDateTime` and parsing.
- [`getAttribute`](./getAttribute) — read a date attribute (returns `Date`).
- [`toArray`](./toArray) — JSON-side serialisation.

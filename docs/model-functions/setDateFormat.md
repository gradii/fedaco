# `setDateFormat`

Override the format used by the model when serialising and parsing date attributes. Useful for non-default precision (sub-second timestamps), legacy schemas, or driver-specific conventions.

## Signature

```ts
model.setDateFormat(format: string): this
model.getDateFormat(): string
```

## Parameters

| Name     | Description |
| -------- | ----------- |
| `format` | A [date-fns](https://date-fns.org/) format string. Examples: `'yyyy-MM-dd HH:mm:ss'`, `'yyyy-MM-dd HH:mm:ss.SSSS'`. |

Returns `this` — chainable.

## Real-World Use Cases

### 1. Sub-second precision

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

The model parses incoming strings with 4-digit fractional seconds, and `fromDateTime` re-serialises with the same precision.

### 2. SQL Server's default datetime format (millisecond precision)

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

### 3. Legacy SQL Server format (always-zero fractions)

```ts
const model = new User();
model.setDateFormat('yyyy-MM-dd HH:mm:ss.000');
model.setRawAttributes({ created_at: '2026-05-07 10:23:19.000' });
```

Legacy schemas that store always-zero fractional seconds round-trip losslessly with this format.

### 4. ISO-8601 storage (uncommon)

```ts
@Table({ tableName: 'events' })
class Event extends Model {
  Boot() {
    this.setDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX");
  }
}
```

Useful when the column type is `VARCHAR` and you store ISO strings instead of native timestamps.

### 5. Per-instance override

`setDateFormat` mutates the instance only. To change the default for every instance of a model, set it in the model's `Boot` method or override `getDateFormat()`:

```ts
class User extends Model {
  getDateFormat() {
    return 'yyyy-MM-dd HH:mm:ss.SSSS';
  }
}
```

## How Date Handling Works

When fedaco reads or writes a date column it consults the model's date format:

1. **On read**: parses the database string with `parse(value, format, ...)`.
2. **On write**: formats the `Date` with `format(value, format)` before sending.

The connection's grammar may also have a default — see `Connection.getQueryGrammar().getDateFormat()`. The model's setting wins when both are present.

## Common Pitfalls

- **Mismatched format on read vs write** corrupts the column. If you call `setDateFormat` on an instance loaded from the DB, that instance's writes will use the new format — make sure both directions agree.
- **`yyyy` vs `YYYY`** — date-fns uses `yyyy` for "calendar year" (the right one). `YYYY` is "week-numbering year" and gives wrong results in late December.

## See Also

- [`fromDateTime`](./fromDateTime) — uses the configured format for outgoing values.
- [`setRawAttributes`](./setRawAttributes) — bypasses the format on hydration.
- [`getAttribute`](./getAttribute) — applies the format on read.
- [date-fns format tokens](https://date-fns.org/v2.30.0/docs/format).

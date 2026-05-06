# `isNumber`

::: warning
`isNumber` is a [@gradii/nanofn](https://github.com/gradii/nanofn) type predicate, **not** a fedaco method. It appears in test fixtures because the e2e suite uses it for assertions on auto-incrementing primary keys.
:::

## What it does

```ts
import { isNumber } from '@gradii/nanofn';

isNumber(1);     // true
isNumber('1');   // false
isNumber(NaN);   // false (most implementations exclude NaN)
isNumber(null);  // false
```

## Why it shows up in fedaco docs

The test:

```ts
const user = await User.createQuery().create({ email: 'ada@example.com' });
const fetched = await User.createQuery().first();

expect(isNumber(fetched.id)).toBe(true);
```

…asserts that fedaco coerces auto-increment primary keys to numbers (driver-dependent — `mysql2` and `pg` return strings for `BIGINT`/`BIGSERIAL` by default; SQLite returns numbers).

## Why You Probably Don't Need This

For application code, just compare or use the value directly:

```ts
const user = await User.createQuery().find(req.params.id);
const id = user.id;        // auto-cast based on _keyType
```

If you've configured `_keyType = 'string'` (UUIDs, slugs), `id` is a string. Otherwise it's a number.

For numeric assertions in your own tests, use `typeof` or `Number.isFinite`:

```ts
expect(typeof user.id).toBe('number');
expect(Number.isFinite(user.id)).toBe(true);
```

## See Also

- [@gradii/nanofn docs](https://github.com/gradii/nanofn)
- [`getAttribute`](./getAttribute) — the underlying read.
- Model `_keyType` — controls whether the primary key is treated as `'int'` or `'string'`.

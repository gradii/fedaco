# `formatISO`

::: warning
`formatISO` is a [date-fns](https://date-fns.org/v2.30.0/docs/formatISO) helper, **not** a fedaco function. It appears in fedaco test fixtures because the e2e tests pin timestamps via `formatISO(startOfSecond(now))`.
:::

## What it does

Formats a `Date` into an ISO-8601 string. Used in tests to assert that fedaco serialises timestamps consistently.

```ts
import { formatISO, startOfSecond } from 'date-fns';

const now = new Date();
const reference = formatISO(startOfSecond(now)); // 2026-05-07T10:23:42+00:00
```

## Why it shows up in fedaco docs

Several model assertions compare a serialised `Date` against `formatISO(startOfSecond(now))` rather than `now.toISOString()`, because:

1. SQLite truncates fractional seconds depending on the column type.
2. `startOfSecond(now)` discards milliseconds before formatting, so the assertion holds regardless.

## Real-World Use Cases (in your own code)

You typically don't need this — fedaco serialises model dates via the connection grammar's `getDateFormat`. If you're doing manual comparisons in tests:

```ts
import { formatISO, startOfSecond } from 'date-fns';

const post = await Post.createQuery().create({ published_at: now });

expect(post.published_at).toEqual(startOfSecond(now));
// or, comparing serialised forms:
expect(formatISO(post.published_at)).toBe(formatISO(startOfSecond(now)));
```

For producing serialised dates from a fedaco model, see the model's `toArray` output — date columns are formatted via `serializeDate`.

## See Also

- [date-fns `formatISO` docs](https://date-fns.org/v2.30.0/docs/formatISO)
- [`startOfSecond`](./startOfSecond) — also from date-fns; discards fractional seconds.
- [`fromDateTime`](./fromDateTime) / [`setDateFormat`](./setDateFormat) — fedaco's own date handling.
- [`toArray`](./toArray) — how fedaco serialises models for output.

# `match`

Two unrelated APIs share this name — make sure you're reading about the right one:

| Source | Purpose |
| ------ | ------- |
| `Relation.match(...)` (fedaco)             | Internal — eager-load matcher that pairs related rows back to their parents. |
| `String.prototype.match(regex)` (JavaScript) | Built-in — used in fedaco *test fixtures* to assert SQL shapes. |

## On a Relation — Internal Matcher

Every concrete `Relation` subclass (`HasOne`, `HasMany`, `BelongsTo`, `BelongsToMany`, polymorphic, …) implements `match(models, results, relation)`. Fedaco calls it during eager-load to graft the fetched related rows back onto the right parent.

```ts
abstract class Relation {
  abstract match(parents: Model[], results: Model[], relation: string): Model[];
}
```

You don't call this in application code — it's the engine behind [`with`](./with). Read it if you're writing a custom relation type.

### When you'd implement it

```ts
class HasManyByLowerEmail extends HasMany {
  match(parents: Model[], results: Post[], relation: string): User[] {
    const grouped = new Map<string, Post[]>();
    for (const r of results) {
      const key = String(r.GetAttribute('user_email')).toLowerCase();
      const list = grouped.get(key) ?? [];
      list.push(r);
      grouped.set(key, list);
    }
    for (const p of parents) {
      const key = String(p.GetAttribute('email')).toLowerCase();
      p.SetRelation(relation, grouped.get(key) ?? []);
    }
    return parents;
  }
}
```

Most users won't need to do this — the built-in relations cover all the common shapes.

## In Test Fixtures — `String.prototype.match`

The e2e fixtures contain things like:

```ts
const query = await User.createQuery().has('postWithPhotos');
const { result: sql, bindings } = query.toSql();
const bindingsCount = bindings.length;
const questionMarksCount = sql.match(/\?/g)?.length || 0;
```

That `match` is the built-in JavaScript string method, not a fedaco API. The doc fixture extractor pulled this snippet in by accident.

If you need to assert about generated SQL in your own tests, that pattern is fine — count `?` placeholders and compare to bindings to catch binding mismatches early.

## See Also

- [`with`](./with) — the eager-load API that triggers `Relation.match` internally.
- [`newRelation`](./newRelation) — fetch a relation lazily on one instance.
- [Defining Relationships](../relationships/defining-relationships/relation-one-to-one).
- [`toSql`](./toSql) — for inspecting generated SQL.

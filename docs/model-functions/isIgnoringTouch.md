# `isIgnoringTouch`

Check whether a model class has been registered to **skip parent-touch propagation** during the current scope. Used by `withoutTouching` / `withoutTouchingOn` to suppress cascading `updated_at` bumps.

## Signature

```ts
class Model {
  static isIgnoringTouch(clazz?: typeof Model): boolean;
  static withoutTouching(callback: () => Promise<any> | any): Promise<void>;
  static withoutTouchingOn(models: any[], callback: () => Promise<any> | any): Promise<void>;
}
```

## How Touching Works

Many fedaco relationships propagate `updated_at` to the **owning** side of the relation:

- A `Comment` belongs to a `Post`.
- When you save a `Comment`, fedaco bumps the parent `Post.updated_at` (the "touch") so caches and ordering stay correct.

`withoutTouching` / `withoutTouchingOn` is the escape hatch when you want to suppress those cascading touches — e.g. during bulk migrations.

## Real-World Use Cases

### 1. Read the flag

By default, no class is in the no-touch list:

```ts
Model.isIgnoringTouch();      // false
User.isIgnoringTouch();       // false
Post.isIgnoringTouch();       // false
```

### 2. Suppress touches for a specific operation

```ts
await User.withoutTouching(async () => {
  for (const u of users) {
    await u.NewRelation('posts').create({ title: 'imported' });
  }
});
// Inside the callback, parent-side touches are skipped.

User.isIgnoringTouch(); // false again outside
```

### 3. Suppress touches for a list of model classes

```ts
await Post.withoutTouchingOn([User, Team], async () => {
  // For each save inside this callback, no User or Team gets its
  // updated_at bumped, even if posts are saved.
});
```

### 4. Inspect inside a save handler

```ts
class Post extends Model {
  Boot() {
    this.registerModelEvent('saved', (post) => {
      if (Post.isIgnoringTouch(User)) {
        // Skip cache invalidation — caller doesn't want User to be touched.
        return;
      }
      // Otherwise invalidate the user cache.
    });
  }
}
```

## When to Suppress Touches

Common cases:

- **Bulk imports** — re-deriving every parent's `updated_at` would invalidate caches en masse.
- **Migration scripts** — touches happen for the wrong reason during a rewrite.
- **Background sync jobs** — the data is being mirrored, not user-initiated.

For everyday writes, leave touching on — it's the mechanism that keeps `recently updated` ordering correct.

## Common Pitfalls

- **`isIgnoringTouch` is class-level state.** Don't manipulate `ignoreOnTouch` directly — use `withoutTouching`/`withoutTouchingOn` so the list is reset on exit even if the callback throws.
- **Affects only the registered classes.** Saving an unrelated model still touches its own parents.

## See Also

- `withoutTouching` / `withoutTouchingOn` — the public APIs that flip the flag.
- [`save`](./save) — what triggers the touch in the first place.
- [Touching Parent Timestamps](../relationships/touching-parent-timestamps).

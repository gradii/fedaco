### One of Many (Polymorphic)

Sometimes a model may have many related models, yet you want to easily retrieve the "latest" or "oldest" related model of the relationship. For example, a `User` model may be related to many `Image` models, but you want to define a convenient way to interact with the most recent image the user has uploaded. You may accomplish this using the `morphOne` relationship type combined with the `ofMany` methods:

```typescript
class Post extends Model {
  /**
   * Get the user's most recent image.
   */
  @MorphOneColumn({
    related: Image,
    morphName: 'imageable',
    onQuery: (q) => {
      q.latestOfMany();
    }
  })
  public latestImage;
}
```

Likewise, you may define a method to retrieve the "oldest", or first, related model of a relationship:

```typescript
class Post extends Model {
  /**
   * Get the user's oldest image.
   */
  @MorphOneColumn({
    related: Image,
    morphName: 'imageable',
    onQuery: (q) => {
      q.oldestOfMany();
    }
  })
  public oldestImage;
}
```

By default, the `latestOfMany` and `oldestOfMany` methods will retrieve the latest or oldest related model based on the model's primary key, which must be sortable. However, sometimes you may wish to retrieve a single model from a larger relationship using a different sorting criteria.

For example, using the `ofMany` method, you may retrieve the user's most "liked" image. The `ofMany` method accepts the sortable column as its first argument and which aggregate function (`min` or `max`) to apply when querying for the related model:

```typescript
class Post extends Model {
  /**
   * Get the user's most popular image.
   */
  @MorphOneColumn({
    related: Image,
    morphName: 'imageable',
    onQuery: (q) => {
      q.ofMany('likes', 'max')
    }
  })
  public bestImage;
}
```

> [!NOTE]  
> It is possible to construct more advanced "one of many" relationships. For more information, please consult the [has one of many documentation](#advanced-has-one-of-many-relationships).

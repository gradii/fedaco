# Aggregating Related Models

## Counting Related Models

Sometimes you may want to count the number of related models for a given relationship without actually loading the models. To accomplish this, you may use the `withCount` method. The `withCount` method will place a `{relation}_count` attribute on the resulting models:

```typescript
const posts = await Post.createQuery().withCount('comments').get();

for(const post of posts) {
  console.log(post.GetAttribute('comments_count'));
}
```

By passing an array to the `withCount` method, you may add the "counts" for multiple relations as well as add additional constraints to the queries:

```typescript
const posts = await Post.createQuery()
  .withCount('votes', {
    'comments': function (query) {
      query.where('content', 'like', 'code%');
    }
  })
  .get();

console.log($posts[0].GetAttribute('votes_count'));
console.log($posts[0].GetAttribute(comments_count));
```

You may also alias the relationship count result, allowing multiple counts on the same relationship:
```typescript
const posts = await Post.createQuery()
  .withCount(
    'comments',
    {
      'comments as pending_comments_count': (query) => {
        query.where('approved', false);
      }
    }
  ).get();

    console.log(posts[0].GetAttribute('comments_count'));
    console.log($posts[0].GetAttribute('pending_comments_count'));
```

### Deferred Count Loading

Using the `loadCount` method, you may load a relationship count after the parent model has already been retrieved:

```typescript
const book = Book.createQuery().first();

book.LoadCount('genres');
```

If you need to set additional query constraints on the count query, you may pass an array keyed by the relationships you wish to count. The array values should be closures which receive the query builder instance:

```typescript
book.LoadCount({
  'reviews': function (query) {
    query.where('rating', 5);
  }
})
```

### Relationship Counting and Custom Select Statements

If you're combining `withCount` with a `select` statement, ensure that you call `withCount` after the `select` method:

```typescript
posts = await Post.createQuery().select(['title', 'body'])
  .withCount('comments')
  .get();
```

### Other Aggregate Functions

In addition to the `withCount` method, Eloquent provides `withMin`, `withMax`, `withAvg`, `withSum`, and `withExists` methods. These methods will place a `{relation}_{function}_{column}` attribute on your resulting models:
```typescript
const posts = await Post.createQuery().withSum('comments', 'votes').get();
for (const post of posts) {
  console.log(post.GetAttribute('comments_sum_votes'));
}
```

If you wish to access the result of the aggregate function using another name, you may specify your own alias:

```typescript
const posts = await Post.createQuery().withSum('comments as total_comments', 'votes').get();
for (const pos of posts) {
  console.log(post.GetAttribute('total_comments'));
}
```

Like the `loadCount` method, deferred versions of these methods are also available. These additional aggregate operations may be performed on Eloquent models that have already been retrieved:
```typescript
const post = await Post.createQuery().first();

post.LoadSum('comments', 'votes');
```

If you're combining these aggregate methods with a `select` statement, ensure that you call the aggregate methods after the `select` method:

```typescript
const posts = Post.createQuery().select(['title', 'body'])
  .withExists('comments')
  .get();
```

### Counting Related Models on Morph To Relationships

If you would like to eager load a "morph to" relationship, as well as related model counts for the various entities that may be returned by that relationship, you may utilize the `with` method in combination with the `morphTo` relationship's `morphWithCount` method.

In this example, let's assume that `Photo` and `Post` models may create `ActivityFeed` models. We will assume the `ActivityFeed` model defines a "morph to" relationship named `parentable` that allows us to retrieve the parent `Photo` or `Post` model for a given `ActivityFeed` instance. Additionally, let's assume that `Photo` models "have many" `Tag` models and `Post` models "have many" `Comment` models.

Now, let's imagine we want to retrieve `ActivityFeed` instances and eager load the `parentable` parent models for each `ActivityFeed` instance. In addition, we want to retrieve the number of tags that are associated with each parent photo and the number of comments that are associated with each parent post:

```typescript
const activities = await ActivityFeed.createQuery().with({
  'parentable': function (morphTo) {
    morphTo.morphWithCount({
      "Photo": ['tags'],
      'Post': ['comments'],
    });
  }
}).get();
```

#### Deferred Count Loading

Let's assume we have already retrieved a set of `ActivityFeed` models and now we would like to load the nested relationship counts for the various `parentable` models associated with the activity feeds. You may use the `LoadMorphCount` method to accomplish this:

```typescript
const activities = await ActivityFeed.createQuery().with('parentable').get();

activities.LoadMorphCount('parentable', {
  'Photo': ['tags'],
  'Post': ['comments'],
});
```

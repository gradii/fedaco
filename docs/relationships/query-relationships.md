## Querying Relations

Since all Fedaco relationships are defined via methods, you may call those methods to obtain an instance of the relationship without actually executing a query to load the related models. In addition, all types of Fedaco relationships also serve as [query builders](/docs/{{version}}/queries), allowing you to continue to chain constraints onto the relationship query before finally executing the SQL query against your database.

For example, imagine a blog application in which a `User` model has many associated `Post` models:

```typescript
class User extends Model {
  /**
   * Get all of the posts for the user.
   */
  @HasManyColumn({
    related: forwardRef(() => Post)
  })
  public posts
}
```

You may query the `posts` relationship and add additional constraints to the relationship like so:

```typescript
const user = await User.createQuery().find(1);

await user.NewRelation('posts').where('active', 1).get();
```

You are able to use any of the Laravel [query builder's](/docs/{{version}}/queries) methods on the relationship, so be sure to explore the query builder documentation to learn about all of the methods that are available to you.

<a name="chaining-orwhere-clauses-after-relationships"></a>
#### Chaining `orWhere` Clauses After Relationships

As demonstrated in the example above, you are free to add additional constraints to relationships when querying them. However, use caution when chaining `orWhere` clauses onto a relationship, as the `orWhere` clauses will be logically grouped at the same level as the relationship constraint:

```typescript
await user.newRelation('posts')
  .where('active', 1)
  .orWhere('votes', '>=', 100)
  .get();
```

The example above will generate the following SQL. As you can see, the `or` clause instructs the query to return _any_ post with greater than 100 votes. The query is no longer constrained to a specific user:

```sql
select * from posts where user_id = ? and active = 1 or votes >= 100
```

In most situations, you should use [logical groups](/docs/{{version}}/queries#logical-grouping) to group the conditional checks between parentheses:

```typescript
 await user.NewRelation('posts')
  .where((query) => {
    return query.where('active', 1)
      .orWhere('votes', '>=', 100);
  })
  .get();
```

The example above will produce the following SQL. Note that the logical grouping has properly grouped the constraints and the query remains constrained to a specific user:

```sql
select * from posts where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
### Relationship Methods vs. Dynamic Properties

If you do not need to add additional constraints to an Fedaco relationship query, you may access the relationship as if it were a property. For example, continuing to use our `User` and `Post` example models, we may access all of a user's posts like so:

```typescript
const user = User.createQuery().find(1);
for (const post of await user.posts) {
  // ...
}
```

Dynamic relationship properties perform "lazy loading", meaning they will only load their relationship data when you actually access them. Because of this, developers often use [eager loading](#eager-loading) to pre-load relationships they know will be accessed after loading the model. Eager loading provides a significant reduction in SQL queries that must be executed to load a model's relations.

### Querying Relationship Existence

When retrieving model records, you may wish to limit your results based on the existence of a relationship. For example, imagine you want to retrieve all blog posts that have at least one comment. To do so, you may pass the name of the relationship to the `has` and `orHas` methods:

```typescript
// Retrieve all posts that have at least one comment...
const posts = await Post.createQuery().has('comments').get();
```

You may also specify an operator and count value to further customize the query:
```typescript
// Retrieve all posts that have three or more comments...
const posts = await Post.createQuery().has('comments', '>=', 3).get();
```

Nested `has` statements may be constructed using "dot" notation. For example, you may retrieve all posts that have at least one comment that has at least one image:
```typescript
// Retrieve posts that have at least one comment with images...
const posts = await Post.createQuery().has('comments.images').get();
```

If you need even more power, you may use the `whereHas` and `orWhereHas` methods to define additional query constraints on your `has` queries, such as inspecting the content of a comment:
```typescript
// Retrieve posts with at least one comment containing words like code%...
$posts = Post.createQuery()
  .whereHas('comments', function (query) {
    query.where('content', 'like', 'code%');
  })
  .get();

// Retrieve posts with at least ten comments containing words like code%...
$posts = Post.createQuery()
  .whereHas('comments', function (query) {
    query.where('content', 'like', 'code%');
  }, '>=', 10)
  .get();
```

> [!WARNING]  
> Fedaco does not currently support querying for relationship existence across databases. The relationships must exist within the same database.

[//]: # (#### Inline Relationship Existence Queries)

[//]: # ()
[//]: # (If you would like to query for a relationship's existence with a single, simple where condition attached to the relationship query, you may find it more convenient to use the `whereRelation`, `orWhereRelation`, `whereMorphRelation`, and `orWhereMorphRelation` methods. For example, we may query for all posts that have unapproved comments:)

[//]: # ()
[//]: # (    use App\Models\Post;)

[//]: # ()
[//]: # (    $posts = Post::whereRelation&#40;'comments', 'is_approved', false&#41;->get&#40;&#41;;)

[//]: # ()
[//]: # (Of course, like calls to the query builder's `where` method, you may also specify an operator:)

[//]: # ()
[//]: # (    $posts = Post::whereRelation&#40;)

[//]: # (        'comments', 'created_at', '>=', now&#40;&#41;->subHour&#40;&#41;)

[//]: # (    &#41;->get&#40;&#41;;)

### Querying Relationship Absence

When retrieving model records, you may wish to limit your results based on the absence of a relationship. For example, imagine you want to retrieve all blog posts that **don't** have any comments. To do so, you may pass the name of the relationship to the `doesntHave` and `orDoesntHave` methods:

```typescript
const posts = Post.createQuery().doesntHave('comments').get();
```

If you need even more power, you may use the `whereDoesntHave` and `orWhereDoesntHave` methods to add additional query constraints to your `doesntHave` queries, such as inspecting the content of a comment:

```typescript
const posts = Post.createQuery().whereDoesntHave('comments', function (query) {
  query.where('content', 'like', 'code%');
}).get();
```

You may use "dot" notation to execute a query against a nested relationship. For example, the following query will retrieve all posts that do not have comments; however, posts that have comments from authors that are not banned will be included in the results:

```typescript
const posts = Post.createQuery().whereDoesntHave('comments.author', function (query) {
  query.where('banned', 0);
}).get();
```

### Querying Morph To Relationships

To query the existence of "morph to" relationships, you may use the `whereHasMorph` and `whereDoesntHaveMorph` methods. These methods accept the name of the relationship as their first argument. Next, the methods accept the names of the related models that you wish to include in the query. Finally, you may provide a closure which customizes the relationship query:

```typescript
// Retrieve comments associated to posts or videos with a title like code%...
$comments = Comment.createQuery().whereHasMorph(
  'commentable',
  [Post, Video],
  function (query) {
    query.where('title', 'like', 'code%');
  }
).get();

// Retrieve comments associated to posts with a title not like code%...
$comments = Comment::whereDoesntHaveMorph(
  'commentable',
  Post,
  function (query) {
    query.where('title', 'like', 'code%');
  }
).get();
```

You may occasionally need to add query constraints based on the "type" of the related polymorphic model. The closure passed to the `whereHasMorph` method may receive a `$type` value as its second argument. This argument allows you to inspect the "type" of the query that is being built:

```typescript
const comments = await Comment.createQuery().whereHasMorph(
  'commentable',
  [Post, Video],
  function (query, type) {
    const column = type === Post ? 'content' : 'title';

    query.where(column, 'like', 'code%');
  }
).get();
```

#### Querying All Related Models

Instead of passing an array of possible polymorphic models, you may provide `*` as a wildcard value. This will instruct Laravel to retrieve all of the possible polymorphic types from the database. Laravel will execute an additional query in order to perform this operation:

```typescript
const comments = Comment.createQuery()
  .whereHasMorph('commentable', '*', function (query) {
    query.where('title', 'like', 'foo%');
  }).get();
```

# Relation One To Many

A one-to-many relationship is used to define relationships where a single model is the parent to one or more child models. For example, a blog post may have an infinite number of comments. Like all other Fedaco relationships, one-to-many relationships are defined by defining an annotation on your Fedaco model property:

```typescript
import {HasManyColumn, forwardRef} from "@gradii/fedaco";

class Post extends Model {
  /**
   * Get the comments for the blog post.
   */
  @HasManyColumn({
    related: forwardRef(() => Comment)
  })
  public comments: FedacoRelationType<Comment>
}
```

Remember, Fedaco will automatically determine the proper foreign key column for the `Comment` model. By convention, Fedaco will take the "snake case" name of the parent model and suffix it with `_id`. So, in this example, Fedaco will assume the foreign key column on the `Comment` model is `post_id`.

```typescript

comments = await (await Post.createQuery().find(1)).comments;

for (const comment of comments) {
  // ...
}
```

Since all relationships also serve as query builders, you may add further constraints to the relationship query by calling the `comments` method and continuing to chain conditions onto the query:

```typescript
comment = (await Post::find(1)).NewRelation('comments')
  .where('title', 'foo')
  .first();
```

Like the `hasOne` method, you may also override the foreign and local keys by passing additional config to the `HasManyColumn` annotation:

```typescript
class Post extends Model {
  @HasManyColumn({
    related: forwardRef(() => Comment),
    foreignKey: 'foreign_key'
  })
  public comments: FedacoRelationType<Comment>
}

class Post extends Model {
  @HasManyColumn({
    related: forwardRef(() => Comment),
    foreignKey: 'foreign_key',
    localKey: 'local_key'
  })
  public comments: FedacoRelationType<Comment>
}
```

## One to Many (Inverse) / Belongs To

Now that we can access all of a post's comments, let's define a relationship to allow a comment to access its parent post. To define the inverse of a `hasMany` relationship, define a relationship method on the child model which calls the `belongsTo` method:

```typescript

class Comment extends Model {
  /**
   * Get the post that owns the comment.
   */
  @BelongsToColumn({
    related: forwardRef(() => Post)
  })
  public post: FedacoRelationType<Post>
}
```

Once the relationship has been defined, we can retrieve a comment's parent post by accessing the `post` "relationship property":

```typescript

comment = await Comment.createQuery().find(1);

return (await comment.post).title;
```

In the example above, Fedaco will attempt to find a `Post` model that has an `id` which matches the `post_id` column on the `Comment` model.

Fedaco determines the default foreign key name by examining the name of the relationship method and suffixing the method name with a `_` followed by the name of the parent model's primary key column. So, in this example, Fedaco will assume the `Post` model's foreign key on the `comments` table is `post_id`.

However, if the foreign key for your relationship does not follow these conventions, you may pass a custom foreign key name as the second argument to the `belongsTo` method:

```typescript
class Comment extends Model {
  /**
   * Get the post that owns the comment.
   */
  @BelongsToColumn({
    related: forwardRef(() => Post),
    foreignKey: 'foreign_key'
  })
  public post: FedacoRelationType<Post>;
}
```

If your parent model does not use `id` as its primary key, or you wish to find the associated model using a different column, you may pass a third argument to the `belongsTo` method specifying your parent table's custom key:

```typescript
class Comment extends Model {
  /**
   * Get the post that owns the comment.
   */
  @BelongsToColumn({
    related: forwardRef(() => Post),
    foreignKey: 'foreign_key',
    ownerKey: 'owner_key'
  })
  public post: FedacoRelationType<Post>;
}
```

## Default Models

The `belongsTo`, `hasOne`, `hasOneThrough`, and `morphOne` relationships allow you to define a default model that will be returned if the given relationship is `null`. This pattern is often referred to as the [Null Object pattern](https://en.wikipedia.org/wiki/Null_Object_pattern) and can help remove conditional checks in your code. In the following example, the `user` relation will return an empty `App\Models\User` model if no user is attached to the `Post` model:

```typescript
class Post extends Model {
  /**
   * Get the author of the post.
   */
  @BelongsToColumn({
    related: forwardRef(() => User),
    onQuery: (q => q.withDefault())
  })
  public user: FedacoRelationType<User>
}
```

To populate the default model with attributes, you may pass an array or closure to the `withDefault` method:

```typescript
class Post extends Model {
  /**
   * Get the author of the post.
   */
  @BelongsToColumn({
    related: forwardRef(() => User),
    onQuery: (q => q.withDefault({
      'name': 'Guest Author',
    }))
  })
  public user: FedacoRelationType<User>
}

class Post extends Model {
  /**
   * Get the author of the post.
   */
  @BelongsToColumn({
    related: forwardRef(() => User),
    onQuery: (q => q.withDefault((user: User, post: Post) => {
      user.name = 'Guest Author';
    }))
  })
  public user: FedacoRelationType<User>
}
```

[//]: # ()
[//]: # (## Querying Belongs To Relationships)

[//]: # ()
[//]: # ()
[//]: # (When querying for the children of a "belongs to" relationship, you may manually build the `where` clause to retrieve the corresponding Fedaco models:)

[//]: # ()
[//]: # ()
[//]: # (```typescript)

[//]: # ()
[//]: # (posts = await Post.crateQuery&#40;&#41;.where&#40;'user_id', user.id&#41;.get&#40;&#41;;)

[//]: # ()
[//]: # (```)

[//]: # ()
[//]: # ()
[//]: # (However, you may find it more convenient to use the `whereBelongsTo` method, which will automatically determine the proper relationship and foreign key for the given model:)

[//]: # ()
[//]: # ()
[//]: # (    $posts = Post::whereBelongsTo&#40;$user&#41;->get&#40;&#41;;)

[//]: # ()
[//]: # ()
[//]: # (You may also provide a [collection]&#40;/docs/{{version}}/Fedaco-collections&#41; instance to the `whereBelongsTo` method. When doing so, Laravel will retrieve models that belong to any of the parent models within the collection:)

[//]: # ()
[//]: # ()
[//]: # (    $users = User::where&#40;'vip', true&#41;->get&#40;&#41;;)

[//]: # ()
[//]: # ()
[//]: # (    $posts = Post::whereBelongsTo&#40;$users&#41;->get&#40;&#41;;)

[//]: # ()
[//]: # ()
[//]: # (By default, Laravel will determine the relationship associated with the given model based on the class name of the model; however, you may specify the relationship name manually by providing it as the second argument to the `whereBelongsTo` method:)

[//]: # ()
[//]: # ()
[//]: # (    $posts = Post::whereBelongsTo&#40;$user, 'author'&#41;->get&#40;&#41;;)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # ()
[//]: # ()


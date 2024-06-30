# One to Many (Polymorphic)

<a name="one-to-many-polymorphic-table-structure"></a>

## Table Structure

A one-to-many polymorphic relation is similar to a typical one-to-many relation; however, the child model can belong to more than one type of model using a single association. For example, imagine users of your application can "comment" on posts and videos. Using polymorphic relationships, you may use a single `comments` table to contain comments for both posts and videos. First, let's examine the table structure required to build this relationship:

```
posts
    id - integer
    title - string
    body - text

videos
    id - integer
    title - string
    url - string

comments
    id - integer
    body - text
    commentable_id - integer
    commentable_type - string
```

<a name="one-to-many-polymorphic-model-structure"></a>

## Model Structure

Next, let's examine the model definitions needed to build this relationship:

```typescript
    class Comment extends Model {
  /**
   * Get the parent commentable model (post or video).
   */
  @MorphToColumn()
  public commentable;
}


class Post extends Model {
  /**
   * Get all of the post's comments.
   */
  @MorphManyColumn({
    related: forwardRef(() => Comment),
    morphName: 'commentable'
  })
  public comments;
}


class Video extends Model {
  /**
   * Get all of the video's comments.
   */
  @MorphManyColumn({
    related: forwardRef(() => Comment),
    morphName: 'commentable'
  })
  public comments;
}
```

<a name="one-to-many-polymorphic-retrieving-the-relationship"></a>

## Retrieving the Relationship

Once your database table and models are defined, you may access the relationships via your model's dynamic relationship properties. For example, to access all of the comments for a post, we can use the `comments` dynamic property:

```typescript
const post = await Post.createQuery().find(1);
for (const comment of await post.comments) {
  // ...
}
```

You may also retrieve the parent of a polymorphic child model by accessing the name of the method that performs the call to `morphTo`. In this case, that is the `commentable` method on the `Comment` model. So, we will access that method as a dynamic relationship property in order to access the comment's parent model:

```typescript
const comment = await Comment.createQuery().find(1);
const commentable = await comment.commentable;

```

The `commentable` relation on the `Comment` model will return either a `Post` or `Video` instance, depending on which type of model is the comment's parent.

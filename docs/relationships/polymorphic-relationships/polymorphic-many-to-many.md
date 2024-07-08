# Many to Many (Polymorphic)

## Table Structure

Many-to-many polymorphic relations are slightly more complicated than "morph one" and "morph many" relationships. For example, a `Post` model and `Video` model could share a polymorphic relation to a `Tag` model. Using a many-to-many polymorphic relation in this situation would allow your application to have a single table of unique tags that may be associated with posts or videos. First, let's examine the table structure required to build this relationship:

```
posts
    id - integer
    name - string

videos
    id - integer
    name - string

tags
    id - integer
    name - string

taggables
    tag_id - integer
    taggable_id - integer
    taggable_type - string
```

> [!NOTE]  
> Before diving into polymorphic many-to-many relationships, you may benefit from reading the documentation on typical [many-to-many relationships](#many-to-many).

<a name="many-to-many-polymorphic-model-structure"></a>

## Model Structure

Next, we're ready to define the relationships on the models. The `Post` and `Video` models will both contain a `tags` method that calls the `morphToMany` method provided by the base Eloquent model class.

The `MorphToManyColumn` annotation accepts the name of the related model as well as the "relationship name". Based on the name we assigned to our intermediate table name and the keys it contains, we will refer to the relationship as "taggable":

```typescript
class Post extends Model {
  /**
   * Get all of the tags for the post.
   */
  @MorphToManyColumn({
    related: fowardRef(() => Tag),
    name: 'taggable'
  })
  public tags;
}
```

## Defining the Inverse of the Relationship

Next, on the `Tag` model, you should define a method for each of its possible parent models. So, in this example, we will define a `posts` method and a `videos` method. Both of these methods should return the result of the `morphedByMany` method.

The `morphedByMany` method accepts the name of the related model as well as the "relationship name". Based on the name we assigned to our intermediate table name and the keys it contains, we will refer to the relationship as "taggable":

```typescript
import {MorphedByManyColumn} from "./morphed-by-many.relation-column";
import {forwardRef} from "./forward-ref";

class Tag extends Model {
  /**
   * Get all of the posts that are assigned this tag.
   */
  @MorphedByManyColumn({
    related: forwardRef(() => Post),
    name: 'taggable'
  })
  public posts

  /**
   * Get all of the videos that are assigned this tag.
   */
  @MorphedByManyColumn({
    related: forwardRef(() => Video),
    name: 'taggable'
  })
  public videos
}
```

## Retrieving the Relationship

Once your database table and models are defined, you may access the relationships via your models. For example, to access all of the tags for a post, you may use the `tags` dynamic relationship property:

```typescript
const post = Post.createQuery().find(1);

for (const tag of await post.tags) {
  // ...
}
```

You may retrieve the parent of a polymorphic relation from the polymorphic child model by accessing the name of the method that performs the call to `morphedByMany`. In this case, that is the `posts` or `videos` methods on the `Tag` model:

```typescript
const tag = Tag.createQuery().find(1);

for (const post of await tag.posts) {
  // ...
}

for (const video of await tag.videos) {
  // ...
}

```
# One to One (Polymorphic)

## Table Structure

A one-to-one polymorphic relation is similar to a typical one-to-one relation; however, the child model can belong to more than one type of model using a single association. For example, a blog `Post` and a `User` may share a polymorphic relation to an `Image` model. Using a one-to-one polymorphic relation allows you to have a single table of unique images that may be associated with posts and users. First, let's examine the table structure:

```
posts
    id - integer
    name - string

users
    id - integer
    name - string

images
    id - integer
    url - string
    imageable_id - integer
    imageable_type - string
```


Note the `imageable_id` and `imageable_type` columns on the `images` table. The `imageable_id` column will contain the ID value of the post or user, while the `imageable_type` column will contain the class name of the parent model. The `imageable_type` column is used by Fedaco to determine which "type" of parent model to return when accessing the `imageable` relation. In this case, the column would contain either `Post` or `User`.

## Model Structure

Next, let's examine the model definitions needed to build this relationship:
```typescript
@Table({
  tableName: 'images'
})
class Image extends Model {
  @MorphToColumn()
  public imageable;
}

@Table({
  tableName: 'posts'
})
class Post extends Model {
  @MorphOneColumn({
    related: forwardRef(() => Image),
    morphName: 'imageable'
  })
  public image;
}

@Table({
  tableName: 'users'
})
class User extends Model {
  @MorphOneColumn({
    related: forwardRef(() => Image),
    morphName: 'imageable'
  })
  public image;
}
```

## Retrieving the Relationship

Once your database table and models are defined, you may access the relationships via your models. For example, to retrieve the image for a post, we can access the `image` dynamic relationship property:
```typescript
const post = await Post.createQuery().find(1);

const image = await post.image;
```

You may retrieve the parent of the polymorphic model by accessing the name of the method that performs the call to `morphTo`. In this case, that is the `imageable` method on the `Image` model. So, we will access that method as a dynamic relationship property:

```typescript
const image = await Image.createQuery().find(1);

const imageable = await image.imageable;
```

The `imageable` relation on the `Image` model will return either a `Post` or `User` instance, depending on which type of model owns the image.

<a name="morph-one-to-one-key-conventions"></a>
## Key Conventions

If necessary, you may specify the name of the "id" and "type" columns utilized by your polymorphic child model. If you do so, ensure that you always pass the name of the relationship as the first argument to the `morphTo` method. Typically, this value should match the method name, so you may use PHP's `__FUNCTION__` constant:

```typescript

class Image extends Model {
  /**
   * Get the model that the image belongs to.
   */
  @MorphToColumn({
    morphTypeMap: {
      'users': forwardRef(() => User),
      'posts': forwardRef(() => Post)
    },
    id: 'imageable_type',
    ownerKey: 'imageable_id'
  })
  public imageable
}
```
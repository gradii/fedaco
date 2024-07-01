# Inserting and Updating Related Models

## The `save` Method

Eloquent provides convenient methods for adding new models to relationships. For example, perhaps you need to add a new comment to a post. Instead of manually setting the `post_id` attribute on the `Comment` model you may insert the comment using the relationship's `save` method:

```typescript
const comment = new Comment({'message':'A new comment.'});

const post = await Post.createQuery().find(1);

await post.NewRelation('comments').save(comment);
```

Note that we did not access the `comments` relationship as a dynamic property. Instead, we called the `comments` method to obtain an instance of the relationship. The `save` method will automatically add the appropriate `post_id` value to the new `Comment` model.

If you need to save multiple related models, you may use the `saveMany` method:

    $post = Post::find(1);

    $post->comments()->saveMany([
        new Comment(['message' => 'A new comment.']),
        new Comment(['message' => 'Another new comment.']),
    ]);

The `save` and `saveMany` methods will persist the given model instances, but will not add the newly persisted models to any in-memory relationships that are already loaded onto the parent model. If you plan on accessing the relationship after using the `save` or `saveMany` methods, you may wish to use the `refresh` method to reload the model and its relationships:

    $post->comments()->save($comment);

    $post->refresh();

    // All comments, including the newly saved comment...
    $post->comments;

<a name="the-push-method"></a>
#### Recursively Saving Models and Relationships

If you would like to `save` your model and all of its associated relationships, you may use the `push` method. In this example, the `Post` model will be saved as well as its comments and the comment's authors:

    $post = Post::find(1);

    $post->comments[0]->message = 'Message';
    $post->comments[0]->author->name = 'Author Name';

    $post->push();

The `pushQuietly` method may be used to save a model and its associated relationships without raising any events:

    $post->pushQuietly();

<a name="the-create-method"></a>
### The `create` Method

In addition to the `save` and `saveMany` methods, you may also use the `create` method, which accepts an array of attributes, creates a model, and inserts it into the database. The difference between `save` and `create` is that `save` accepts a full Eloquent model instance while `create` accepts a plain PHP `array`. The newly created model will be returned by the `create` method:

    use App\Models\Post;

    $post = Post::find(1);

    $comment = $post->comments()->create([
        'message' => 'A new comment.',
    ]);

You may use the `createMany` method to create multiple related models:

    $post = Post::find(1);

    $post->comments()->createMany([
        ['message' => 'A new comment.'],
        ['message' => 'Another new comment.'],
    ]);

The `createQuietly` and `createManyQuietly` methods may be used to create a model(s) without dispatching any events:

    $user = User::find(1);

    $user->posts()->createQuietly([
        'title' => 'Post title.',
    ]);
    
    $user->posts()->createManyQuietly([
        ['title' => 'First post.'],
        ['title' => 'Second post.'],
    ]);

You may also use the `findOrNew`, `firstOrNew`, `firstOrCreate`, and `updateOrCreate` methods to [create and update models on relationships](/docs/{{version}}/eloquent#upserts).

> [!NOTE]  
> Before using the `create` method, be sure to review the [mass assignment](/docs/{{version}}/eloquent#mass-assignment) documentation.

<a name="updating-belongs-to-relationships"></a>
### Belongs To Relationships

If you would like to assign a child model to a new parent model, you may use the `associate` method. In this example, the `User` model defines a `belongsTo` relationship to the `Account` model. This `associate` method will set the foreign key on the child model:

    use App\Models\Account;

    $account = Account::find(10);

    $user->account()->associate($account);

    $user->save();

To remove a parent model from a child model, you may use the `dissociate` method. This method will set the relationship's foreign key to `null`:

    $user->account()->dissociate();

    $user->save();

### Many to Many Relationships

#### Attaching / Detaching

Eloquent also provides methods to make working with many-to-many relationships more convenient. For example, let's imagine a user can have many roles and a role can have many users. You may use the `attach` method to attach a role to a user by inserting a record in the relationship's intermediate table:

    use App\Models\User;

    $user = User::find(1);

    $user->roles()->attach($roleId);

When attaching a relationship to a model, you may also pass an array of additional data to be inserted into the intermediate table:

    $user->roles()->attach($roleId, ['expires' => $expires]);

Sometimes it may be necessary to remove a role from a user. To remove a many-to-many relationship record, use the `detach` method. The `detach` method will delete the appropriate record out of the intermediate table; however, both models will remain in the database:

    // Detach a single role from the user...
    $user->roles()->detach($roleId);

    // Detach all roles from the user...
    $user->roles()->detach();

For convenience, `attach` and `detach` also accept arrays of IDs as input:

    $user = User::find(1);

    $user->roles()->detach([1, 2, 3]);

    $user->roles()->attach([
        1 => ['expires' => $expires],
        2 => ['expires' => $expires],
    ]);

<a name="syncing-associations"></a>
#### Syncing Associations

You may also use the `sync` method to construct many-to-many associations. The `sync` method accepts an array of IDs to place on the intermediate table. Any IDs that are not in the given array will be removed from the intermediate table. So, after this operation is complete, only the IDs in the given array will exist in the intermediate table:

    $user->roles()->sync([1, 2, 3]);

You may also pass additional intermediate table values with the IDs:

    $user->roles()->sync([1 => ['expires' => true], 2, 3]);

If you would like to insert the same intermediate table values with each of the synced model IDs, you may use the `syncWithPivotValues` method:

    $user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);

If you do not want to detach existing IDs that are missing from the given array, you may use the `syncWithoutDetaching` method:

    $user->roles()->syncWithoutDetaching([1, 2, 3]);

<a name="toggling-associations"></a>
#### Toggling Associations

The many-to-many relationship also provides a `toggle` method which "toggles" the attachment status of the given related model IDs. If the given ID is currently attached, it will be detached. Likewise, if it is currently detached, it will be attached:

    $user->roles()->toggle([1, 2, 3]);

You may also pass additional intermediate table values with the IDs:

    $user->roles()->toggle([
        1 => ['expires' => true],
        2 => ['expires' => true],
    ]);

<a name="updating-a-record-on-the-intermediate-table"></a>
#### Updating a Record on the Intermediate Table

If you need to update an existing row in your relationship's intermediate table, you may use the `updateExistingPivot` method. This method accepts the intermediate record foreign key and an array of attributes to update:

    $user = User::find(1);

    $user->roles()->updateExistingPivot($roleId, [
        'active' => false,
    ]);

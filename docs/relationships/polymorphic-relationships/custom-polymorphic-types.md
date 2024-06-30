### Custom Polymorphic Types

By default, Fedaco will use the fully qualified class name to store the "type" of the related model. For instance, given the one-to-many relationship example above where a `Comment` model may belong to a `Post` or a `Video` model, the default `commentable_type` would be either `Post` or `Video`, respectively. However, you may wish to decouple these values from your application's internal structure.

For example, instead of using the model names as the "type", we may use simple strings such as `post` and `video`. By doing so, the polymorphic "type" column values in our database will remain valid even if the models are renamed:

```typescript
Relation.morphMap({
  'post': 'Post',
  'video': 'Video'
});
```

[//]: # (You may call the `morphMap` method in the `boot` method of your `App\Providers\AppServiceProvider` class or create a separate service provider if you wish.)

[//]: # ()
[//]: # (You may determine the morph alias of a given model at runtime using the model's `getMorphClass` method. Conversely, you may determine the fully-qualified class name associated with a morph alias using the `Relation::getMorphedModel` method:)

[//]: # ()
[//]: # (    use Illuminate\Database\Eloquent\Relations\Relation;)

[//]: # ()
[//]: # (    $alias = $post->getMorphClass&#40;&#41;;)

[//]: # ()
[//]: # (    $class = Relation::getMorphedModel&#40;$alias&#41;;)

[//]: # ()
[//]: # (> [!WARNING]  )

[//]: # (> When adding a "morph map" to your existing application, every morphable `*_type` column value in your database that still contains a fully-qualified class will need to be converted to its "map" name.)

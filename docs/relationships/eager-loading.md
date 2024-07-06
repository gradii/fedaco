# Eager Loading

When accessing Eloquent relationships as properties, the related models are "lazy loaded". This means the relationship data is not actually loaded until you first access the property. However, Eloquent can "eager load" relationships at the time you query the parent model. Eager loading alleviates the "N + 1" query problem. To illustrate the N + 1 query problem, consider a `Book` model that "belongs to" to an `Author` model:

```typescript

class Book extends Model {
  /**
   * Get the author that wrote the book.
   */
  @BelongsToColumn({
    related: forwardRef(() => Author)
  })
  public author;
}
```

Now, let's retrieve all books and their authors:

```typescript
const books = await Book.createQuery().all();

for (const book of books) {
  console.log((await book.author).name)
}
```

This loop will execute one query to retrieve all of the books within the database table, then another query for each book in order to retrieve the book's author. So, if we have 25 books, the code above would run 26 queries: one for the original book, and 25 additional queries to retrieve the author of each book.

Thankfully, we can use eager loading to reduce this operation to just two queries. When building a query, you may specify which relationships should be eager loaded using the `with` method:

```typescript
const books = await Book.createQuery().with('author').all();

for (const book of books) {
  console.log(book.author.name)
}
```

For this operation, only two queries will be executed - one query to retrieve all of the books and one query to retrieve all of the authors for all of the books:

```sql
select *
from books;

select *
from authors
where id in (1, 2, 3, 4, 5, .. .)
```

<a name="eager-loading-multiple-relationships"></a>

## Eager Loading Multiple Relationships

Sometimes you may need to eager load several different relationships. To do so, just pass an array of relationships to the `with` method:

```typescript
 const books = await Book.createQuery().with(['author', 'publisher']).get();
```

## Nested Eager Loading

To eager load a relationship's relationships, you may use "dot" syntax. For example, let's eager load all of the book's authors and all of the author's personal contacts:

```typescript
const $books = await Book.createQuery().with('author.contacts').get();
```

Alternatively, you may specify nested eager loaded relationships by providing a nested array to the `with` method, which can be convenient when eager loading multiple nested relationships:

```typescript
$books = await Book.createQuery().with({
  'author': [
    'contacts',
    'publisher',
  ],
}).get();
```

## Nested Eager Loading `morphTo` Relationships

If you would like to eager load a `morphTo` relationship, as well as nested relationships on the various entities that may be returned by that relationship, you may use the `with` method in combination with the `morphTo` relationship's `morphWith` method. To help illustrate this method, let's consider the following model:

```typescript

class ActivityFeed extends Model {
  /**
   * Get the parent of the activity feed record.
   */
  @MorphToColumn({
    morphTypeMap: {}
  })
  public parentable;
}
```

In this example, let's assume `Event`, `Photo`, and `Post` models may create `ActivityFeed` models. Additionally, let's assume that `Event` models belong to a `Calendar` model, `Photo` models are associated with `Tag` models, and `Post` models belong to an `Author` model.

Using these model definitions and relationships, we may retrieve `ActivityFeed` model instances and eager load all `parentable` models and their respective nested relationships:

```typescript
const activities = await ActivityFeed.createQuery().query()
  .with({
    'parentable': function (morphTo: MorphTo) {
      morphTo.morphWith({
        'Event': ['calendar'],
        'Photo': ['tags'],
        'Post': ['author'],
      });
    }
  }).get();
```

## Eager Loading Specific Columns

You may not always need every column from the relationships you are retrieving. For this reason, Eloquent allows you to specify which columns of the relationship you would like to retrieve:

```typescript
const books = await Book.createQuery().with('author:id,name,book_id').get();
```

> [!WARNING]  
> When using this feature, you should always include the `id` column and any relevant foreign key columns in the list of columns you wish to retrieve.

## Eager Loading by Default

Sometimes you might want to always load some relationships when retrieving a model. To accomplish this, you may define a `$with` property on the model:

```typescript
import {BelongsToColumn} from "./belongs-to.relation-column";

class Book extends Model {
  /**
   * The relationships that should always be loaded.
   *
   * @var array
   */
  protected _with = ['author'];

  /**
   * Get the author that wrote the book.
   */
  @BelongsToColumn({
    related: forwardRef(()=> Author)
  })
  public author;

  /**
   * Get the genre of the book.
   */
  @BelongsToColumn({
    related: forwardRef(()=> Genre)
  })
  public genre;
}
```

If you would like to remove an item from the `_with` property for a single query, you may use the `without` method:

```typescript
const books = await Book.createQuery().without('author').get();
```

If you would like to override all items within the `_with` property for a single query, you may use the `withOnly` method:

```typescript
const books = Book.createQuery().withOnly('genre').get();
```

## Constraining Eager Loads

Sometimes you may wish to eager load a relationship but also specify additional query conditions for the eager loading query. You can accomplish this by passing an array of relationships to the `with` method where the array key is a relationship name and the array value is a closure that adds additional constraints to the eager loading query:

```typescript
const users = await User.createQuery().with({
  'posts': function (query: Builder) {
    query.where('title', 'like', '%code%');
  }
}).get();
```

In this example, Eloquent will only eager load posts where the post's `title` column contains the word `code`. You may call other query builder methods to further customize the eager loading operation:

```typescript
const $users = await User.createQuery().with({
  'posts': function (query: Builder) {
    query.orderBy('created_at', 'desc');
  }
}).get();
```

## Constraining Eager Loading of `morphTo` Relationships

If you are eager loading a `morphTo` relationship, Eloquent will run multiple queries to fetch each type of related model. You may add additional constraints to each of these queries using the `MorphTo` relation's `constrain` method:
```typescript
const comments = await Comment.createQuery().with({
  'commentable': function ($morphTo: MorphTo) {
    morphTo.constrain({
      'Post': function (query) {
        query.whereNull('hidden_at');
      },
      'Video': function (query) {
        query.where('type', 'educational');
      },
    });
  }
}).get();
```

In this example, Eloquent will only eager load posts that have not been hidden and videos that have a `type` value of "educational".

## Constraining Eager Loads With Relationship Existence

You may sometimes find yourself needing to check for the existence of a relationship while simultaneously loading the relationship based on the same conditions. For example, you may wish to only retrieve `User` models that have child `Post` models matching a given query condition while also eager loading the matching posts. You may accomplish this using the `withWhereHas` method:

```typescript
const users = User.createQuery().withWhereHas('posts', function (query) {
  query.where('featured', true);
}).get();
```

## Lazy Eager Loading

Sometimes you may need to eager load a relationship after the parent model has already been retrieved. For example, this may be useful if you need to dynamically decide whether to load related models:

```typescript
const books = await Book.createQuery().all();

if (someCondition) {
  books.load('author', 'publisher');
}
```

If you need to set additional query constraints on the eager loading query, you may pass an array keyed by the relationships you wish to load. The array values should be closure instances which receive the query instance:

```typescript
author.load({
  'books': function (query: QueryBuilder) {
    query.orderBy('published_date', 'asc');
  }
});
```

To load a relationship only when it has not already been loaded, use the `loadMissing` method:

```typescript
book.loadMissing('author');
```

## Nested Lazy Eager Loading and `morphTo`

If you would like to eager load a `morphTo` relationship, as well as nested relationships on the various entities that may be returned by that relationship, you may use the `loadMorph` method.

This method accepts the name of the `morphTo` relationship as its first argument, and an array of model / relationship pairs as its second argument. To help illustrate this method, let's consider the following model:

```typescript
class ActivityFeed extends Model {
  /**
   * Get the parent of the activity feed record.
   */
  @MorphToColumn({
    
  })
  public parentable;
}
```

In this example, let's assume `Event`, `Photo`, and `Post` models may create `ActivityFeed` models. Additionally, let's assume that `Event` models belong to a `Calendar` model, `Photo` models are associated with `Tag` models, and `Post` models belong to an `Author` model.

Using these model definitions and relationships, we may retrieve `ActivityFeed` model instances and eager load all `parentable` models and their respective nested relationships:

```typescript
const activities = (await ActivityFeed.createQuery().with('parentable')
  .get())
  .loadMorph('parentable', {
    'Event': ['calendar'],
    'Photo': ['tags'],
    'Post': ['author'],
  });
```

## Preventing Lazy Loading

As previously discussed, eager loading relationships can often provide significant performance benefits to your application. Therefore, if you would like, you may instruct Laravel to always prevent the lazy loading of relationships. To accomplish this, you may invoke the `preventLazyLoading` method offered by the base Eloquent model class. Typically, you should call this method within the `boot` method of your application's `AppServiceProvider` class.

The `preventLazyLoading` method accepts an optional boolean argument that indicates if lazy loading should be prevented. For example, you may wish to only disable lazy loading in non-production environments so that your production environment will continue to function normally even if a lazy loaded relationship is accidentally present in production code:

```typescript
class Post extends Model {

  /**
   * Bootstrap any application services.
   */
  public boot(): void {
    Model.preventLazyLoading(!$this.app.isProduction());
  }
}
```

After preventing lazy loading, Eloquent will throw a `LazyLoadingViolationException` exception when your application attempts to lazy load any Eloquent relationship.

You may customize the behavior of lazy loading violations using the `handleLazyLoadingViolationsUsing` method. For example, using this method, you may instruct lazy loading violations to only be logged instead of interrupting the application's execution with exceptions:

```typescript
Model.handleLazyLoadingViolationUsing(function (model: typeof Model,  relation: string) {
    console.info(`Attempted to lazy load [${relation}] on model [${model}].`);
});
```
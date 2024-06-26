# Defining Custom Intermediate Table Models

If you would like to define a custom model to represent the intermediate table of your many-to-many relationship, you may call the `using` method when defining the relationship. Custom pivot models give you the opportunity to define additional behavior on the pivot model, such as methods and casts.

Custom many-to-many pivot models should extend the `Pivot` class while custom polymorphic many-to-many pivot models should extend the `MorphPivot` class. For example, we may define a `Role` model which uses a custom `RoleUser` pivot model:

```typescript
import {BelongsToManyColumn} from "./belongs-to-many.relation-column";

class Role extends Model {
  /**
   * The users that belong to the role.
   */
  @BelongsToManyColumn({
    related: forwardRef(() => User),
    onQuery: q => {
      q.using(RoleUser)
    }
  })
  public users;
}
```

When defining the `RoleUser` model, you should extend the `Illuminate\Database\Eloquent\Relations\Pivot` class:

```typescript
class RoleUser extends Pivot {
  // ...
}
```

> [!WARNING]  
> Pivot models may not use the `SoftDeletes` trait. If you need to soft delete pivot records consider converting your pivot model to an actual Eloquent model.

## Custom Pivot Models and Incrementing IDs

If you have defined a many-to-many relationship that uses a custom pivot model, and that pivot model has an auto-incrementing primary key, you should ensure your custom pivot model class defines an `incrementing` property that is set to `true`.

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public _incrementing = true;

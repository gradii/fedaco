# Has One Through

The "has-one-through" relationship defines a one-to-one relationship with another model. However, this relationship indicates that the declaring model can be matched with one instance of another model by proceeding _through_ a third model.

For example, in a vehicle repair shop application, each `Mechanic` model may be associated with one `Car` model, and each `Car` model may be associated with one `Owner` model. While the mechanic and the owner have no direct relationship within the database, the mechanic can access the owner _through_ the `Car` model. Let's look at the tables necessary to define this relationship:

    mechanics
        id - integer
        name - string

    cars
        id - integer
        model - string
        mechanic_id - integer

    owners
        id - integer
        name - string
        car_id - integer

Now that we have examined the table structure for the relationship, let's define the relationship on the `Mechanic` model:

```typescript
import {FedacoRelationType} from "./fedaco-types";

class Mechanic extends Model {
  /**
   * Get the car's owner.
   */
  @HasOneThroughColumn({
    related: forwardRef(() => Owner),
    through: forwardRef(() => Car)
  })
  public carOwner: FedacoRelationType<Owner>;
}
```

The `related` argument passed to the `HasOneThroughColumn` annotation is the name of the final model we wish to access, while the `through` argument is the name of the intermediate model.

## Key Conventions

Typical Eloquent foreign key conventions will be used when performing the relationship's queries. If you would like to customize the keys of the relationship, you may pass them as the third and fourth arguments to the `hasOneThrough` method. The third argument is the name of the foreign key on the intermediate model. The fourth argument is the name of the foreign key on the final model. The fifth argument is the local key, while the sixth argument is the local key of the intermediate model:

```typescript
import {FedacoRelationType} from "./fedaco-types";

class Mechanic extends Model {
  /**
   * Get the car's owner.
   */
  @HasOneThroughColumn({
    related: forwardRef(() => Owner),
    through: forwardRef(() => Car),
    firstKey: 'mechanic_id', // Foreign key on the cars table...
    secondKey: 'car_id', // Foreign key on the owners table...
    localKey: 'id', // Local key on the mechanics table...
    secondLocalKey: 'id' // Local key on the cars table...
  })
  public carOwner: FedacoRelationType<any>
}
```
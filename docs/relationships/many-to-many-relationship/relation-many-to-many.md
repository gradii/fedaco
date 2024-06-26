# Relation Many To Many

Many-to-many relations are slightly more complicated than `hasOne` and `hasMany` relationships. An example of a many-to-many relationship is a user that has many roles and those roles are also shared by other users in the application. For example, a user may be assigned the role of "Author" and "Editor"; however, those roles may also be assigned to other users as well. So, a user has many roles and a role has many users.

<a name="many-to-many-table-structure"></a>

## Table Structure

To define this relationship, three database tables are needed: `users`, `roles`, and `role_user`. The `role_user` table is derived from the alphabetical order of the related model names and contains `user_id` and `role_id` columns. This table is used as an intermediate table linking the users and roles.

Remember, since a role can belong to many users, we cannot simply place a `user_id` column on the `roles` table. This would mean that a role could only belong to a single user. In order to provide support for roles being assigned to multiple users, the `role_user` table is needed. We can summarize the relationship's table structure like so:

    users
        id - integer
        name - string

    roles
        id - integer
        name - string

    role_user
        user_id - integer
        role_id - integer

<a name="many-to-many-model-structure"></a>

## Model Structure

Many-to-many relationships are defined by writing a method that returns the result of the `belongsToMany` method. The `belongsToMany` method is provided by the `Illuminate\Database\Eloquent\Model` base class that is used by all of your application's Eloquent models. For example, let's define a `roles` method on our `User` model. The first argument passed to this method is the name of the related model class:

```typescript
class User extends Model {
  /**
   * The roles that belong to the user.
   */
  @BelongsToManyColumn({
    related: forwardRef(() => Role)
  })
  public roles: FedacoRelationType<Role[]>;
}
```

Once the relationship is defined, you may access the user's roles using the `roles` dynamic relationship property:

```typescript
const user = await User.createQuery().find(1);
for (const role of await user.roles) {
  //...
}
```

Since all relationships also serve as query builders, you may add further constraints to the relationship query by calling the `roles` method and continuing to chain conditions onto the query:

```typescript
const roles = User.createQuery().find(1).NewRelation('roles').orderBy('name').get();
```

To determine the table name of the relationship's intermediate table, Eloquent will join the two related model names in alphabetical order. However, you are free to override this convention. You may do so by passing a second argument to the `belongsToMany` method:

```typescript
class User extends Model {
  /**
   * The roles that belong to the user.
   */
  @BelongsToManyColumn({
    related: forwardRef(() => Role),
    table: 'role_user'
  })
  public roles: FedacoRelationType<Role[]>;
}
```

In addition to customizing the name of the intermediate table, you may also customize the column names of the keys on the table by passing additional arguments to the `belongsToMany` method. The third argument is the foreign key name of the model on which you are defining the relationship, while the fourth argument is the foreign key name of the model that you are joining to:

```typescript
class User extends Model {
  /**
   * The roles that belong to the user.
   */
  @BelongsToManyColumn({
    related: forwardRef(() => Role),
    table: 'role_user',
    foreignPivotKey: 'user_id',
    relatedPivotKey: 'role_id'
  })
  public roles: FedacoRelationType<Role[]>;
}
```

## Defining the Inverse of the Relationship

To define the "inverse" of a many-to-many relationship, you should define a annotation on the related model which is the `BelongsToManyColumn`. To complete our user / role example, let's define the `users` property on the `Role` model:

```typescript
class Role extends Model {
  /**
   * The users that belong to the role.
   */
  @BelongsToManyColumn({
    related: forwardRef(() => User)
  })
  public users: FedacoRelationType<User[]>
}
```

As you can see, the relationship is defined exactly the same as its `User` model counterpart with the exception of referencing the `User` model. Since we're reusing the `BelongsToManyColumn` annotation, all of the usual table and key customization options are available when defining the "inverse" of many-to-many relationships.

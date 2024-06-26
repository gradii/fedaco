### Retrieving Intermediate Table Columns

As you have already learned, working with many-to-many relations requires the presence of an intermediate table. Eloquent provides some very helpful ways of interacting with this table. For example, let's assume our `User` model has many `Role` models that it is related to. After accessing this relationship, we may access the intermediate table using the `pivot` attribute on the models:

```typescript


const user = await User.createQuery().find(1);

for(const role of await user.roles) {
  console.log(role.GetRelation('pivot').GetAttribute('created_at'))
}
```

Notice that each `Role` model we retrieve is automatically assigned a `pivot` attribute. This attribute contains a model representing the intermediate table.

By default, only the model keys will be present on the `pivot` model. If your intermediate table contains extra attributes, you must specify them when defining the relationship:

```typescript
@Table({
  tableName: 'users'
})
export class FedacoTestUserWithCustomFriendPivot extends FedacoTestUser {
  @BelongsToManyColumn({
    related        : FedacoTestUser,
    table          : 'friends',
    foreignPivotKey: 'user_id',
    relatedPivotKey: 'friend_id',
    onQuery        : (q: BelongsToMany) => {
      q.using(FedacoTestFriendPivot).withPivot('user_id', 'friend_id', 'friend_level_id');
    }
  })
  friends: FedacoRelationListType<FedacoTestUser>;
}
```

If you would like your intermediate table to have `created_at` and `updated_at` timestamps that are automatically maintained by Eloquent, call the `withTimestamps` method when defining the relationship:

```typescript
@Table({
  tableName: 'users'
})
export class FedacoTestUserWithCustomFriendPivot extends FedacoTestUser {
  @BelongsToManyColumn({
    related        : FedacoTestUser,
    table          : 'friends',
    foreignPivotKey: 'user_id',
    relatedPivotKey: 'friend_id',
    onQuery        : (q: BelongsToMany) => {
      q.withTimestamps();
    }
  })
  friends: FedacoRelationListType<FedacoTestUser>;
}
```

> [!WARNING]  
> Intermediate tables that utilize Fedaco's automatically maintained timestamps are required to have both `created_at` and `updated_at` timestamp columns.

## Customizing the `pivot` Attribute Name

As noted previously, attributes from the intermediate table may be accessed on models via the `pivot` attribute. However, you are free to customize the name of this attribute to better reflect its purpose within your application.

For example, if your application contains users that may subscribe to podcasts, you likely have a many-to-many relationship between users and podcasts. If this is the case, you may wish to rename your intermediate table attribute to `subscription` instead of `pivot`. This can be done using the `as` method when defining the relationship:
```typescript
@Table({
  tableName: 'users'
})
export class FedacoTestUserWithCustomFriendPivot extends FedacoTestUser {
  @BelongsToManyColumn({
    related        : FedacoTestUser,
    table          : 'friends',
    foreignPivotKey: 'user_id',
    relatedPivotKey: 'friend_id',
    onQuery        : (q: BelongsToMany) => {
      q.as('subscription').withTimestamps();
    }
  })
  friends: FedacoRelationListType<FedacoTestUser>;
}
```

Once the custom intermediate table attribute has been specified, you may access the intermediate table data using the customized name:
```typescript

const users = User.createQuery().with('podcasts').get();

for(const podcast of users.GetRelation('flatMap').GetAttribute('podcasts')) {
  podcast.GetRelation('subscription').getAttribute('created_at');
}
```

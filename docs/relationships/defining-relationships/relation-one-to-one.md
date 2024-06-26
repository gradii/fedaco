# Relation One To One

A one-to-one relationship is a very basic type of database relationship. For example, a `User` model might be associated with one `Phone` model. To define this relationship, we will place a `phone` property on the `User` model. The `phone` property should have `HasOneColumn` annotation.

```typescript
@Table({
  tableName: 'users',
})
class User extends Model {
  @HasOneColumn({
    related: forwardRef(() => Phone),
  })
  public phone: Promise<Phone> | Phone;
}
```

The related argument passed to the `HasOneColumn` annotation is the name of the related model class. 
if the class have circle reference problem,you can wrap it in forwardRef. 
Once the relationship is defined, we may retrieve the related record using Fedaco's property. property is promise if the retrieve the related model is lazy load:

```typescript
$phone = await (await User.createQuery().find(1)).phone;
```

Fedaco determines the foreign key of the relationship based on the parent model name. In this case, the `Phone` model is automatically assumed to have a `user_id` foreign key. If you wish to override this convention, you may define annotation argument to the `HasOneColumn` :

```typescript
@Table({
  tableName: 'users',
})
class User extends Model {
  @HasOneColumn({
    related: forwardRef(() => Phone),
    foreignKey: 'foreign_key',
  })
  public phone: Promise<Phone> | Phone;
}
```

Additionally, Fedaco assumes that the foreign key should have a value matching the primary key column of the parent. In other words, Fedaco will look for the value of the user's `id` column in the `user_id` column of the `Phone` record. If you would like the relationship to use a primary key value other than `id` or your model's `_primaryKey` property, you may pass local key argument to the `HasOneColumn` annotation:


```typescript
@Table({
  tableName: 'users',
})
class User extends Model {
  @HasOneColumn({
    related: forwardRef(() => Phone),
    foreignKey: 'foreign_key',
    localKey: 'local_key'
  })
  public phone: Promise<Phone> | Phone;
}
```

#### Defining the Inverse of the Relationship

So, we can access the `Phone` model from our `User` model. Next, let's define a relationship on the `Phone` model that will let us access the user that owns the phone. We can define the inverse of a `hasOne` relationship using the `BelongsToColumn` annotation:

```typescript
@Table({
  tableName: 'phones',
})
export class Phone extends Model {
  @PrimaryColumn()
  id: string | number;

  @BelongsToColumn({
    related   : FedacoTestUser,
  })
  public user: FedacoRelationType<User>;
}
```

When invoking the `user` method, Fedaco will attempt to find a `User` model that has an `id` which matches the `user_id` column on the `Phone` model.

Fedaco determines the foreign key name by examining the name of the relationship method and suffixing the method name with `_id`. So, in this case, Fedaco assumes that the `Phone` model has a `user_id` column. However, if the foreign key on the `Phone` model is not `user_id`, you may pass a custom key name as the foreign key config to the `BelongsToColumn` annotation:

```typescript
@Table({
  tableName: 'phones',
})
export class Phone extends Model {
  @PrimaryColumn()
  id: string | number;

  @BelongsToColumn({
    related   : FedacoTestUser,
    foreignKey: 'foreign_key'
  })
  public user: FedacoRelationType<User>;
}
```

If the parent model does not use `id` as its primary key, or you wish to find the associated model using a different column, you may pass a owner key config to the `BelongsToColumn` annotation specifying the parent table's custom key:


```typescript
@Table({
  tableName: 'phones',
})
export class Phone extends Model {
  @PrimaryColumn()
  id: string | number;

  @BelongsToColumn({
    related: FedacoTestUser,
    foreignKey: 'foreign_key',
    ownerKey: 'owner_key'
  })
  public user: FedacoRelationType<User>;
}
```

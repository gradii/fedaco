# Function Pluck
### pluck with column name containing a space

```typescript
await FedacoTestUserWithSpaceInColumnName.createQuery().create({
  id: 1,
  email_address: 'linbolen@gradii.com'
});
await FedacoTestUserWithSpaceInColumnName.createQuery().create({
  id: 2,
  email_address: 'xsilen@gradii.com'
});
const simple = await FedacoTestUserWithSpaceInColumnName.createQuery()
  .oldest('id')
  .pluck('users_with_space_in_colum_name.email_address');
const keyed = await FedacoTestUserWithSpaceInColumnName.createQuery()
  .oldest('id')
  .pluck('email_address', 'id');
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `keyed` | match | `({
      1: 'linbolen@gradii.com',
      2: 'xsilen@gradii.com'
    });` |


----
see also [prerequisites](./../database fedaco integration/prerequisite.md)

### pluck with join

```typescript
const user1 = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
const user2 = await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
await user2.newRelation('posts').create({
  id: 1,
  name: 'First post'
});
await user1.newRelation('posts').create({
  id: 2,
  name: 'Second post'
});
const query = FedacoTestUser.createQuery().join(
  'posts',
  'users.id',
  '=',
  'posts.user_id'
);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await query.pluck('posts.name', 'users.id')` | match | `({
      2: 'First post',
      1: 'Second post'
    });` |
> | `await query.pluck('posts.name', 'users.email AS user_email')` | match | `({
      'xsilen@gradii.com': 'First post',
      'linbolen@gradii.com' : 'Second post'
    });` |


----
see also [prerequisites](./../database fedaco integration/prerequisite.md)

### pluck

```typescript
await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
const simple = await FedacoTestUser.createQuery()
  .oldest('id')
  .pluck('users.email');
const keyed = await FedacoTestUser.createQuery()
  .oldest('id')
  .pluck('users.email', 'users.id');
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `keyed` | match | `({
      1: 'linbolen@gradii.com',
      2: 'xsilen@gradii.com'
    });` |


----
see also [prerequisites](./../database fedaco integration/prerequisite.md)

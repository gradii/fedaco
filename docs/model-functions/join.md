# Function Join
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
see also [prerequisites](./../database-fedaco-integration/prerequisite)

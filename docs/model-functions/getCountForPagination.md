# Function GetCountForPagination
### count for pagination with grouping and sub selects

```typescript
const user1 = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
await FedacoTestUser.createQuery().create({
  id: 3,
  email: 'foo@gmail.com'
});
await FedacoTestUser.createQuery().create({
  id: 4,
  email: 'foo@gmail.com'
});
const friendsRelation = user1.newRelation('friends');
await friendsRelation.create({
  id: 5,
  email: 'friend@gmail.com'
});
const query = await FedacoTestUser.createQuery()
  .select({
    0: 'id',
    friends_count: await FedacoTestUser.createQuery()
      .whereColumn('friend_id', 'user_id')
      .count()
  })
  .groupBy('email')
  .getQuery();
```


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### count for pagination with grouping

```typescript
await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
await FedacoTestUser.createQuery().create({
  id: 3,
  email: 'foo@gmail.com'
});
await FedacoTestUser.createQuery().create({
  id: 4,
  email: 'foo@gmail.com'
});
const query = FedacoTestUser.createQuery().groupBy('email').getQuery();
```


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

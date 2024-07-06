# Function Count
### basic model retrieval

```typescript
const factory = new FedacoTestUser();
await factory.NewQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await factory.NewQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `      await factory.NewQuery().where('email', 'linbolen@gradii.com').doesntExist()` | exactly match | `false` |
> | `      await factory.NewQuery().where('email', 'mohamed@laravel.com').doesntExist()` | exactly match | `true` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model.email` | exactly match | `'linbolen@gradii.com'` |
> | `model.email !== undefined` | exactly match | `true` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `friends !== undefined` | exactly match | `true` |
> | `friends` | match | `[]` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model` | instance type exactly match | `FedacoTestUser` |
> | `model.id` | match | `1` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model` | instance type exactly match | `FedacoTestUser` |
> | `model.id` | match | `2` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `missing` | exactly match | `Undefined();` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `isArray(collection)` | exactly match | `true` |
> | `collection.length` | exactly match | `0` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `isArray(collection)` | exactly match | `true` |
> | `collection.length` | exactly match | `2` |
```typescript
// .cursor();
for (const m of models) {
  expect(m.id).toEqual(1);
  expect(m.getConnectionName()).toBe('default');
}
```


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### check and create methods on multi connections

```typescript
await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await FedacoTestUser.useConnection('second_connection').find(
  FedacoTestUser.useConnection('second_connection').insert({
    id: 2,
    email: 'tony.stark@gradii.com'
  })
);
let user1 = await FedacoTestUser.useConnection('second_connection').findOrNew(
  1
);
let user2 = await FedacoTestUser.useConnection('second_connection').findOrNew(
  2
);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `user2._exists` | exactly match | `true` |
> | `user1.getConnectionName()` | exactly match | `'second_connection'` |
> | `user2.getConnectionName()` | exactly match | `'second_connection'` |
```typescript
user2 = await FedacoTestUser.useConnection('second_connection').firstOrNew({
  email: 'tony.stark@gradii.com'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `user2._exists` | exactly match | `true` |
> | `user1.getConnectionName()` | exactly match | `'second_connection'` |
> | `user2.getConnectionName()` | exactly match | `'second_connection'` |
> | `await FedacoTestUser.useConnection('second_connection').count()` | match | `1` |
```typescript
user2 = await FedacoTestUser.useConnection('second_connection').firstOrCreate({
  email: 'tony.stark@gradii.com'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `user2.getConnectionName()` | exactly match | `'second_connection'` |
> | `await FedacoTestUser.useConnection('second_connection').count()` | match | `2` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

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
const friendsRelation = user1.NewRelation('friends');
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

### multi inserts with different values

```typescript
const date = '1970-01-01';
const result = await FedacoTestPost.createQuery().insert([
  {
    user_id: 1,
    name: 'Post',
    created_at: date,
    updated_at: date
  },
  {
    user_id: 2,
    name: 'Post',
    created_at: date,
    updated_at: date
  }
]);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await FedacoTestPost.createQuery().count()` | match | `2` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### multi inserts with same values

```typescript
const date = '1970-01-01';
const result = await FedacoTestPost.createQuery().insert([
  {
    user_id: 1,
    name: 'Post',
    created_at: date,
    updated_at: date
  },
  {
    user_id: 1,
    name: 'Post',
    created_at: date,
    updated_at: date
  }
]);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await FedacoTestPost.createQuery().count()` | match | `2` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### save or fail

```typescript
const date = '1970-01-01';
const post = FedacoTestPost.initAttributes({
  user_id: 1,
  name: 'Post',
  created_at: date,
  updated_at: date
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await FedacoTestPost.createQuery().count()` | match | `1` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### update or create on different connection

```typescript
await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await FedacoTestUser.useConnection('second_connection').updateOrCreate(
  {
    email: 'linbolen@gradii.com'
  },
  {
    name: 'Taylor Otwell'
  }
);
await FedacoTestUser.useConnection('second_connection').updateOrCreate(
  {
    email: 'tony.stark@gradii.com'
  },
  {
    name: 'Mohamed Said'
  }
);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await FedacoTestUser.useConnection('second_connection').count()` | exactly match | `2` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### update or create

```typescript
const user1 = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const user2 = await FedacoTestUser.createQuery().updateOrCreate(
  {
    email: 'linbolen@gradii.com'
  },
  {
    name: 'Taylor Otwell'
  }
);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `user2.email` | exactly match | `'linbolen@gradii.com'` |
> | `user2.name` | exactly match | `'Taylor Otwell'` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `user3.name` | exactly match | `'Mohamed Said'` |
> | `await FedacoTestUser.createQuery().count()` | exactly match | `2` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

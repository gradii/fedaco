# Function Insert
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

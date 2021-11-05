# Function First Or Create
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
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### first or create

```typescript
const user1 = await FedacoTestUser.createQuery().firstOrCreate({
  email: 'linbolen@gradii.com'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `user1.name` | exactly match | `Undefined();` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `user2.id` | match | `user1.id` |
> | `user2.email` | exactly match | `'linbolen@gradii.com'` |
> | `user2.name` | exactly match | `null` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `expect(user1.id).not` | match | `user3.id` |
> | `user3.email` | exactly match | `'xsilen@gradii.com'` |
> | `user3.name` | exactly match | `'Abigail Otwell'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

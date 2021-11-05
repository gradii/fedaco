# Function Find
### basic model retrieval

```typescript
const factory = new FedacoTestUser();
await factory.newQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await factory.newQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `      await factory.newQuery().where('email', 'linbolen@gradii.com').doesntExist()` | exactly match false | `();` |
> | `      await factory.newQuery().where('email', 'mohamed@laravel.com').doesntExist()` | exactly match | `true` |


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
> | `model` | type exactly match | `FedacoTestUser` |
> | `model.id` | match | `1` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model` | type exactly match | `FedacoTestUser` |
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
see also [prerequisites](./../database fedaco integration/prerequisite.md)

### belongs to many custom pivot

```typescript
const john = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
  id: 1,
  name: 'John Doe',
  email: 'johndoe@example.com'
});
const jane = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
  id: 2,
  name: 'Jane Doe',
  email: 'janedoe@example.com'
});
const jack = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
  id: 3,
  name: 'Jack Doe',
  email: 'jackdoe@example.com'
});
const jule = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
  id: 4,
  name: 'Jule Doe',
  email: 'juledoe@example.com'
});
await FedacoTestFriendLevel.createQuery().create({
  id: 1,
  level: 'acquaintance'
});
await FedacoTestFriendLevel.createQuery().create({
  id: 2,
  level: 'friend'
});
await FedacoTestFriendLevel.createQuery().create({
  id: 3,
  level: 'bff'
});
await john.newRelation('friends').attach(jane, {
  friend_level_id: 1
});
await john.newRelation('friends').attach(jack, {
  friend_level_id: 2
});
await john.newRelation('friends').attach(jule, {
  friend_level_id: 3
});
const johnWithFriends = await FedacoTestUserWithCustomFriendPivot.createQuery()
  .with('friends')
  .find(1);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await (await johnWithFriends.friends.find(it => it.id === 3).getAttribute(      'pivot').level).level` | exactly match | `'friend'` |
> | `(await johnWithFriends.friends.find(it => it.id === 4).getAttribute(      'pivot').friend).name` | exactly match | `'Jule Doe'` |


----
see also [prerequisites](./../database fedaco integration/prerequisite.md)

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
see also [prerequisites](./../database fedaco integration/prerequisite.md)

### is after retrieving the same model

```typescript
const saved = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
const retrieved = await FedacoTestUser.createQuery().find(1);
```


----
see also [prerequisites](./../database fedaco integration/prerequisite.md)

# Function Get Connection Name
### basic model hydration

```typescript
let user = FedacoTestUser.initAttributes({
  email: 'linbolen@gradii.com'
});
user.setConnection('second_connection');
await user.save();
user = FedacoTestUser.initAttributes({
  email: 'xsilen@gradii.com'
});
user.setConnection('second_connection');
await user.save();
const models = await FedacoTestUser.useConnection(
  'second_connection'
).fromQuery('SELECT * FROM users WHERE email = ?', ['xsilen@gradii.com']);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `models[0]` | type exactly match | `FedacoTestUser` |
> | `models[0].email` | exactly match | `'xsilen@gradii.com'` |
> | `models[0].getConnectionName()` | exactly match | `'second_connection'` |
> | `models.length` | exactly match | `1` |


----
see also [prerequisites](./../database fedaco integration/prerequisite.md)

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

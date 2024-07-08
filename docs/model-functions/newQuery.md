# Function NewQuery
### basic create model

```typescript
const model = await new FedacoTestUser().NewQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model.email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### basic model collection retrieval

```typescript
await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
const models = await new FedacoTestUser().NewQuery().oldest('id').get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `isArray(models)` | exactly match | `true` |
> | `models[0]` | instance type exactly match | `FedacoTestUser` |
> | `models[1]` | instance type exactly match | `FedacoTestUser` |
> | `models[0].email` | exactly match | `'linbolen@gradii.com'` |
> | `models[1].email` | exactly match | `'xsilen@gradii.com'` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

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

### fresh method on model

```typescript
const now = new Date();
const nowSerialized = formatISO(startOfSecond(now));
const nowWithFractionsSerialized = now.toJSON();
// Carbon.setTestNow(now);
const storedUser1 = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com',
  birthday: now
});
await storedUser1.NewQuery().update({
  email: 'dev@mathieutu.ovh',
  name: 'Mathieu TUDISCO'
});
const freshStoredUser1 = await storedUser1.Fresh();
const storedUser2 = await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'linbolen@gradii.com',
  birthday: now
});
await storedUser2.NewQuery().update({
  email: 'dev@mathieutu.ovh'
});
const freshStoredUser2 = await storedUser2.Fresh();
const notStoredUser = FedacoTestUser.initAttributes({
  id: 3,
  email: 'linbolen@gradii.com',
  birthday: now
});
const freshNotStoredUser = await notStoredUser.Fresh();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `freshStoredUser1.toArray()` | match | `({
      'id'        : 1,
      'name'      : 'Mathieu TUDISCO',
      'email'     : 'dev@mathieutu.ovh',
      'birthday'  : nowWithFractionsSerialized,
      'created_at': nowSerialized,
      'updated_at': nowSerialized
    });` |
> | `storedUser1` | instance type exactly match | `FedacoTestUser` |
> | `storedUser2.toArray()` | match | `({
      'id'        : 2,
      'email'     : 'linbolen@gradii.com',
      'birthday'  : nowWithFractionsSerialized,
      'created_at': nowSerialized,
      'updated_at': nowSerialized
    });` |
> | `freshStoredUser2.toArray()` | match | `({
      'id'        : 2,
      'name'      : null,
      'email'     : 'dev@mathieutu.ovh',
      'birthday'  : nowWithFractionsSerialized,
      'created_at': nowSerialized,
      'updated_at': nowSerialized
    });` |
> | `storedUser2` | instance type exactly match | `FedacoTestUser` |
> | `notStoredUser.toArray()` | match | `({
      'id'      : 3,
      'email'   : 'linbolen@gradii.com',
      'birthday': nowWithFractionsSerialized
    });` |
> | `freshNotStoredUser` | exactly match | `null` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### paginated model collection retrieval when no elements and default per page

```typescript
const models = await new FedacoTestUser().NewQuery().oldest('id').paginate();
```


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### paginated model collection retrieval when no elements

```typescript
// Paginator.currentPageResolver(() => {
//   return 1;
// });
let models = await new FedacoTestUser().NewQuery().oldest('id').paginate(1, 2);
```
```typescript
// expect(models).toInstanceOf(LengthAwarePaginator);
// Paginator.currentPageResolver(() => {
//   return 2;
// });
models = await new FedacoTestUser().NewQuery().oldest('id').paginate(2, 2);
```


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### paginated model collection retrieval

```typescript
await new FedacoTestUser().NewQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await new FedacoTestUser().NewQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
await new FedacoTestUser().NewQuery().create({
  id: 3,
  email: 'foo@gmail.com'
});
// Paginator.currentPageResolver(() => {
//   return 1;
// });
let models = await new FedacoTestUser().NewQuery().oldest('id').paginate(1, 2);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `models.items[0]` | instance type exactly match | `FedacoTestUser` |
> | `models.items[1]` | instance type exactly match | `FedacoTestUser` |
> | `models.items[0].email` | exactly match | `'linbolen@gradii.com'` |
> | `models.items[1].email` | exactly match | `'xsilen@gradii.com'` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `models.items.length` | exactly match | `1` |
> | `models.items[0]` | instance type exactly match | `FedacoTestUser` |
> | `models.items[0].email` | exactly match | `'foo@gmail.com'` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

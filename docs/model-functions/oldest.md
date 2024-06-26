# Function Oldest
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
const models = await new FedacoTestUser().newQuery().oldest('id').get();
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

### paginated model collection retrieval when no elements and default per page

```typescript
const models = await new FedacoTestUser().newQuery().oldest('id').paginate();
```


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### paginated model collection retrieval when no elements

```typescript
// Paginator.currentPageResolver(() => {
//   return 1;
// });
let models = await new FedacoTestUser().newQuery().oldest('id').paginate(1, 2);
```
```typescript
// expect(models).toInstanceOf(LengthAwarePaginator);
// Paginator.currentPageResolver(() => {
//   return 2;
// });
models = await new FedacoTestUser().newQuery().oldest('id').paginate(2, 2);
```


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### paginated model collection retrieval

```typescript
await new FedacoTestUser().newQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await new FedacoTestUser().newQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
await new FedacoTestUser().newQuery().create({
  id: 3,
  email: 'foo@gmail.com'
});
// Paginator.currentPageResolver(() => {
//   return 1;
// });
let models = await new FedacoTestUser().newQuery().oldest('id').paginate(1, 2);
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
see also [prerequisites](./../database-fedaco-integration/prerequisite)

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
see also [prerequisites](./../database-fedaco-integration/prerequisite)

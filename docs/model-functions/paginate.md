# Function Paginate
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

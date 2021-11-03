## paginated model collection retrieval when no elements

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
see also [prerequisites](./prerequisite.md)

## morph to relations across database connections

```typescript
let item = null;
await FedacoTestItem.createQuery().create({
  id: 1
});
await FedacoTestOrder.createQuery().create({
  id: 1,
  item_type: 'FedacoTestItem',
  item_id: 1
});
try {
  const order = await FedacoTestOrder.createQuery().first();
  item = order.item;
} catch (e) {
  console.log(e);
}
```


----
see also [prerequisites](./prerequisite.md)

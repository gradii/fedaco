## count for pagination with grouping

```typescript
await FedacoTestUser.createQuery().create({
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
const query = FedacoTestUser.createQuery().groupBy('email').getQuery();
```


----
see also [prerequisites](./prerequisite.md)

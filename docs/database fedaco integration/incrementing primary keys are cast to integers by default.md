## incrementing primary keys are cast to integers by default

```typescript
await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const user = await FedacoTestUser.createQuery().first();
```


----
see also [prerequisites](./prerequisite.md)

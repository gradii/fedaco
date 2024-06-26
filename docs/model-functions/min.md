# Function Min
### aggregated values of datetime field

```typescript
await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'test1@test.test',
  created_at: '2021-08-10 09:21:00',
  updated_at: new Date()
});
await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'test2@test.test',
  created_at: '2021-08-01 12:00:00',
  updated_at: new Date()
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await FedacoTestUser.createQuery().min('created_at')` | exactly match | `'2021-08-01 12:00:00'` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

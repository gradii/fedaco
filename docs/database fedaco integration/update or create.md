## update or create

```typescript
const user1 = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const user2 = await FedacoTestUser.createQuery().updateOrCreate(
  {
    email: 'linbolen@gradii.com'
  },
  {
    name: 'Taylor Otwell'
  }
);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `user2.email` | exactly match | `'linbolen@gradii.com'` |
> | `user2.name` | exactly match | `'Taylor Otwell'` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `user3.name` | exactly match | `'Mohamed Said'` |
> | `await FedacoTestUser.createQuery().count()` | exactly match | `2` |


----
see also [prerequisites](./prerequisite.md)

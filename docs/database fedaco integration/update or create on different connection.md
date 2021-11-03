## update or create on different connection

```typescript
await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await FedacoTestUser.useConnection('second_connection').updateOrCreate(
  {
    email: 'linbolen@gradii.com'
  },
  {
    name: 'Taylor Otwell'
  }
);
await FedacoTestUser.useConnection('second_connection').updateOrCreate(
  {
    email: 'tony.stark@gradii.com'
  },
  {
    name: 'Mohamed Said'
  }
);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await FedacoTestUser.useConnection('second_connection').count()` | exactly match | `2` |


----
see also [prerequisites](./prerequisite.md)

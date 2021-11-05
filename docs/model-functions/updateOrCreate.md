# Function updateOrCreate
### update or create on different connection

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
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### update or create

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
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

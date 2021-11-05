# Function For Page After Id
### for page after id correctly paginates

```typescript
await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
let results = await FedacoTestUser.createQuery().forPageAfterId(15, 1);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `(await results.first()).id` | match | `2` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `results` | type exactly match | `FedacoBuilder` |
> | `(await results.first()).id` | match | `2` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

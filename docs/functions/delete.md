# Function Delete
### basic create model

```typescript
const model = await new FedacoTestUser().newQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model.email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

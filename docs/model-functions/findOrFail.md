# Function findOrFail
### find or fail with multiple ids throws model not found exception

```typescript
await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await expect(async () => {
  await FedacoTestUser.createQuery().findOrFail([1, 2]);
}).rejects.toThrowError(
  'ModelNotFoundException No query results for model [FedacoTestUser] [1,2]'
);
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### find or fail with single id throws model not found exception

```typescript
await expect(async () => {
  await FedacoTestUser.createQuery().findOrFail(1);
}).rejects.toThrowError(
  'ModelNotFoundException No query results for model [FedacoTestUser] 1'
);
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### find or fail

```typescript
await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
const single = await FedacoTestUser.createQuery().findOrFail(1);
const multiple = await FedacoTestUser.createQuery().findOrFail([1, 2]);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `single.email` | exactly match | `'linbolen@gradii.com'` |
> | `isArray(multiple)` | exactly match | `true` |
> | `multiple[0]` | instance type exactly match | `FedacoTestUser` |
> | `multiple[1]` | instance type exactly match | `FedacoTestUser` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

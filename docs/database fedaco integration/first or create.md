## first or create

```typescript
const user1 = await FedacoTestUser.createQuery().firstOrCreate({
  email: 'linbolen@gradii.com'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `user1.name` | exactly match | `Undefined();` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `user2.id` | match | `user1.id` |
> | `user2.email` | exactly match | `'linbolen@gradii.com'` |
> | `user2.name` | exactly match | `Null();` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `expect(user1.id).not` | match | `user3.id` |
> | `user3.email` | exactly match | `'xsilen@gradii.com'` |
> | `user3.name` | exactly match | `'Abigail Otwell'` |


----
see also [prerequisites](./prerequisite.md)

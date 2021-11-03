## multi inserts with same values

```typescript
const date = '1970-01-01';
const result = await FedacoTestPost.createQuery().insert([
  {
    user_id: 1,
    name: 'Post',
    created_at: date,
    updated_at: date
  },
  {
    user_id: 1,
    name: 'Post',
    created_at: date,
    updated_at: date
  }
]);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await FedacoTestPost.createQuery().count()` | match | `2` |


----
see also [prerequisites](./prerequisite.md)

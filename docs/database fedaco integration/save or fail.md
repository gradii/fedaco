## save or fail

```typescript
const date = '1970-01-01';
const post = FedacoTestPost.initAttributes({
  user_id: 1,
  name: 'Post',
  created_at: date,
  updated_at: date
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await FedacoTestPost.createQuery().count()` | match | `1` |


----
see also [prerequisites](./prerequisite.md)

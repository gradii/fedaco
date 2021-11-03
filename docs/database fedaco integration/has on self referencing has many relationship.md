## has on self referencing has many relationship

```typescript
const parentPost = await FedacoTestPost.createQuery().create({
  name: 'Parent Post',
  user_id: 1
});
await FedacoTestPost.createQuery().create({
  name: 'Child Post',
  parent_id: parentPost.id,
  user_id: 2
});
const results: FedacoTestPost[] = await FedacoTestPost.createQuery()
  .has('childPosts')
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).name` | exactly match | `'Parent Post'` |


----
see also [prerequisites](./prerequisite.md)

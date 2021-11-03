## has on nested self referencing belongs to relationship

```typescript
const grandParentPost = await FedacoTestPost.createQuery().create({
  name: 'Grandparent Post',
  user_id: 1
});
const parentPost = await FedacoTestPost.createQuery().create({
  name: 'Parent Post',
  parent_id: grandParentPost.id,
  user_id: 2
});
await FedacoTestPost.createQuery().create({
  name: 'Child Post',
  parent_id: parentPost.id,
  user_id: 3
});
const results: FedacoTestPost[] = await FedacoTestPost.createQuery()
  .has('parentPost.parentPost')
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).name` | exactly match | `'Child Post'` |


----
see also [prerequisites](./prerequisite.md)
